import { formatOf } from "./config"
import type { ConvertFn } from "./types"

type Encoder = (data: ImageData) => Promise<ArrayBuffer>

const ENCODERS: Record<string, () => Promise<Encoder>> = {
  png: async () => (await import("@jsquash/png")).encode,
  jpeg: async () => (await import("@jsquash/jpeg")).encode,
  webp: async () => (await import("@jsquash/webp")).encode,
  avif: async () => (await import("@jsquash/avif")).encode,
}

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
}

let resvgReady: Promise<typeof import("@resvg/resvg-wasm")> | null = null

/**
 * resvg-wasm's `initWasm` throws if called more than once, and it needs an
 * explicit wasm source (unlike jSquash's codecs, it has no built-in default
 * path) — the relative URL below mirrors how jSquash locates its own .wasm
 * files, which Vite resolves to a bundled asset at build time.
 */
function loadResvg() {
  resvgReady ??= (async () => {
    const resvg = await import("@resvg/resvg-wasm")
    const wasmUrl = new URL(
      "../../node_modules/@resvg/resvg-wasm/index_bg.wasm",
      import.meta.url,
    )
    await resvg.initWasm(fetch(wasmUrl))
    return resvg
  })()
  return resvgReady
}

export const convert: ConvertFn = async (file, to, onProgress) => {
  const source = formatOf(file)
  if (source?.id !== "svg") {
    throw new Error(
      `Unsupported source vector format: ${file.type || file.name}`,
    )
  }
  const targetEncoder = ENCODERS[to]
  if (!targetEncoder) {
    throw new Error(`Unsupported target raster format: ${to}`)
  }

  const [{ Resvg }, encode] = await Promise.all([loadResvg(), targetEncoder()])

  const svg = await file.text()
  const rendered = new Resvg(svg, { fitTo: { mode: "original" } }).render()
  const imageData: ImageData = {
    data: new Uint8ClampedArray(rendered.pixels),
    width: rendered.width,
    height: rendered.height,
    colorSpace: "srgb",
  }
  rendered.free()
  onProgress?.(50)

  const encoded = await encode(imageData)
  onProgress?.(100)

  return new Blob([encoded], { type: MIME_TYPES[to] })
}
