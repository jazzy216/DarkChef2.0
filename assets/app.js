import {
  b64enc, b64dec, urlenc, urldec, hexenc, hexdec, sha256hex,
  aesGcmEncrypt, aesGcmDecrypt
} from "./crypto.js";

const $ = (id) => document.getElementById(id);

const input = $("input");
const output = $("output");
const password = $("password");
const aiOut = $("aiOut");

function setOut(v) { output.value = v ?? ""; }

async function runOp(op) {
  const v = input.value ?? "";
  try {
    switch (op) {
      case "b64enc": return setOut(b64enc(v));
      case "b64dec": return setOut(b64dec(v));
      case "urlenc": return setOut(urlenc(v));
      case "urldec": return setOut(urldec(v));
      case "hexenc": return setOut(hexenc(v));
      case "hexdec": return setOut(hexdec(v));
      case "sha256": return setOut(await sha256hex(v));
      case "aesgcm_enc": {
        if (!password.value) throw new Error("Set a password for AES-GCM.");
        return setOut(await aesGcmEncrypt(v, password.value));
      }
      case "aesgcm_dec": {
        if (!password.value) throw new Error("Set a password for AES-GCM.");
        return setOut(await aesGcmDecrypt(v, password.value));
      }
      default: throw new Error("Unknown op: " + op);
    }
  } catch (e) {
    setOut("ERROR: " + (e?.message ?? String(e)));
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-op]");
  if (btn) runOp(btn.dataset.op);
});

$("swap").onclick = () => { const t = input.value; input.value = output.value; output.value = t; };
$("clear").onclick = () => { input.value = ""; output.value = ""; aiOut.textContent = ""; };
$("copy").onclick = async () => { await navigator.clipboard.writeText(output.value); };

async function callAI(kind) {
  aiOut.textContent = "Working…";
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, text: input.value })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "AI error");
  aiOut.textContent = data.result;
}

$("aiExplain").onclick = () => callAI("explain").catch(e => aiOut.textContent = "ERROR: " + e.message);
$("aiSuggest").onclick = () => callAI("recipe").catch(e => aiOut.textContent = "ERROR: " + e.message);
