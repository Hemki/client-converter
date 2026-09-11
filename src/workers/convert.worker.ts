/// <reference lib="webworker" />
import type { Request, Response } from "./types"

const post = (msg: Response) => {
  console.log("Worker: Posting message back to main script")
  self.postMessage(msg)
}

self.onmessage = async (e: MessageEvent<Request>) => {
  const { id, file, to } = e.data
  try {
    //const { convert } = await import(`../converters/${to}.ts`)
    // const blob = await convert(file, (value: number) =>
    //   post({ id, type: 'progress', value })
    // )
    post({
      id,
      type: "done",
      message: `Worker got "${file.name}" (${file.size} bytes, ${file.type || "unknown type"}) with to: ${to}`,
    })
  } catch (err) {
    post({ id, type: "error", message: String(err) })
  }
}
