import {
  FileSpreadsheet,
  FileText,
  Image,
  Music,
  Type,
  Video,
  type LucideIcon,
  VectorSquare,
} from "lucide-react"

export type Format = {
  id: string
  label: string
  extensions: string[]
  mimeTypes: string[]
}

export type Category = {
  id: string
  label: string
  /** Key of the converter module under src/converters/ that handles this category. */
  engine: string
  icon: LucideIcon
  formats: Format[]
}

export const CATEGORIES: Category[] = [
  {
    id: "raster-image",
    label: "Images",
    engine: "image",
    icon: Image,
    formats: [
      {
        id: "png",
        label: "PNG",
        extensions: ["png"],
        mimeTypes: ["image/png"],
      },
      {
        id: "jpeg",
        label: "JPEG",
        extensions: ["jpg", "jpeg"],
        mimeTypes: ["image/jpeg"],
      },
      {
        id: "webp",
        label: "WebP",
        extensions: ["webp"],
        mimeTypes: ["image/webp"],
      },
      {
        id: "avif",
        label: "AVIF",
        extensions: ["avif"],
        mimeTypes: ["image/avif"],
      },
    ],
  },
  {
    id: "vector-image",
    label: "Vector graphics",
    engine: "vector",
    icon: VectorSquare,
    formats: [
      {
        id: "svg",
        label: "SVG",
        extensions: ["svg"],
        mimeTypes: ["image/svg+xml"],
      },
      {
        id: "eps",
        label: "EPS",
        extensions: ["eps"],
        mimeTypes: ["application/postscript"],
      },
    ],
  },
  {
    id: "document",
    label: "Documents",
    engine: "document",
    icon: FileText,
    formats: [
      {
        id: "pdf",
        label: "PDF",
        extensions: ["pdf"],
        mimeTypes: ["application/pdf"],
      },
      {
        id: "docx",
        label: "Word",
        extensions: ["docx"],
        mimeTypes: [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      },
      {
        id: "odt",
        label: "OpenDocument Text",
        extensions: ["odt"],
        mimeTypes: ["application/vnd.oasis.opendocument.text"],
      },
      {
        id: "md",
        label: "Markdown",
        extensions: ["md"],
        mimeTypes: ["text/markdown"],
      },
      {
        id: "txt",
        label: "Plain text",
        extensions: ["txt"],
        mimeTypes: ["text/plain"],
      },
    ],
  },
  {
    id: "spreadsheet",
    label: "Spreadsheets",
    engine: "spreadsheet",
    icon: FileSpreadsheet,
    formats: [
      {
        id: "xlsx",
        label: "Excel",
        extensions: ["xlsx"],
        mimeTypes: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
      },
      {
        id: "ods",
        label: "OpenDocument Sheet",
        extensions: ["ods"],
        mimeTypes: ["application/vnd.oasis.opendocument.spreadsheet"],
      },
      {
        id: "csv",
        label: "CSV",
        extensions: ["csv"],
        mimeTypes: ["text/csv"],
      },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    engine: "audio",
    icon: Music,
    formats: [
      {
        id: "mp3",
        label: "MP3",
        extensions: ["mp3"],
        mimeTypes: ["audio/mpeg"],
      },
      {
        id: "wav",
        label: "WAV",
        extensions: ["wav"],
        mimeTypes: ["audio/wav"],
      },
      {
        id: "ogg",
        label: "OGG",
        extensions: ["ogg"],
        mimeTypes: ["audio/ogg"],
      },
      {
        id: "flac",
        label: "FLAC",
        extensions: ["flac"],
        mimeTypes: ["audio/flac"],
      },
    ],
  },
  {
    id: "video",
    label: "Video",
    engine: "video",
    icon: Video,
    formats: [
      {
        id: "mp4",
        label: "MP4",
        extensions: ["mp4"],
        mimeTypes: ["video/mp4"],
      },
      {
        id: "webm",
        label: "WebM",
        extensions: ["webm"],
        mimeTypes: ["video/webm"],
      },
      {
        id: "mov",
        label: "QuickTime",
        extensions: ["mov"],
        mimeTypes: ["video/quicktime"],
      },
    ],
  },
  {
    id: "font",
    label: "Fonts",
    engine: "font",
    icon: Type,
    formats: [
      {
        id: "ttf",
        label: "TrueType",
        extensions: ["ttf"],
        mimeTypes: ["font/ttf"],
      },
      {
        id: "otf",
        label: "OpenType",
        extensions: ["otf"],
        mimeTypes: ["font/otf"],
      },
      {
        id: "woff",
        label: "WOFF",
        extensions: ["woff"],
        mimeTypes: ["font/woff"],
      },
      {
        id: "woff2",
        label: "WOFF2",
        extensions: ["woff2"],
        mimeTypes: ["font/woff2"],
      },
    ],
  },
]

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? ""
}

export function findCategory(file: File): Category | undefined {
  const ext = extensionOf(file.name)
  return CATEGORIES.find((cat) =>
    cat.formats.some(
      (f) => f.extensions.includes(ext) || f.mimeTypes.includes(file.type),
    ),
  )
}

export function formatOf(file: File): Format | undefined {
  const cat = findCategory(file)
  if (!cat) return undefined
  const ext = extensionOf(file.name)
  return cat.formats.find(
    (f) => f.extensions.includes(ext) || f.mimeTypes.includes(file.type),
  )
}

/** Formats this file could be converted to, excluding its own format. */
export function targetsFor(file: File): Format[] {
  const cat = findCategory(file)
  if (!cat) return []
  const source = formatOf(file)
  return cat.formats.filter((f) => f.id !== source?.id)
}
