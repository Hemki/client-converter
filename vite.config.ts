import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  base: "/client-converter/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      pwaAssets: {
        image: "public/favicon.svg",
        preset: "minimal-2023",
      },
      manifest: {
        name: "Client Converter",
        short_name: "Converter",
        description:
          "Convert files locally in your browser. Nothing is uploaded.",
        start_url: "/client-converter/",
        scope: "/client-converter/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,wasm}"],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // TBD
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
