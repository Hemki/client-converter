import { useDropzone } from "react-dropzone"
import { Upload, File as FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  file: File | null
  onFile: (file: File) => void
  onClear: () => void
}

export function FileDropzone({ file, onFile, onClear }: Props) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop: (accepted) => accepted[0] && onFile(accepted[0]),
      multiple: false,
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

        {file ? (
          <div className="flex w-full items-center gap-3">
            <div className="rounded-md bg-muted p-2 text-muted-foreground">
              <FileIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 rounded-full bg-muted p-2.5 text-muted-foreground">
              <Upload className="size-5" />
            </div>
            <p className="text-sm font-medium">
              Drop a file here, or{" "}
              <span className="text-primary underline">browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Any file, up to {formatSize(MAX_SIZE)}
            </p>
          </>
        )}
      </div>

      {rejection && (
        <p className="text-xs text-destructive">
          {rejection.code === "file-too-large"
            ? `File exceeds the ${formatSize(MAX_SIZE)} limit.`
            : rejection.message}
        </p>
      )}
    </div>
  )
}
