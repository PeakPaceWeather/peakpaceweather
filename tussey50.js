// tussey50.js

async function initMap() {
  const data = await fetch("https://raw.githubusercontent.com/dillondurinick/peakpaceweather/refs/heads/main/tussey50coords.json")
    .then(res => res.json());

  const trackPoints = data.trackPoints;
  const aidStations = data.aidStations;

  const map = L.map('map').setView(trackPoints[0], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const routeLine = L.polyline(trackPoints, { color: 'blue' }).addTo(map);
  map.fitBounds(routeLine.getBounds());

  aidStations.forEach(station => {
    const marker = L.circleMarker([station.lat, station.lon], {
      radius: 6,
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.7
    }).addTo(map);

    marker.bindTooltip(`
      <strong>${station.name}</strong><br/>
      Leg: ${station.legName}
    `, { direction: 'top', offset: [0, -5] });
  });

  return { trackPoints, aidStations };
}

function generateForecastTable(aidStations) {
  const tbody = document.querySelector("#forecastTable tbody");
  tbody.innerHTML = "";

  const startTimeInput = document.getElementById("raceStartTime").value;
  const paceMin = parseInt(document.getElementById("paceMinutes").value) || 0;
  const paceSec = parseInt(document.getElementById("paceSeconds").value) || 0;
  const paceSeconds = paceMin * 60 + paceSec;

  if (!startTimeInput || paceSeconds <= 0) {
    alert("Please enter race start time and average pace.");
    return;
  }

  let cumulativeDistance = 0;
  aidStations.forEach(station => {
    cumulativeDistance += Math.random() * 3 + 3;
    const eta = new Date(new Date(startTimeInput).getTime() + cumulativeDistance * paceSeconds * 60 * 1000);

    const temp = Math.floor(Math.random() * 30) + 50;
    const wind = Math.floor(Math.random() * 15) + " mph";
    const precip = Math.random() < 0.2 ? (Math.random() * 0.2).toFixed(2) : 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${station.name}</td>
      <td>${station.legName}</td>
      <td>${eta.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</td>
      <td>${temp}</td>
      <td>${wind}</td>
      <td>${precip}</td>
    `;
    tbody.appendChild(row);
  });
}

let mapData;
initMap().then(data => { mapData = data; });

document.getElementById("generateForecast").addEventListener("click", () => {
  if (!mapData) return;
  generateForecastTable(mapData.aidStations);
});
