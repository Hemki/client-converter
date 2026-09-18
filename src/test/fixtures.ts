import { encode as encodePng } from "@jsquash/png"

/** A small deterministic RGBA checkerboard, useful as a source image for codec tests. */
export function checkerboardImageData(size = 8): ImageData {
  const data = new Uint8ClampedArray(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const on = (x + y) % 2 === 0
      data[i] = on ? 220 : 20
      data[i + 1] = on ? 40 : 160
      data[i + 2] = on ? 40 : 220
      data[i + 3] = 255
    }
  }
  return { data, width: size, height: size, colorSpace: "srgb" } as ImageData
}

export async function makeTestPngFile(
  name = "test.png",
  size = 8,
): Promise<File> {
  const imageData = checkerboardImageData(size)
  const encoded = await encodePng(imageData)
  return new File([encoded], name, { type: "image/png" })
}

export function makeTestSvgFile(name = "test.svg", size = 16): File {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#dc2828"/></svg>`
  return new File([svg], name, { type: "image/svg+xml" })
}
