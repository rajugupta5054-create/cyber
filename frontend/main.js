/* ============================================================
   PhoneTrace – main.js
   Handles: phone lookup, Truecaller setup, saved contacts
   ============================================================ */
'use strict';

/* ── Element refs ───────────────────────────────────────── */
const el = {
  phoneForm:     document.querySelector('#phone-form'),
  phone:         document.querySelector('#phone'),
  phoneStatus:   document.querySelector('#phone-status'),
  btnText:       document.querySelector('#btn-text'),
  submitBtn:     document.querySelector('#phone-submit-btn'),

  resultContainer: document.querySelector('#result-container'),
  nameBanner:      document.querySelector('#name-banner'),
  nameAvatar:      document.querySelector('#name-avatar'),
  nameMain:        document.querySelector('#name-main'),
  nameSource:      document.querySelector('#name-source'),
  detailGrid:      document.querySelector('#detail-grid'),

  savePanel:     document.querySelector('#save-name-panel'),
  saveInput:     document.querySelector('#save-name-input'),
  saveBtn:       document.querySelector('#save-name-btn'),

  contactsPanel: document.querySelector('#contacts-panel'),
  contactsList:  document.querySelector('#contacts-list'),
  clearBtn:      document.querySelector('#clear-contacts-btn'),

  tcCard:        document.querySelector('#tc-card'),
  tcStatusBadge: document.querySelector('#tc-status-badge'),
  tcHeaderBadge: document.querySelector('#tc-header-badge'),
  tcLoginStep:   document.querySelector('#tc-login-step'),
  tcOtpStep:     document.querySelector('#tc-otp-step'),
  tcConnected:   document.querySelector('#tc-connected-state'),
  tcPhone:       document.querySelector('#tc-phone'),
  tcSendOtpBtn:  document.querySelector('#tc-send-otp-btn'),
  tcOtp:         document.querySelector('#tc-otp'),
  tcVerifyBtn:   document.querySelector('#tc-verify-otp-btn'),
  tcLoginStatus: document.querySelector('#tc-login-status'),
  tcOtpStatus:   document.querySelector('#tc-otp-status'),
  tcLogoutBtn:   document.querySelector('#tc-logout-btn'),
};

let _lastE164 = null;

/* ── Utilities ──────────────────────────────────────────── */
function setStatus(msg, kind = '') {
  el.phoneStatus.textContent = msg;
  el.phoneStatus.className = `status-msg ${kind}`;
}
function setTcStatus(msg, kind, target) {
  if (!target) return;
  target.textContent = msg;
  target.className = `status-msg ${kind}`;
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

/* ── Contacts (localStorage) ────────────────────────────── */
const STORE = 'phonetrace_contacts';
const loadContacts = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; } };
const saveContacts = c => localStorage.setItem(STORE, JSON.stringify(c));
const getNameFor   = e164 => loadContacts()[e164] || null;

