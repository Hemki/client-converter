import { useCallback, useEffect, useRef, useState } from "react"
import type { Request, Response } from "@/workers/types"

export function useWorker() {
  const workerRef = useRef<Worker | null>(null)
  const jobId = useRef(0)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const w = new Worker(new URL("../workers/convert.worker.ts", import.meta.url), {
      type: "module",
    })

    w.onmessage = (e: MessageEvent<Response>) => {
      if (e.data.id !== jobId.current) return
      setResult(e.data.message)
    }

    workerRef.current = w
    return () => {
      w.terminate()
      workerRef.current = null
    }
  }, [])

  const send = useCallback((file: File) => {
    jobId.current += 1
    setResult(null)
    const req: Request = { id: jobId.current, file, to: "TBD" }
    workerRef.current?.postMessage(req)
  }, [])

  return { send, result }
}
