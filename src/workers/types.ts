export type Request = { id: number; file: File; to: string }
export type Response =
  | { id: number; type: "progress"; value: number }
  | { id: number; type: "done"; message: string }
  | { id: number; type: "error"; message: string }
