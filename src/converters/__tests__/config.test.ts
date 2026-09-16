import { describe, expect, it } from "vitest"
import { findCategory, formatOf, targetsFor } from "../config"

function file(name: string, type: string) {
  return new File([], name, { type })
}

describe("findCategory", () => {
  it("matches by extension", () => {
    expect(findCategory(file("photo.png", ""))?.id).toBe("raster-image")
    expect(findCategory(file("song.mp3", ""))?.id).toBe("audio")
    expect(findCategory(file("clip.mov", ""))?.id).toBe("video")
    expect(findCategory(file("font.woff2", ""))?.id).toBe("font")
  })

  it("matches by mime type when the extension is missing or unknown", () => {
    expect(findCategory(file("noext", "image/webp"))?.id).toBe("raster-image")
    expect(findCategory(file("weird.bin", "text/csv"))?.id).toBe("spreadsheet")
  })

  it("is case-insensitive on the extension", () => {
    expect(findCategory(file("PHOTO.PNG", ""))?.id).toBe("raster-image")
  })

  it("returns undefined for unrecognized files", () => {
    expect(findCategory(file("archive.zip", "application/zip"))).toBeUndefined()
    expect(findCategory(file("noext", ""))).toBeUndefined()
  })
})

describe("formatOf", () => {
  it("resolves the specific format within a file's category", () => {
    expect(formatOf(file("photo.jpg", ""))?.id).toBe("jpeg")
    expect(formatOf(file("photo.jpeg", ""))?.id).toBe("jpeg")
    expect(formatOf(file("sheet.xlsx", ""))?.id).toBe("xlsx")
  })

  it("returns undefined for unrecognized files", () => {
    expect(formatOf(file("archive.zip", "application/zip"))).toBeUndefined()
  })
})

describe("targetsFor", () => {
  it("excludes the source format but includes its siblings", () => {
    const targets = targetsFor(file("photo.png", "")).map((f) => f.id)
    expect(targets).toEqual(["jpeg", "webp", "avif"])
    expect(targets).not.toContain("png")
  })

  it("returns an empty list for unrecognized files", () => {
    expect(targetsFor(file("archive.zip", "application/zip"))).toEqual([])
  })
})
