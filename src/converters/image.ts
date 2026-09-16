import { formatOf } from "./config"
import type { ConvertFn } from "./types"

type Codec = {
  decode: (data: ArrayBuffer) => Promise<ImageData>
  encode: (data: ImageData) => Promise<ArrayBuffer>
}

const CODECS: Record<string, () => Promise<Codec>> = {
  png: async () => {
    const mod = await import("@jsquash/png")
    return { decode: mod.decode, encode: mod.encode }
  },
  jpeg: async () => {
    const mod = await import("@jsquash/jpeg")
    return { decode: mod.decode, encode: mod.encode }
  },
  webp: async () => {
    const mod = await import("@jsquash/webp")
    return { decode: mod.decode, encode: mod.encode }
  },
  avif: async () => {
    const mod = await import("@jsquash/avif")
    return {
      decode: async (data: ArrayBuffer) => {
        const image = await mod.decode(data)
        if (!image) throw new Error("Failed to decode AVIF image.")
        return image
      },
      encode: mod.encode,
    }
  },
}

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
}

export const convert: ConvertFn = async (file, to, onProgress) => {
  const source = formatOf(file)
  const sourceCodec = source && CODECS[source.id]
  const targetCodec = CODECS[to]
  if (!sourceCodec) {
    throw new Error(
      `Unsupported source image format: ${file.type || file.name}`,
    )
  }
  if (!targetCodec) {
    throw new Error(`Unsupported target image format: ${to}`)
  }

  const [{ decode }, { encode }] = await Promise.all([
    sourceCodec(),
    targetCodec(),
  ])
  const imageData = await decode(await file.arrayBuffer())
  onProgress?.(50)

  const encoded = await encode(imageData)
  onProgress?.(100)

  return new Blob([encoded], { type: MIME_TYPES[to] })
}
