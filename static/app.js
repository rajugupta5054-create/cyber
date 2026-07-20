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
  phoneForm:       document.querySelector('#phone-form'),
  phone:           document.querySelector('#phone'),
  phoneStatus:     document.querySelector('#phone-status'),
  phoneResult:     document.querySelector('#phone-result'),
  saveNamePanel:   document.querySelector('#save-name-panel'),
  saveNameInput:   document.querySelector('#save-name-input'),
  saveNameBtn:     document.querySelector('#save-name-btn'),
  contactsPanel:   document.querySelector('#contacts-panel'),
  contactsList:    document.querySelector('#contacts-list'),
  clearContactsBtn:document.querySelector('#clear-contacts-btn'),

  // Truecaller setup
  tcStatusBadge:   document.querySelector('#tc-status-badge'),
  tcLoginStep:     document.querySelector('#tc-login-step'),
  tcOtpStep:       document.querySelector('#tc-otp-step'),
  tcConnected:     document.querySelector('#tc-connected-state'),
  tcPhone:         document.querySelector('#tc-phone'),
  tcSendOtpBtn:    document.querySelector('#tc-send-otp-btn'),
  tcOtp:           document.querySelector('#tc-otp'),
  tcVerifyBtn:     document.querySelector('#tc-verify-otp-btn'),
  tcLoginStatus:   document.querySelector('#tc-login-status'),
  tcOtpStatus:     document.querySelector('#tc-otp-status'),
  tcLogoutBtn:     document.querySelector('#tc-logout-btn'),

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

/* ── Contacts (localStorage) ───────────────────────────── */
const CONTACTS_KEY = 'geotrace_contacts';

function loadContacts() {
  try { return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '{}'); }
  catch { return {}; }
}

function saveContacts(contacts) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

function getNameForNumber(e164) {
  return loadContacts()[e164] || null;
}

function saveNameForNumber(e164, name) {
  const contacts = loadContacts();
  contacts[e164] = name;
  saveContacts(contacts);
  renderContactsList();
}

function deleteContact(e164) {
  const contacts = loadContacts();
  delete contacts[e164];
  saveContacts(contacts);
  renderContactsList();
}

