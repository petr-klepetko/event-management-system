import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // Only the Cloudflare/Vinext build needs Prisma's Edge WASM loader.
  resolve: {
    alias: [
      { find: /^@prisma\/client$/, replacement: "@prisma/client/edge" },
    ],
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
