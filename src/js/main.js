"use strict";

/**
 * @file Detta program skapar en karta med hjälp av Leaflet, och hämtar information om badplatser från Sundsvalls kommuns öppna data.
 * Badplatserna är utmarkerade på kartan och datat förser användaren, utöver visuell demonstration för placering, med beskrivningar
 * av platserna samt ev. temperatur i vattnet och när detta senast kontrollerades.
 * @author Josefine Backlund <josefine.backlund@hotamil.com>
 */

//Skapar karta med Sundsvall som standard-position.
let map = L.map("map").setView([62.39129, 17.3063], 9);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy;OpenStreetMap",
}).addTo(map);

//Kartinnehåll och laddningsanimation.
const mapContent = document.querySelector("#map");
const loader = document.querySelector("#loading");

document.addEventListener("DOMContentLoaded", collectData);

/**
 *
 * @typedef {object} mapData
 * @property {string} name - Namn på strand
 * @property {string} description - Beskrivning av badplats
 * @property {location} location
 * @property {waterQuality} [waterQuality] - Inte alltid inkluderad
 */

/**
 *
 * @typedef {object} location
 * @property {number[]} coordinates - [long, lat]
 */

/**
 *
 * @typedef {object} waterQuality
 * @property {number} temperature - Temperaturen i vattnet
 * @property {string} dateObserved - Datum och tid för när temperaturen kontrollerades
 */

/**
 * Hämtar information om badplatser i json-format som skickas vidare till placeMarkers.
 * Skriver ut felmeddelanden till användaren vid behov.
 *
 * @async
 * @returns {Promise<void>}
 */

async function collectData() {
  const url =
    "https://api.sundsvall.se/opendata/1.0/beaches?fields=waterquality,description";

  try {
    const response = await fetch(url);
    const mapData = await response.json();
    placeMarkers(mapData.data);
  } catch (error) {
    console.error("Fel: " + error);
    //Skapar felmeddelande om API:et krånglar.
    const errorEl = document.querySelector("#error");
    const errorMessage = document.createElement("p");
    const errorMessageContent = document.createTextNode(
      "Det verkar inte finnas några platser att hämta just nu, försök igen om en liten stund!",
    );
    errorMessage.appendChild(errorMessageContent);
    errorMessage.classList.add("error");
    errorMessage.classList.add("textandicon");
    errorEl.appendChild(errorMessage);
  } finally {
    //Justerar klasser för att ta bort laddningsanimation och visa kartan.
    loader.classList.add("hidden");
    mapContent.classList.remove("seethrough");
  }
}

/**
 * Placerar ut markörer med hjälp av lat och long som skickats från collectData.
 * Eventlyssnare med klick skapas för varje markör.
 *
 * @param {mapData[]} data - Information om badplatser, till exempel namn och koordinater
 * @returns {void}
 */

function placeMarkers(data) {
  data.forEach((place) => {
    //Placerar om long och lat så att formatet stämmer för leaflet.
    const [long, lat] = place.location.coordinates;
    L.marker([lat, long])
      .addTo(map)
      .addEventListener("click", () => writeInfo(place));
  });
}

/**
 * Skapar och skriver ut information i form av html-element för varje badplats.
 *
 * @param {mapData} place - Information om badplatser, till exempel namn och koordinater
 * @returns {void}
 */

function writeInfo(place) {
  const informationHolder = document.querySelector("#infocontainer");
  const informationEl = document.createElement("section");
  informationHolder.innerHTML = "";

  const beachTitle = document.createElement("h3");
  beachTitle.classList.add("textandicon");
  beachTitle.setAttribute("id", "beachtitle");
  const beachIcon = document.createElement("img");
  beachIcon.setAttribute("src", "/ikoner/swimming.svg");
  beachIcon.setAttribute("alt", "");
  beachTitle.appendChild(beachIcon);
  const BeachTitleText = document.createTextNode(place.name);
  beachTitle.appendChild(BeachTitleText);

  const beachInfo = document.createElement("p");
  //Justering av datat så att det ser bättre ut när det skrivs ut.
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
  //För att slippa null-värden placeras waterQuality i en if-sats.
  if (place.waterQuality) {
    const tempTitle = document.createElement("h3");
    const tempTitleText = document.createTextNode("Senast mätta temperatur:");
    tempTitle.appendChild(tempTitleText);

    const dateAndTime = document.createElement("p");
    dateAndTime.classList.add("textandicon");
    const dateAndTimeIcon = document.createElement("img");
    dateAndTimeIcon.setAttribute("src", "/ikoner/time.svg");
    dateAndTimeIcon.setAttribute("alt", "");
    //Justering av formatet för en snyggare utskrift.
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
  //En delay för att transition-effekten ska hinna synas.
  setTimeout(() => {
    informationEl.classList.add("show");
  }, 20);
}
