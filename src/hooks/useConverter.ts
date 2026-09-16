import { useCallback, useEffect, useRef, useState } from "react"
import type { Request, Response } from "@/workers/types"

const MAX_CONCURRENCY = Math.max(1, navigator.hardwareConcurrency || 4)

export type JobStatus = "queued" | "processing" | "done" | "error"

export type Job = {
  id: number
  file: File
  to: string
  status: JobStatus
  progress: number
  result: string | null
  error: string | null
}

function spawnWorker() {
  return new Worker(new URL("../workers/convert.worker.ts", import.meta.url), {
    type: "module",
  })
}

export function useConverter() {
  const [jobs, setJobs] = useState<Job[]>([])
  const nextId = useRef(0)
  const queueRef = useRef<Job[]>([])
  const workersRef = useRef(new Map<number, Worker>())

  const patchJob = useCallback((id: number, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }, [])

  const runNext = useCallback(() => {
    if (workersRef.current.size >= MAX_CONCURRENCY) return
    const job = queueRef.current.shift()
    if (!job) return

    const worker = spawnWorker()
    workersRef.current.set(job.id, worker)
    patchJob(job.id, { status: "processing" })

    const finish = () => {
      worker.terminate()
      workersRef.current.delete(job.id)
      runNext()
    }

    worker.onmessage = (e: MessageEvent<Response>) => {
      if (e.data.type === "progress") {
        patchJob(job.id, { progress: e.data.value })
        return
      }
      if (e.data.type === "done") {
        patchJob(job.id, {
          status: "done",
          progress: 100,
          result: e.data.message,
        })
      } else {
        patchJob(job.id, { status: "error", error: e.data.message })
      }
      finish()
    }
    worker.onerror = (e) => {
      patchJob(job.id, { status: "error", error: e.message })
      finish()
    }

    const req: Request = { id: job.id, file: job.file, to: job.to }
    worker.postMessage(req)
  }, [patchJob])

  const convert = useCallback(
    (file: File, to: string) => {
      const id = nextId.current++
      const job: Job = {
        id,
        file,
        to,
        status: "queued",
        progress: 0,
        result: null,
        error: null,
      }
      setJobs((prev) => [...prev, job])
      queueRef.current.push(job)
      runNext()
      return id
    },
    [runNext],
  )

  const remove = useCallback(
    (id: number) => {
      queueRef.current = queueRef.current.filter((j) => j.id !== id)
      const worker = workersRef.current.get(id)
      if (worker) {
        worker.terminate()
        workersRef.current.delete(id)
        runNext()
      }
      setJobs((prev) => prev.filter((j) => j.id !== id))
    },
    [runNext],
  )

  useEffect(() => {
    const workers = workersRef.current
    return () => {
      workers.forEach((w) => w.terminate())
      workers.clear()
    }
  }, [])

  return { jobs, convert, remove }
}