function saveNameFor(e164, name) {
  const c = loadContacts(); c[e164] = name; saveContacts(c);
  renderContacts();
}
function deleteContact(e164) {
  const c = loadContacts(); delete c[e164]; saveContacts(c);
  renderContacts();
}
function renderContacts() {
  if (!el.contactsList) return;
  const entries = Object.entries(loadContacts());
  el.contactsPanel.hidden = entries.length === 0;
  el.contactsList.replaceChildren();
  entries.forEach(([e164, name]) => {
    const row = document.createElement('div');
    row.className = 'contact-row';
    row.innerHTML = `
      <span class="contact-name">${name}</span>
      <span class="contact-number">${e164}</span>
      <div class="contact-actions">
        <button class="btn-tiny" data-lookup="${e164}">🔍</button>
        <button class="btn-tiny-danger" data-del="${e164}">✕</button>
      </div>`;
    row.querySelector('[data-lookup]').addEventListener('click', () => {
      el.phone.value = e164;
      el.phoneForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    row.querySelector('[data-del]').addEventListener('click', () => deleteContact(e164));
    el.contactsList.appendChild(row);
  });
}

/* ── Save name ──────────────────────────────────────────── */
if (el.saveBtn) {
  el.saveBtn.addEventListener('click', () => {
    const name = (el.saveInput.value || '').trim();
    if (!name || !_lastE164) { el.saveInput.focus(); return; }
    saveNameFor(_lastE164, name);
    el.savePanel.hidden = true;
    // Update name banner immediately
    showNameBanner(name, '💾 Saved locally');
    setStatus(`✅ "${name}" saved for ${_lastE164}`, 'success');
  });
}

if (el.clearBtn) {
  el.clearBtn.addEventListener('click', () => {
    if (confirm('Delete all saved contacts?')) { saveContacts({}); renderContacts(); }
  });
}

/* ── Render helpers ─────────────────────────────────────── */
function showNameBanner(name, source) {
  if (!name) { el.nameBanner.hidden = true; return; }
  el.nameBanner.hidden = false;
  el.nameAvatar.textContent = name.charAt(0).toUpperCase();
  el.nameMain.textContent   = name;
  el.nameSource.textContent = source || '';
}

function badge(val) {
  if (typeof val === 'boolean') {
    return val
      ? '<span class="badge badge-yes">✓ Yes</span>'
      : '<span class="badge badge-no">✗ No</span>';
  }
  return `<span class="detail-value">${val}</span>`;
}

function makeBadgeFlags(flags) {
  return flags.filter(([,v]) => v).map(([l]) => `<span class="badge badge-flag">${l}</span>`).join(' ');
}

function addCard(title, rows) {
  if (!rows.some(([, v]) => v !== null && v !== undefined && v !== '')) return;
  const card = document.createElement('div');
  card.className = 'detail-card';
  card.innerHTML = `<div class="detail-card-title">${title}</div>`;
  rows.forEach(([label, value, mono]) => {
    if (value === null || value === undefined || value === '') return;
    const row = document.createElement('div');
    row.className = 'detail-row';
    if (typeof value === 'boolean') {
      row.innerHTML = `<span class="detail-label">${label}</span>${badge(value)}`;
    } else if (label === '__flags__') {
      row.innerHTML = `<span>${value}</span>`;
      row.style.paddingTop = '4px';
    } else {
      row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value${mono?' mono':''}">${value}</span>`;
    }
    card.appendChild(row);
  });
  el.detailGrid.appendChild(card);
}

/* ── Main render ─────────────────────────────────────────── */
function renderResult(meta) {
  _lastE164 = meta.e164 || null;
  const savedName = getNameFor(meta.e164);
  const displayName = meta.truecaller_name || savedName || null;
  const nameSource  = meta.truecaller_name ? '📞 via Truecaller' : (savedName ? '💾 Saved locally' : '');

  // Show result container
  el.resultContainer.hidden = false;

  // Name banner
  showNameBanner(displayName, nameSource);

  // Save panel
  if (el.savePanel) el.savePanel.hidden = !!displayName;

  // Build detail cards
  el.detailGrid.replaceChildren();

  // 1. Validity
  addCard('✅ Validity', [
    ['Valid Number',    meta.valid],
    ['Possible Number', meta.is_possible],
  ]);

  // 2. Formats
  addCard('📋 Formats', [
    ['International', meta.formatted_number],
    ['National',      meta.national_format],
    ['E.164',         meta.e164, true],
    ['RFC 3966',      meta.rfc3966, true],
    ['Prefix (4-dig)',meta.number_prefix, true],
    ['NSN',           meta.national_significant_number, true],
    ['Extension',     meta.extension, true],
  ]);

  // 3. Geography
  addCard('🌍 Geography', [
    ['Country',        meta.country_or_region],
    ['Dial Code',      meta.country_code ? `+${meta.country_code}` : null],
    ['Area',           meta.geographic_description],
    ['Timezone',       meta.timezone],
    ['Telecom Circle', meta.india_telecom_circle],
  ]);

  // 4. Line Type
  const flagsHtml = makeBadgeFlags([
    ['📱 Mobile',    meta.is_mobile],
    ['🏠 Landline',  meta.is_landline],
    ['📞 Toll-Free', meta.is_tollfree],
    ['💻 VoIP',      meta.is_voip],
    ['💎 Premium',   meta.is_premium],
  ]);
  addCard('📱 Line Type', [
    ['Type',    meta.number_type],
    ['__flags__', flagsHtml || null],
  ]);

  // 5. Carrier
  addCard('📶 Carrier', [
    ['Carrier (EN)', meta.carrier],
    ['Carrier (HI)', meta.carrier_local],
  ]);

  // 6. Truecaller
  if (meta.truecaller_active) {
    addCard('📞 Truecaller', [
      ['Name Found',   meta.truecaller_name || '—'],
      ['Status',       meta.truecaller_error ? `Error: ${meta.truecaller_error}` : 'Lookup complete'],
    ]);
  }
}

/* ── Phone form ──────────────────────────────────────────── */
if (el.phoneForm) {
  el.phoneForm.addEventListener('submit', async e => {
    e.preventDefault();
    const phone = (el.phone.value || '').trim();
    if (!phone) { setStatus('Enter a phone number.', 'error'); el.phone.focus(); return; }

    el.submitBtn.disabled = true;
    el.btnText.textContent = '⏳ Looking up…';
    setStatus('Fetching details…');
    el.resultContainer.hidden = true;

    try {
      const meta = await api('/api/phone-metadata', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      renderResult(meta);
      const name = meta.truecaller_name || getNameFor(meta.e164);
      if (meta.truecaller_name) {
        setStatus(`✅ Name found via Truecaller: ${meta.truecaller_name}`, 'success');
      } else if (name) {
        setStatus(`✅ Details loaded. Known contact: ${name}`, 'success');
      } else {
        setStatus('✅ Details loaded. Save a name to track this number.', 'success');
      }
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      el.submitBtn.disabled = false;
      el.btnText.textContent = '🔍 Analyse';
    }
  });
}

/* ── Truecaller setup ────────────────────────────────────── */
function updateTcUI(connected) {
  const onBadge = '✅ Connected', offBadge = 'Not Connected';
  if (el.tcStatusBadge) {
    el.tcStatusBadge.textContent = connected ? onBadge : offBadge;
    el.tcStatusBadge.className = `tc-badge ${connected ? 'tc-badge-on' : 'tc-badge-off'}`;
  }
  if (el.tcHeaderBadge) {
    el.tcHeaderBadge.textContent = connected ? '📞 Truecaller: On' : 'Truecaller: Off';
    el.tcHeaderBadge.className = `tc-mini-badge ${connected ? 'tc-on' : 'tc-off'}`;
  }
  if (el.tcLoginStep)  el.tcLoginStep.hidden  =  connected;
  if (el.tcOtpStep)   el.tcOtpStep.hidden    =  true;
  if (el.tcConnected) el.tcConnected.hidden  = !connected;
}

async function checkTcStatus() {
  try {
    const s = await api('/api/truecaller/status', { method: 'GET' });
    updateTcUI(s.setup);
  } catch { updateTcUI(false); }
}

if (el.tcSendOtpBtn) {
  el.tcSendOtpBtn.addEventListener('click', async () => {
    const phone = (el.tcPhone.value || '').trim();
    if (!phone) { setTcStatus('Enter your phone number.', 'error', el.tcLoginStatus); return; }
    el.tcSendOtpBtn.disabled = true;
    setTcStatus('Sending OTP…', '', el.tcLoginStatus);
    try {
      await api('/api/truecaller/login', { method: 'POST', body: JSON.stringify({ phone }) });
      setTcStatus('✅ OTP sent! Check your phone.', 'success', el.tcLoginStatus);
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
    setTcStatus('Verifying…', '', el.tcOtpStatus);
    try {
      await api('/api/truecaller/verify', { method: 'POST', body: JSON.stringify({ otp }) });
      setTcStatus('✅ Connected!', 'success', el.tcOtpStatus);
      setTimeout(() => updateTcUI(true), 700);
    } catch (err) {
      setTcStatus(err.message, 'error', el.tcOtpStatus);
      el.tcVerifyBtn.disabled = false;
    }
  });
}

if (el.tcLogoutBtn) {
  el.tcLogoutBtn.addEventListener('click', async () => {
    await fetch('/api/truecaller/logout', { method: 'DELETE' });
    updateTcUI(false);
  });
}

/* ── Boot ───────────────────────────────────────────────── */
renderContacts();
checkTcStatus();
