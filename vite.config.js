import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "localhost",
    port: 5173,

    watch: {
      ignored: [
        "**/rf_engine/output/**",
        "**/rf_engine/uploads/**",
        "**/*.png",
        "**/*.wav",
        "**/*.iq",
      ],
    },
  },
});