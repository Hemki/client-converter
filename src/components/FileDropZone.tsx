import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/hooks/useConverter"
import { FileAttachmentList } from "./FileAttachmentList"

const MAX_SIZE = 1024 * 1024 * 512 // 512 MB

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

type Props = {
  jobs: Job[]
  onFilesAdded: (files: File[]) => void
  onRemove: (id: number) => void
}

export function FileDropzone({ jobs, onFilesAdded, onRemove }: Props) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop: (accepted) => accepted.length > 0 && onFilesAdded(accepted),
      multiple: true,
      maxSize: MAX_SIZE,
    })

  const rejection = fileRejections[0]?.errors[0]

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-input bg-card px-6 py-12 transition-colors",
          "cursor-pointer hover:bg-accent/40",
          "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          isDragActive && "border-primary bg-accent",
          rejection && "border-destructive",
        )}
      >
        <input {...getInputProps()} />

        <div className="mb-3 rounded-full bg-muted p-2.5 text-muted-foreground">
          <Upload className="size-5" />
        </div>
        <p className="text-sm font-medium">
          Drop files here, or{" "}
          <span className="text-primary underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Any file, up to {formatSize(MAX_SIZE)} each
        </p>
      </div>

      {rejection && (
        <p className="text-xs text-destructive">
          {rejection.code === "file-too-large"
            ? `File exceeds the ${formatSize(MAX_SIZE)} limit.`
            : rejection.message}
        </p>
      )}

      <FileAttachmentList jobs={jobs} onRemove={onRemove} />
    </div>
  )
}
