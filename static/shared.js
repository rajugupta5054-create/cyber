/* ============================================================
   GeoTrace – shared.js  (Viewer page for live location feed)
   ============================================================ */

'use strict';

const SHARE_ID   = document.body.dataset.shareId;
const POLL_MS    = 10_000;

let leafMap    = null;
let mapMarker  = null;
let mapCircle  = null;
let pollTimer  = null;
let firstLoad  = true;

const el = {
  status:    document.querySelector('#shared-status'),
  liveBadge: document.querySelector('#live-badge'),
  coordDisp: document.querySelector('#coord-display'),
  accDisp:   document.querySelector('#accuracy-display'),
  updDisp:   document.querySelector('#updated-display'),
  expDisp:   document.querySelector('#expires-display'),
};

/* ── Init Leaflet map ─────────────────────────────────── */
function initMap() {
  leafMap = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(leafMap);
}

function setLiveBadge(state) {
  const badge = el.liveBadge;
  badge.className = 'live-badge';
  if (state === 'live')  { badge.textContent = '● LIVE';    badge.classList.add('live');  }
  if (state === 'error') { badge.textContent = '✕ Offline'; badge.classList.add('error'); }
  if (state === 'wait')  { badge.textContent = '⏳ Loading...'; }
}

function setStatus(msg, kind = '') {
  el.status.textContent = msg;
  el.status.className   = `status-msg ${kind}`;
}

/* ── Update map & info cards ──────────────────────────── */
function renderLocation(data) {
  const { latitude: lat, longitude: lng, accuracy, updated_at, expires_at } = data;

  // Map
  if (!mapMarker) {
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:20px;height:20px;
        background:#3b82f6;border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(59,130,246,.3), 0 0 20px #3b82f6aa;
        animation: geopulse 1.5s ease-in-out infinite;
      "></div>
      <style>
        @keyframes geopulse {
          0%,100%{box-shadow:0 0 0 4px rgba(59,130,246,.3),0 0 20px #3b82f6aa}
          50%{box-shadow:0 0 0 10px rgba(59,130,246,.05),0 0 30px #3b82f6dd}
        }
      </style>`,
      iconSize: [20, 20], iconAnchor: [10, 10],
    });
    mapMarker = L.marker([lat, lng], { icon }).addTo(leafMap)
      .bindPopup(`<strong>Shared Location</strong><br>Accuracy: ±${Math.round(accuracy)}m`).openPopup();
  } else {
    mapMarker.setLatLng([lat, lng]);
    mapMarker.getPopup().setContent(`<strong>Shared Location</strong><br>Accuracy: ±${Math.round(accuracy)}m`);
  }

  if (mapCircle) leafMap.removeLayer(mapCircle);
  mapCircle = L.circle([lat, lng], {
    radius: accuracy, color: '#3b82f6',
    fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1,
  }).addTo(leafMap);

  if (firstLoad) { leafMap.setView([lat, lng], 15); firstLoad = false; }
  else { leafMap.panTo([lat, lng]); }

  // Info cards
  el.coordDisp.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  el.accDisp.textContent   = `±${Math.round(accuracy)} metres`;
  el.updDisp.textContent   = new Date(updated_at).toLocaleTimeString();
  el.expDisp.textContent   = new Date(expires_at).toLocaleString();
}

/* ── Poll the API ─────────────────────────────────────── */
async function fetchLocation() {
  try {
    const res = await fetch(`/api/location-shares/${encodeURIComponent(SHARE_ID)}`);
    if (res.status === 404) {
      clearInterval(pollTimer);
      setStatus('This share link has expired or was revoked.', 'error');
      setLiveBadge('error');
      return;
    }
    if (!res.ok) throw new Error('Server error.');
    const data = await res.json();
    renderLocation(data);
    setStatus('Live location received.', 'success');
    setLiveBadge('live');
  } catch (err) {
    setStatus(`Could not fetch location: ${err.message}`, 'error');
    setLiveBadge('error');
  }
}

/* ── Boot ─────────────────────────────────────────────── */
initMap();
setLiveBadge('wait');
setStatus('Connecting to live location feed…');
fetchLocation();
pollTimer = setInterval(fetchLocation, POLL_MS);
