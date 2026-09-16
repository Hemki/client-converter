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
} from "./ui/attachment"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox"
import { InputGroupAddon } from "./ui/input-group"
import { Progress } from "./ui/progress"
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

function downloadNameFor(file: File, formatId: string) {
  const ext = findCategory(file)?.formats.find((f) => f.id === formatId)
    ?.extensions[0]
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
        const description = [
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
                <Combobox<Format>
                  items={targets}
                  itemToStringValue={(target) => target.label}
                  onValueChange={(target) =>
                    target && onRetarget(job.id, target.id)
                  }
                  autoHighlight
                >
                  <ComboboxInput
                    placeholder="Convert to..."
                    className="w-36"
                    showClear
                  >
                    <InputGroupAddon>
                      <FileInputIcon />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent>
                    <ComboboxEmpty>No conversion option found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
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
