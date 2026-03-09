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
  }
}

function placeMarkers(data) {
  data.forEach((place) => {
    const [long, lat] = place.location.coordinates;
    L.marker([lat, long]).addTo(map);
  });
}
