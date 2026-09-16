import { beforeAll, describe, expect, it } from "vitest"
import { installNodeWasmFetch } from "@/test/nodeWasmFetch"
import { makeTestPngFile } from "@/test/fixtures"
import { convert } from "../image"

installNodeWasmFetch()

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
}

/** Decodes with the real jSquash codec, independent of the code under test. */
async function decodeWith(format: string, data: ArrayBuffer) {
  const { default: decode } = await import(`@jsquash/${format}/decode.js`)
  return decode(data) as Promise<{ width: number; height: number }>
}

describe("convert (real WASM codecs, round-tripped through every supported pair)", () => {
  const SIZE = 8
  let sources: Record<string, File>

  beforeAll(async () => {
    const png = await makeTestPngFile("test.png", SIZE)
    const [jpeg, webp, avif] = await Promise.all([
      convert(png, "jpeg"),
      convert(png, "webp"),
      convert(png, "avif"),
    ])
    sources = {
      png,
      jpeg: new File([await jpeg.arrayBuffer()], "test.jpg", {
        type: "image/jpeg",
      }),
      webp: new File([await webp.arrayBuffer()], "test.webp", {
        type: "image/webp",
      }),
      avif: new File([await avif.arrayBuffer()], "test.avif", {
        type: "image/avif",
      }),
    }
  }, 30_000)

  const formats = ["png", "jpeg", "webp", "avif"]
  for (const from of formats) {
    for (const to of formats.filter((f) => f !== from)) {
      it(`converts ${from} -> ${to} into a real, decodable image`, async () => {
        const blob = await convert(sources[from], to)

        expect(blob.type).toBe(MIME_TYPES[to])
        expect(blob.size).toBeGreaterThan(0)

        const decoded = await decodeWith(to, await blob.arrayBuffer())
        expect(decoded.width).toBe(SIZE)
        expect(decoded.height).toBe(SIZE)
      }, 30_000)
    }
  }

  it("reports progress at 50% (decoded) and 100% (encoded)", async () => {
    const values: number[] = []
    await convert(sources.png, "webp", (v) => values.push(v))
    expect(values).toEqual([50, 100])
  })

  it("rejects files whose format it doesn't recognize", async () => {
    const textFile = new File(["hello"], "notes.txt", { type: "text/plain" })
    await expect(convert(textFile, "png")).rejects.toThrow(
      /unsupported source image format/i,
    )
  })

  it("rejects unknown target formats", async () => {
    await expect(convert(sources.png, "bmp")).rejects.toThrow(
      /unsupported target image format/i,
    )
  })
})