function renderContactsList() {
  if (!el.contactsList) return;
  const contacts = loadContacts();
  const entries = Object.entries(contacts);
  if (entries.length === 0) {
    el.contactsPanel.hidden = true;
    return;
  }
  el.contactsPanel.hidden = false;
  el.contactsList.replaceChildren();
  entries.forEach(([e164, name]) => {
    const row = document.createElement('div');
    row.className = 'contact-row';
    row.innerHTML = `
      <span class="contact-name">${name}</span>
      <span class="contact-number">${e164}</span>
      <div class="contact-actions">
        <button class="btn-tiny" data-e164="${e164}">🔍 Lookup</button>
        <button class="btn-tiny-danger" data-del="${e164}">✕</button>
      </div>`;
    row.querySelector('[data-e164]').addEventListener('click', () => {
      el.phone.value = e164;
      el.phone.closest('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      document.querySelector('#phone-section').scrollIntoView({ behavior: 'smooth' });
    });
    row.querySelector('[data-del]').addEventListener('click', () => deleteContact(e164));
    el.contactsList.appendChild(row);
  });
}

/* ── Phone metadata ─────────────────────────────────────── */
let _lastE164 = null;

function renderMetadata(meta, name) {
  _lastE164 = meta.e164 || null;

  // Truecaller name takes priority over local saved name
  const displayName = meta.truecaller_name || name || null;
  const nameSource  = meta.truecaller_name ? '\ud83d\udcde Truecaller' : (name ? '\ud83d\udcbe Saved' : null);

  const fields = [
    ['\ud83d\udc64 Name',             displayName ? `${displayName}${nameSource ? '  (' + nameSource + ')' : ''}` : null],
    ['\u2705 Valid',                 meta.valid ? 'Yes' : 'Possibly valid'],
    ['\ud83d\udcf1 International',   meta.formatted_number],
    ['E.164',                        meta.e164],
    ['National Format',              meta.national_format],
    ['\ud83c\udf0d Country / Region',meta.country_or_region],
    ['Country Code',                 meta.country_code ? `+${meta.country_code}` : null],
    ['Number Type',                  meta.number_type],
    ['\ud83d\udccd Geographic Area', meta.geographic_description],
    ['\ud83d\udcf6 Carrier',         meta.carrier],
    ['\u26a0\ufe0f Notice',          meta.notice],
  ];
  el.phoneResult.replaceChildren();
  fields.forEach(([label, value]) => {
    if (!value) return;
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    if (label.includes('Name')) {
      dt.style.color = 'var(--accent)';
      dd.style.fontWeight = '700';
      dd.style.fontSize = '1.1em';
      dd.style.color = '#fff';
    }
    el.phoneResult.append(dt, dd);
  });
  el.phoneResult.hidden = false;

  // Show save-name panel only if no name found at all
  if (el.saveNamePanel && _lastE164) {
    if (displayName) {
      el.saveNamePanel.hidden = true;
      if (el.saveNameInput) el.saveNameInput.value = displayName;
    } else {
      el.saveNamePanel.hidden = false;
      if (el.saveNameInput) el.saveNameInput.value = '';
    }
  }
}

/* ── Event listeners ────────────────────────────────────── */
if (el.start)    el.start.addEventListener('click', startSharing);
if (el.stop)     el.stop.addEventListener('click', stopSharing);
if (el.copyLink) el.copyLink.addEventListener('click', copyLink);

// Save name button
if (el.saveNameBtn) {
  el.saveNameBtn.addEventListener('click', () => {
    const name = (el.saveNameInput.value || '').trim();
    if (!name) { el.saveNameInput.focus(); return; }
    if (!_lastE164) return;
    saveNameForNumber(_lastE164, name);
    el.saveNamePanel.hidden = true;
    // Re-render with name shown
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = '\ud83d\udc64 Name';
    dd.textContent = name;
    dt.style.color = 'var(--accent)';
    dd.style.fontWeight = '700';
    dd.style.fontSize = '1.1em';
    dd.style.color = '#fff';
    el.phoneResult.prepend(dd, dt);
    setPhoneStatus(`\u2705 Name "${name}" saved for ${_lastE164}`, 'success');
  });
}

// Clear all contacts
if (el.clearContactsBtn) {
  el.clearContactsBtn.addEventListener('click', () => {
    if (confirm('Delete all tracked contacts?')) {
      saveContacts({});
      renderContactsList();
    }
  });
}

if (el.phoneForm) {
  el.phoneForm.addEventListener('submit', async e => {
    e.preventDefault();
    el.phoneResult.hidden = true;
    if (el.saveNamePanel) el.saveNamePanel.hidden = true;

    const phoneValue = (el.phone.value || '').trim();
    if (!phoneValue) {
      setPhoneStatus('Please enter a phone number, e.g. 8248389588 or +91 98765 43210.', 'error');
      el.phone.focus();
      return;
    }

    setPhoneStatus('Looking up\u2026 (Truecaller name lookup may take a moment)');
    try {
      const meta = await apiRequest('/api/phone-metadata', {
        method: 'POST',
        body: JSON.stringify({ phone: phoneValue }),
      });
      const savedName = getNameForNumber(meta.e164);
      renderMetadata(meta, savedName);
      const nameFound = meta.truecaller_name || savedName;
      if (meta.truecaller_name) {
        setPhoneStatus(`\u2705 Name found via Truecaller: ${meta.truecaller_name}`, 'success');
      } else if (savedName) {
        setPhoneStatus(`\u2705 Metadata retrieved. Known contact: ${savedName}`, 'success');
      } else if (meta.truecaller_active) {
        setPhoneStatus('\u2705 Metadata retrieved. Truecaller returned no name for this number.', 'success');
      } else {
        setPhoneStatus('\u2705 Metadata retrieved. Connect Truecaller above to get the caller name automatically.', 'success');
      }
    } catch (err) {
      setPhoneStatus(err.message, 'error');
    }
  });
}

/* ── Truecaller Setup ───────────────────────────────────── */
function setTcStatus(msg, kind, el_) {
  if (!el_) return;
  el_.textContent = msg;
  el_.className = `status-msg ${kind}`;
}

async function loadTcStatus() {
  try {
    const s = await apiRequest('/api/truecaller/status', { method: 'GET' });
    if (s.setup) {
      showTcConnected();
    } else {
      showTcLogin();
    }
  } catch { showTcLogin(); }
}

function showTcConnected() {
  if (el.tcStatusBadge) { el.tcStatusBadge.textContent = '✅ Connected'; el.tcStatusBadge.className = 'tc-badge tc-badge-on'; }
  if (el.tcLoginStep)  el.tcLoginStep.hidden  = true;
  if (el.tcOtpStep)   el.tcOtpStep.hidden    = true;
  if (el.tcConnected) el.tcConnected.hidden  = false;
}

function showTcLogin() {
  if (el.tcStatusBadge) { el.tcStatusBadge.textContent = 'Not Connected'; el.tcStatusBadge.className = 'tc-badge tc-badge-off'; }
  if (el.tcLoginStep)  el.tcLoginStep.hidden  = false;
  if (el.tcOtpStep)   el.tcOtpStep.hidden    = true;
  if (el.tcConnected) el.tcConnected.hidden  = true;
}

if (el.tcSendOtpBtn) {
  el.tcSendOtpBtn.addEventListener('click', async () => {
    const phone = (el.tcPhone.value || '').trim();
    if (!phone) { setTcStatus('Enter your phone number.', 'error', el.tcLoginStatus); return; }
    el.tcSendOtpBtn.disabled = true;
    setTcStatus('Sending OTP\u2026', '', el.tcLoginStatus);
    try {
      await apiRequest('/api/truecaller/login', { method: 'POST', body: JSON.stringify({ phone }) });
      setTcStatus('\u2705 OTP sent! Check your phone.', 'success', el.tcLoginStatus);
      el.tcLoginStep.hidden = true;
      el.tcOtpStep.hidden   = false;
      el.tcOtp.focus();
    } catch (err) {
      setTcStatus(err.message, 'error', el.tcLoginStatus);
      el.tcSendOtpBtn.disabled = false;
    }
  });
}

if (el.tcVerifyBtn) {
  el.tcVerifyBtn.addEventListener('click', async () => {
    const otp = (el.tcOtp.value || '').trim();
    if (!otp) { setTcStatus('Enter the OTP.', 'error', el.tcOtpStatus); return; }
    el.tcVerifyBtn.disabled = true;
    setTcStatus('Verifying\u2026', '', el.tcOtpStatus);
    try {
      await apiRequest('/api/truecaller/verify', { method: 'POST', body: JSON.stringify({ otp }) });
      setTcStatus('\u2705 Connected!', 'success', el.tcOtpStatus);
      setTimeout(showTcConnected, 800);
    } catch (err) {
      setTcStatus(err.message, 'error', el.tcOtpStatus);
      el.tcVerifyBtn.disabled = false;
    }
  });
}

if (el.tcLogoutBtn) {
  el.tcLogoutBtn.addEventListener('click', async () => {
    await fetch('/api/truecaller/logout', { method: 'DELETE' });
    showTcLogin();
  });
}

/* ── Boot ───────────────────────────────────────────────── */
populatePassiveData();
initMap();
renderContactsList();
loadTcStatus();
