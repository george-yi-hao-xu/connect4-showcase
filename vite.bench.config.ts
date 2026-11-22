import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/utils/game.ts", import.meta.url)),
      formats: ["es"],
      fileName: () => "game.mjs",
    },

    outDir: "dist-bench",
    emptyOutDir: true,

    // 对比浏览器开发环境时先不要压缩
    minify: false,
    sourcemap: false,

    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
