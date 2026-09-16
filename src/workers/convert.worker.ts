/// <reference lib="webworker" />
import type { Request, Response } from "./types"
import { findCategory } from "@/converters/config"
import type { ConvertFn } from "@/converters/types"

const post = (msg: Response) => self.postMessage(msg)

self.onmessage = async (e: MessageEvent<Request>) => {
  const { id, file, to } = e.data
  try {
    const category = findCategory(file)
    if (!category) {
      throw new Error(`Unsupported file type: ${file.name}`)
    }

    const engine: { convert: ConvertFn } = await import(
      `../converters/${category.engine}.ts`
    )
    const blob = await engine.convert(file, to, (value) =>
      post({ id, type: "progress", value }),
    )
    post({ id, type: "done", blob })
  } catch (err) {
    post({ id, type: "error", message: String(err) })
  }
}
