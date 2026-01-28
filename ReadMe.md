# DarkChef (CyberChef-style Web Tool)

DarkChef is a lightweight, CyberChef-style utility for transforming and inspecting text (encodings, hashes, and local AES-GCM crypto) with an optional AI helper endpoint for “explain/suggest recipe” workflows.

## Features

### Local (no API key, runs in-browser)
- Base64 encode/decode
- URL encode/decode
- Hex encode/decode
- SHA-256 hashing
- AES-256-GCM encrypt/decrypt (WebCrypto + PBKDF2-derived key)

### Optional AI Helper (server-side only)
- Explain suspicious text (what it might be, what to try next)
- Suggest safe transform “recipes” (step-by-step)

AI calls run through a Vercel Serverless Function so your OpenAI key is never exposed to the browser.

## Project Structure (recommended for Vercel)

