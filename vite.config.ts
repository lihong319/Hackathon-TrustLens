import { sites } from "@openai/sites-vite-plugin";
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  plugins: [vinext(), sites()],
});
