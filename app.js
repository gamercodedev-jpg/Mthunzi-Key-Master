/* Mthunzi-Admin Key Generator (offline-first PWA)
   NOTE: Anything in client-side JS can be extracted. If the salt must be secret,
   the generator must live on a backend you control.
*/

const SALT = 'Mthunzi_Stephen_Zulu_2026_Secure';

const elDeviceId = document.getElementById('deviceId');
const elGenerate = document.getElementById('generate');
const elCopy = document.getElementById('copy');
const elClear = document.getElementById('clear');
const elKey = document.getElementById('key');
const elToast = document.getElementById('toast');
const elInstall = document.getElementById('install');

let deferredInstallPrompt = null;

function toast(message) {
  elToast.textContent = message;
  elToast.classList.add('is-visible');
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => elToast.classList.remove('is-visible'), 1800);
}

function normalizeDeviceId(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

function hexFromBuffer(buf) {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

function formatKeyFrom8Digits(eightDigits) {
  const clean = String(eightDigits || '').replace(/\D/g, '').slice(0, 8);
  if (clean.length < 8) return '----';
  return clean.match(/.{1,4}/g).join('-');
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return hexFromBuffer(digest);
}

async function generateKey(deviceId) {
  const normalized = normalizeDeviceId(deviceId);
  if (!normalized) throw new Error('Enter a Device ID');

  const hashHex = await sha256Hex(`${normalized}${SALT}`);
  // Take first 8 hex characters (32 bits) then convert to an 8-digit code.
  const first8Hex = hashHex.slice(0, 8);
  const n = parseInt(first8Hex, 16);
  const code = String(n % 100000000).padStart(8, '0');
  return formatKeyFrom8Digits(code);
}

async function copyText(text) {
  if (!text || text === '----') throw new Error('Nothing to copy');

  // Clipboard API
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('Copy failed');
}

async function onGenerate() {
  try {
    elGenerate.disabled = true;
    const key = await generateKey(elDeviceId.value);
    elKey.textContent = key;
    elCopy.disabled = (key === '----');
    toast('Key generated');
  } catch (e) {
    elKey.textContent = '----';
    elCopy.disabled = true;
    toast(e?.message || 'Failed');
  } finally {
    elGenerate.disabled = false;
  }
}

async function onCopy() {
  try {
    await copyText(elKey.textContent);
    toast('Copied');
  } catch (e) {
    toast(e?.message || 'Copy failed');
  }
}

function onClear() {
  elDeviceId.value = '';
  elKey.textContent = '----';
  elCopy.disabled = true;
  elDeviceId.focus();
}

elGenerate.addEventListener('click', onGenerate);
elCopy.addEventListener('click', onCopy);
elClear.addEventListener('click', onClear);

elDeviceId.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') onGenerate();
});

// PWA install button (Android/Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (elInstall) elInstall.hidden = false;
});

if (elInstall) {
  elInstall.addEventListener('click', async () => {
    try {
      if (!deferredInstallPrompt) {
        toast('Install not available here. Open in Chrome/Safari.');
        return;
      }
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      elInstall.hidden = true;
    } catch {
      toast('Install failed');
    }
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (elInstall) elInstall.hidden = true;
  toast('Installed');
});

// Register service worker for offline-first
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js', { scope: './' });
    } catch {
      // ignore
    }
  });
}
