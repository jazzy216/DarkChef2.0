const te = new TextEncoder();
const td = new TextDecoder();

export function b64enc(s) {
  return btoa(unescape(encodeURIComponent(s)));
}
export function b64dec(s) {
  return decodeURIComponent(escape(atob(s.trim())));
}
export function urlenc(s) { return encodeURIComponent(s); }
export function urldec(s) { return decodeURIComponent(s); }

export function hexenc(s) {
  const bytes = te.encode(s);
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}
export function hexdec(hex) {
  const clean = hex.replace(/\s+/g, "").toLowerCase();
  if (clean.length % 2) throw new Error("Hex length must be even.");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i*2, i*2+2), 16);
  return td.decode(bytes);
}

export async function sha256hex(s) {
  const hash = await crypto.subtle.digest("SHA-256", te.encode(s));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// AES-GCM helpers (password -> key via PBKDF2). Output is base64 JSON.
async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", te.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function aesGcmEncrypt(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(plaintext));

  const payload = {
    v: 1,
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    ct: btoa(String.fromCharCode(...new Uint8Array(ct)))
  };
  return btoa(JSON.stringify(payload));
}

export async function aesGcmDecrypt(b64payload, password) {
  const payload = JSON.parse(atob(b64payload.trim()));
  const salt = Uint8Array.from(atob(payload.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(payload.ct), c => c.charCodeAt(0));
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return td.decode(pt);
}
