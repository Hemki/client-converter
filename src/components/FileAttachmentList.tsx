import { Select as SelectPrimitive } from "@base-ui/react/select"
import { DownloadIcon, FileIcon, FileInputIcon, XIcon } from "lucide-react"
import {
  findCategory,
  formatOf,
  targetsFor,
  type Format,
} from "@/converters/config"
import type { Job, JobStatus } from "@/hooks/useConverter"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "./ui/attachment"
import { Progress } from "./ui/progress"
import { Select, SelectContent, SelectItem } from "./ui/select"
import { Spinner } from "./ui/spinner"

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

function formatById(file: File, formatId: string) {
  return findCategory(file)?.formats.find((f) => f.id === formatId)
}

function downloadNameFor(file: File, formatId: string) {
  const ext = formatById(file, formatId)?.extensions[0]
  if (!ext) return file.name
  return `${file.name.replace(/\.[^./]+$/, "")}.${ext}`
}

/** Maps a job's lifecycle status to the visual state the Attachment UI understands. */
const ATTACHMENT_STATE: Record<
  JobStatus,
  "idle" | "processing" | "error" | "done"
> = {
  init: "idle",
  queued: "idle",
  processing: "processing",
  done: "done",
  error: "error",
}

type Props = {
  jobs: Job[]
  onRemove: (id: number) => void
  onRetarget: (id: number, to: string) => void
}

export function FileAttachmentList({ jobs, onRemove, onRetarget }: Props) {
  if (jobs.length === 0) return null

  return (
    <div className="flex-col space-y-2">
      {jobs.map((job) => {
        const Icon = findCategory(job.file)?.icon ?? FileIcon
        const description =
          job.status === "done" && job.result
            ? [
                `${formatOf(job.file)?.label} → ${formatById(job.file, job.to)?.label}`,
                formatSize(job.result.size),
              ]
                .filter(Boolean)
                .join(" • ")
            : [
                formatOf(job.file)?.label,
                formatSize(job.file.size),
                job.status === "error" ? job.error : null,
              ]
                .filter(Boolean)
                .join(" • ")
        const targets = targetsFor(job.file)
        return (
          <Attachment
            state={ATTACHMENT_STATE[job.status]}
            className="w-full"
            key={job.id}
          >
            {job.status === "done" && job.resultUrl && (
              <AttachmentTrigger
                aria-label={`Download ${job.file.name}`}
                render={
                  <a
                    href={job.resultUrl}
                    download={downloadNameFor(job.file, job.to)}
                  />
                }
              />
            )}
            <AttachmentMedia>
              {job.status === "processing" ? (
                <Spinner className="size-5" />
              ) : (
                <Icon className="size-5" />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{job.file.name}</AttachmentTitle>
              <AttachmentDescription>
                {job.status === "processing" ? (
                  <Progress value={job.progress} className="mt-1" />
                ) : (
                  description
                )}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              {targets.length > 0 && (
                <Select<Format>
                  onValueChange={(target) =>
                    target && onRetarget(job.id, target.id)
                  }
                >
                  <SelectPrimitive.Trigger
                    aria-label="Convert to a different format"
                    render={<AttachmentAction />}
                  >
                    <FileInputIcon />
                  </SelectPrimitive.Trigger>
                  <SelectContent align="end">
                    {targets.map((target) => (
                      <SelectItem key={target.id} value={target}>
                        {target.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {job.status === "done" && job.resultUrl && (
                <AttachmentAction
                  aria-label={`Download ${job.file.name}`}
                  nativeButton={false}
                  render={
                    <a
                      href={job.resultUrl}
                      download={downloadNameFor(job.file, job.to)}
                    />
                  }
                >
                  <DownloadIcon />
                </AttachmentAction>
              )}
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
