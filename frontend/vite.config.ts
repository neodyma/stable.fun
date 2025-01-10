import path from "path"
import react from "@vitejs/plugin-react"
import protobufPatch from "./src/plugins/protobuf-patch"
import tailwindcss from 'tailwindcss'
import { defineConfig } from "vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [react(), protobufPatch(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
  server: {
    watch: {
      usePolling: true
    }
  }
})
