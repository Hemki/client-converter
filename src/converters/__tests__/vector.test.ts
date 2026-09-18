import { beforeAll, describe, expect, it } from "vitest"
import { installNodeWasmFetch } from "@/test/nodeWasmFetch"
import { makeTestSvgFile } from "@/test/fixtures"
import { convert } from "../vector"

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

describe("convert (real resvg-wasm + jSquash codecs)", () => {
  const SIZE = 16
  let svg: File

  beforeAll(() => {
    svg = makeTestSvgFile("test.svg", SIZE)
  })

  const formats = ["png", "jpeg", "webp", "avif"]
  for (const to of formats) {
    it(`renders svg -> ${to} into a real, decodable image`, async () => {
      const blob = await convert(svg, to)

      expect(blob.type).toBe(MIME_TYPES[to])
      expect(blob.size).toBeGreaterThan(0)

      const decoded = await decodeWith(to, await blob.arrayBuffer())
      expect(decoded.width).toBe(SIZE)
      expect(decoded.height).toBe(SIZE)
    }, 30_000)
  }

  it("reports progress at 50% (rendered) and 100% (encoded)", async () => {
    const values: number[] = []
    await convert(svg, "png", (v) => values.push(v))
    expect(values).toEqual([50, 100])
  })

  it("rejects files whose format it doesn't recognize", async () => {
    const textFile = new File(["hello"], "notes.txt", { type: "text/plain" })
    await expect(convert(textFile, "png")).rejects.toThrow(
      /unsupported source vector format/i,
    )
  })

  it("rejects unknown target formats", async () => {
    await expect(convert(svg, "bmp")).rejects.toThrow(
      /unsupported target raster format/i,
    )
  })
})
