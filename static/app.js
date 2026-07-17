/* ============================================================
   GeoTrace – app.js  (Main dashboard logic)
   ============================================================ */

'use strict';

/* ── Element references ────────────────────────────────── */
const el = {
  consent:      document.querySelector('#consent'),
  start:        document.querySelector('#start-sharing'),
  stop:         document.querySelector('#stop-sharing'),
  status:       document.querySelector('#location-status'),
  shareResult:  document.querySelector('#share-result'),
  shareUrl:     document.querySelector('#share-url'),
  copyLink:     document.querySelector('#copy-link'),
  expiresAt:    document.querySelector('#expires-at'),
  mapBadge:     document.querySelector('#map-badge'),
  coordDisplay: document.querySelector('#coord-display'),
  phoneForm:    document.querySelector('#phone-form'),
  phone:        document.querySelector('#phone'),
  phoneStatus:  document.querySelector('#phone-status'),
  phoneResult:  document.querySelector('#phone-result'),

  // Threat card values
  displayIp:      document.querySelector('#display-ip'),
  displayBrowser: document.querySelector('#display-browser'),
  displayLang:    document.querySelector('#display-lang'),
  displayTz:      document.querySelector('#display-tz'),
  displayScreen:  document.querySelector('#display-screen'),
  displayGps:     document.querySelector('#display-gps'),
};

let shareId  = null;
let watchId  = null;
let leafMap  = null;
let mapMarker = null;
let mapCircle = null;

/* ── Passive fingerprint (no permission needed) ──────────── */
function populatePassiveData() {
  // Browser / OS
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (/Edg\//.test(ua))        browser = 'Edge';
  else if (/OPR\//.test(ua))   browser = 'Opera';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua)) browser = 'Safari';
  let os = 'Unknown';
  if (/Windows/.test(ua))   os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Mac/.test(ua))  os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  el.displayBrowser.textContent = `${browser} / ${os}`;

  // Language
  el.displayLang.textContent = navigator.language || 'Unknown';

  // Timezone
  el.displayTz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';

  // Screen
  el.displayScreen.textContent = `${screen.width}×${screen.height}`;

  // IP address – fetch from a public echo service
  fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => { el.displayIp.textContent = d.ip || 'Unavailable'; })
    .catch(() => { el.displayIp.textContent = 'Unavailable'; });
}

/* ── Leaflet map (index page) ───────────────────────────── */
function initMap() {
  if (!document.querySelector('#map')) return;
  leafMap = L.map('map', { zoomControl: true }).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(leafMap);
}

