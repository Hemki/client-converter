import { FileIcon, XIcon } from "lucide-react"
import { findCategory } from "@/converters/config"
import type { Job, JobStatus } from "@/hooks/useConverter"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "./ui/attachment"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let i = -1
  let n = bytes
  do {
    n /= 1024
    i++
  } while (n >= 1024 && i < units.length - 1)
  return `${n.toFixed(1)} ${units[i]}`
}

/** Maps a job's lifecycle status to the visual state the Attachment UI understands. */
const ATTACHMENT_STATE: Record<JobStatus, "idle" | "processing" | "error" | "done"> = {
  queued: "idle",
  processing: "processing",
  done: "done",
  error: "error",
}

type Props = {
  jobs: Job[]
  onRemove: (id: number) => void
}

export function FileAttachmentList({ jobs, onRemove }: Props) {
  if (jobs.length === 0) return null

  return (
    <div className="flex-col space-y-2">
      {jobs.map((job) => {
        const Icon = findCategory(job.file)?.icon ?? FileIcon
        return (
          <Attachment
            state={ATTACHMENT_STATE[job.status]}
            className="w-full"
            key={job.id}
          >
            <AttachmentMedia>
              <Icon className="size-5" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{job.file.name}</AttachmentTitle>
              <AttachmentDescription>
                {formatSize(job.file.size)}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                aria-label={`Remove file ${job.file.name}`}
                onClick={() => onRemove(job.id)}
              >
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        )
      })}
    </div>
  )
}
