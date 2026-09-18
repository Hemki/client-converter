<p align="center">
  <img src="public/favicon.svg" width="120" alt="Client Converter logo">
</p>

<h1 align="center">Client Converter</h1>

<p align="center">
  Convert your files entirely in the browser — nothing is ever uploaded.
</p>

<p align="center">
  <a href="https://hemki.github.io/client-converter/"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live demo"></a>
  <a href="https://github.com/Hemki/client-converter/actions/workflows/ci.yml"><img src="https://github.com/Hemki/client-converter/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Hemki/client-converter" alt="License"></a>
  <img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite 8">
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA ready">
</p>

## About

Client Converter converts files locally in your browser using Web Workers and
WebAssembly — nothing gets uploaded to a server. Drop in one or more files and
convert them on the spot; images (PNG, JPEG, WebP, AVIF) and SVG rendering
(SVG → PNG/JPEG/WebP/AVIF) are supported today, with more categories
(documents, spreadsheets, audio, video) planned.

It's installable as a PWA and works offline.

**[Try it live →](https://hemki.github.io/client-converter/)**

## Getting started

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

Runs on [Vitest](https://vitest.dev/). Config-routing logic (`src/converters/config.ts`)
is covered by plain unit tests. The image converter (`src/converters/image.ts`) is
covered end-to-end: real jSquash/WASM codecs decode and re-encode a generated test
image across every supported PNG/JPEG/WebP/AVIF pair, then an independent decode
verifies the output is a valid image of the right size — no mocking of the codecs.

## Tech stack

- [React](https://react.dev/) + TypeScript + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Web Workers, with one worker per file conversion
- WebAssembly image codecs via [jSquash](https://github.com/jamsinclair/jSquash)
- SVG rendering via [resvg-wasm](https://github.com/yisibl/resvg-js)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for offline/installable support

## License

MIT © Jonas Hemkendreis — see [LICENSE](LICENSE).