function updateMap(lat, lng, accuracy) {
  if (!leafMap) return;

  if (!mapMarker) {
    const icon = L.divIcon({
      className: '',
      html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px #3b82f6aa;"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
    mapMarker = L.marker([lat, lng], { icon }).addTo(leafMap);
    mapMarker.bindPopup(`<strong>Your simulated location</strong><br>Accuracy: ±${Math.round(accuracy)}m`);
  } else {
    mapMarker.setLatLng([lat, lng]);
    mapMarker.getPopup().setContent(`<strong>Your simulated location</strong><br>Accuracy: ±${Math.round(accuracy)}m`);
  }

  if (mapCircle) leafMap.removeLayer(mapCircle);
  mapCircle = L.circle([lat, lng], {
    radius: accuracy, color: '#3b82f6', fillColor: '#3b82f6',
    fillOpacity: 0.1, weight: 1,
  }).addTo(leafMap);

  leafMap.setView([lat, lng], 15);

  // Update coords display
  el.coordDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}  ±${Math.round(accuracy)}m`;
  el.displayGps.textContent   = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  // Map badge
  el.mapBadge.textContent = '● LIVE';
  el.mapBadge.classList.add('live');
}

/* ── Status helpers ─────────────────────────────────────── */
function setStatus(msg, kind = '') {
  el.status.textContent  = msg;
  el.status.className    = `status-msg ${kind}`;
}

function setPhoneStatus(msg, kind = '') {
  el.phoneStatus.textContent = msg;
  el.phoneStatus.className   = `status-msg ${kind}`;
}

/* ── Fetch helper ───────────────────────────────────────── */
async function apiRequest(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function locationPayload(position) {
  return {
    latitude:  position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy:  position.coords.accuracy,
    consent:   true,
  };
}

/* ── Share controls ─────────────────────────────────────── */
function updateControls(active) {
  el.start.disabled = active;
  el.stop.disabled  = !active;
}

function locationError(error) {
  const msgs = {
    1: 'Location permission denied. Nothing was shared.',
    2: 'Device could not determine location. Try again outside.',
    3: 'Location request timed out.',
  };
  setStatus(msgs[error.code] || 'Could not start location sharing.', 'error');
  updateControls(false);
}

async function sendLocation(position, creating = false) {
  const url    = creating ? '/api/location-shares' : `/api/location-shares/${encodeURIComponent(shareId)}`;
  const method = creating ? 'POST' : 'PATCH';
  const data   = await apiRequest(url, { method, body: JSON.stringify(locationPayload(position)) });

  updateMap(position.coords.latitude, position.coords.longitude, position.coords.accuracy);

  if (creating) {
    shareId = data.share_id;
    el.shareUrl.value    = new URL(data.share_path, window.location.origin).href;
    el.shareResult.hidden = false;
    el.expiresAt.textContent = `Link expires at ${new Date(data.expires_at).toLocaleString()}.`;
    setStatus('Location sharing is active. Share the link only with trusted people.', 'success');
  } else {
    setStatus('Location updated.', 'success');
  }
}

function beginWatching() {
  watchId = navigator.geolocation.watchPosition(
    pos => sendLocation(pos).catch(err => setStatus(err.message, 'error')),
    locationError,
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
  );
}

async function startSharing() {
  if (!el.consent.checked) {
    setStatus('Check the consent box before starting.', 'error');
    return;
  }
  if (!navigator.geolocation) {
    setStatus('This browser does not support geolocation.', 'error');
    return;
  }
  el.start.disabled = true;
  setStatus('Waiting for browser location permission…');
  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        await sendLocation(pos, true);
        updateControls(true);
        beginWatching();
      } catch (err) {
        setStatus(err.message, 'error');
        updateControls(false);
      }
    },
    locationError,
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
  );
}

async function stopSharing() {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  const id = shareId;
  shareId = null;
  updateControls(false);
  el.mapBadge.textContent = 'Stopped';
  el.mapBadge.classList.remove('live');
  if (!id) return;
  try {
    await apiRequest(`/api/location-shares/${encodeURIComponent(id)}`, { method: 'DELETE' });
    el.shareResult.hidden = true;
    el.shareUrl.value     = '';
    setStatus('Sharing stopped and link revoked.', 'success');
  } catch (err) {
    setStatus(`Stopped locally, but server revoke failed: ${err.message}`, 'error');
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(el.shareUrl.value);
    el.copyLink.textContent = 'Copied!';
    setTimeout(() => { el.copyLink.textContent = 'Copy'; }, 2000);
  } catch {
    el.shareUrl.focus(); el.shareUrl.select();
    setStatus('Select the link and copy it manually.');
  }
}

/* ── Phone metadata ─────────────────────────────────────── */
function renderMetadata(meta) {
  const fields = [
    ['Valid',                 meta.valid ? '✅ Yes' : '❌ No'],
    ['Formatted Number',      meta.formatted_number],
    ['Country / Region',      meta.country_or_region],
    ['Country Code',          meta.country_code ? `+${meta.country_code}` : null],
    ['Number Type',           meta.number_type],
    ['Geographic Area',       meta.geographic_description],
    ['Carrier',               meta.carrier],
    ['⚠️ Important Notice',  meta.notice],
  ];
  el.phoneResult.replaceChildren();
  fields.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value || 'Not available';
    el.phoneResult.append(dt, dd);
  });
  el.phoneResult.hidden = false;
}

/* ── Event listeners ────────────────────────────────────── */
if (el.start)    el.start.addEventListener('click', startSharing);
if (el.stop)     el.stop.addEventListener('click', stopSharing);
if (el.copyLink) el.copyLink.addEventListener('click', copyLink);

if (el.phoneForm) {
  el.phoneForm.addEventListener('submit', async e => {
    e.preventDefault();
    el.phoneResult.hidden = true;
    setPhoneStatus('Looking up public metadata…');
    try {
      const meta = await apiRequest('/api/phone-metadata', {
        method: 'POST',
        body: JSON.stringify({ phone: el.phone.value }),
      });
      renderMetadata(meta);
      setPhoneStatus('✅ Metadata retrieved. The number was not stored.', 'success');
    } catch (err) {
      setPhoneStatus(err.message, 'error');
    }
  });
}

/* ── Boot ───────────────────────────────────────────────── */
populatePassiveData();
initMap();
