import { useCallback, useEffect, useRef, useState } from "react"
import type { Request, Response } from "@/workers/types"
import { targetsFor } from "@/converters/config"

const MAX_CONCURRENCY = Math.max(1, navigator.hardwareConcurrency || 4)

export type JobStatus = "init" | "queued" | "processing" | "done" | "error"

export type Job = {
  id: number
  file: File
  to: string
  status: JobStatus
  progress: number
  result: Blob | null
  resultUrl: string | null
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
  const objectUrlsRef = useRef(new Set<string>())

  const patchJob = useCallback((id: number, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }, [])

  const runNextRef = useRef<() => void>(() => {})
  const runNext = useCallback(() => runNextRef.current(), [])

  useEffect(() => {
    runNextRef.current = () => {
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
          const url = URL.createObjectURL(e.data.blob)
          objectUrlsRef.current.add(url)
          patchJob(job.id, {
            status: "done",
            progress: 100,
            result: e.data.blob,
            resultUrl: url,
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
    }
  }, [patchJob, runNext])

  const enqueue = useCallback(
    (job: Job) => {
      queueRef.current.push(job)
      runNext()
    },
    [runNext],
  )

  const convert = useCallback((file: File) => {
    const id = nextId.current++
    const to = targetsFor(file)[0]?.id
    const job: Job = {
      id,
      file,
      to: to ?? "",
      status: to ? "init" : "error",
      progress: 0,
      result: null,
      resultUrl: null,
      error: to ? null : "Unsupported file type",
    }
    setJobs((prev) => [...prev, job])
    return id
  }, [])

  const cancelJob = useCallback((id: number) => {
    queueRef.current = queueRef.current.filter((j) => j.id !== id)
    const worker = workersRef.current.get(id)
    if (worker) {
      worker.terminate()
      workersRef.current.delete(id)
    }
    return worker !== undefined
  }, [])

  const releaseResult = useCallback((job: Job | undefined) => {
    if (job?.resultUrl) {
      URL.revokeObjectURL(job.resultUrl)
      objectUrlsRef.current.delete(job.resultUrl)
    }
  }, [])

  const retarget = useCallback(
    (id: number, to: string) => {
      const job = jobs.find((j) => j.id === id)
      if (!job) return

      const wasRunning = cancelJob(id)
      releaseResult(job)

      const updated: Job = {
        ...job,
        to,
        status: "queued",
        progress: 0,
        result: null,
        resultUrl: null,
        error: null,
      }
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)))
      enqueue(updated)
      if (wasRunning) runNext()
    },
    [jobs, cancelJob, releaseResult, enqueue, runNext],
  )

  const remove = useCallback(
    (id: number) => {
      const job = jobs.find((j) => j.id === id)
      const wasRunning = cancelJob(id)
      releaseResult(job)
      setJobs((prev) => prev.filter((j) => j.id !== id))
      if (wasRunning) runNext()
    },
    [jobs, cancelJob, releaseResult, runNext],
  )

  useEffect(() => {
    const workers = workersRef.current
    const urls = objectUrlsRef.current
    return () => {
      workers.forEach((w) => w.terminate())
      workers.clear()
      urls.forEach((u) => URL.revokeObjectURL(u))
      urls.clear()
    }
  }, [])

  return { jobs, convert, retarget, remove }
}
