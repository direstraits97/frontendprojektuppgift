"use strict";

/**
 * @file Detta program skapar en karta med hjälp av Leaflet, och hämtar information om badplatser från Sundsvalls kommuns öppna data.
 * Badplatserna är utmarkerade på kartan och datat förser användaren, utöver visuell demonstration för placering, med beskrivningar
 * av platserna samt ev. temperatur i vattnet och när detta senast kontrollerades.
 * @author Josefine Backlund <josefine.backlund@hotamil.com>
 */

let map = L.map("map").setView([62.39129, 17.3063], 9);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy;OpenStreetMap",
}).addTo(map);

const mapContent = document.querySelector("#map");
const loader = document.querySelector("#loading");

document.addEventListener("DOMContentLoaded", collectData);

async function collectData() {
  const url =
    "https://api.sundsvall.se/opendata/1.0/beaches?fields=waterquality,description";

  try {
    const response = await fetch(url);
    const mapData = await response.json();
    placeMarkers(mapData.data);
  } catch (error) {
    console.error("Fel: " + error);
  } finally {
    loader.classList.add("hidden");
    mapContent.classList.remove("seethrough");
  }
}

function placeMarkers(data) {
  data.forEach((place) => {
    const [long, lat] = place.location.coordinates;
    L.marker([lat, long])
      .addTo(map)
      .addEventListener("click", () => writeInfo(place));
  });
}
function writeInfo(place) {
  const informationHolder = document.querySelector("#infocontainer");
  const informationEl = document.createElement("section");
  informationHolder.innerHTML = "";

  const beachTitle = document.createElement("h3");
  beachTitle.classList.add("textandicon");
  const beachIcon = document.createElement("img");
  beachIcon.setAttribute("src", "/ikoner/swimming.svg");
  beachIcon.setAttribute("alt", "");
  beachTitle.appendChild(beachIcon);
  const BeachTitleText = document.createTextNode(place.name);
  beachTitle.appendChild(BeachTitleText);

  const beachInfo = document.createElement("p");
  const infoText = document.createTextNode(
    place.description
      .replaceAll("\\r", "")
      .replaceAll("\\n", "")
      .replaceAll("\\", ""),
  );
  beachInfo.appendChild(infoText);

  informationEl.appendChild(beachTitle);
  informationEl.appendChild(beachInfo);
  informationHolder.appendChild(informationEl);

  if (place.waterQuality) {
    const tempTitle = document.createElement("h3");
    const tempTitleText = document.createTextNode("Senast mätta temperatur:");
    tempTitle.appendChild(tempTitleText);

    const dateAndTime = document.createElement("p");
    dateAndTime.classList.add("textandicon");
    const dateAndTimeIcon = document.createElement("img");
    dateAndTimeIcon.setAttribute("src", "/ikoner/time.svg");
    dateAndTimeIcon.setAttribute("alt", "");
    const dateAndTimeText = document.createTextNode(
      place.waterQuality.dateObserved.replace("T", " ").slice(0, 16),
    );
    dateAndTime.appendChild(dateAndTimeIcon);
    dateAndTime.appendChild(dateAndTimeText);

    const temp = document.createElement("p");
    temp.classList.add("textandicon");
    const tempIcon = document.createElement("img");
    tempIcon.setAttribute("src", "/ikoner/thermostat.svg");
    tempIcon.setAttribute("alt", "");
    const tempText = document.createTextNode(
      place.waterQuality.temperature + "°C",
    );
    temp.appendChild(tempIcon);
    temp.appendChild(tempText);

    informationEl.appendChild(tempTitle);
    informationEl.appendChild(dateAndTime);
    informationEl.appendChild(temp);
    informationHolder.appendChild(informationEl);
  }
  setTimeout(() => {
    informationEl.classList.add("show");
  }, 20);
}
