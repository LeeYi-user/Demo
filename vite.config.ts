import { defineConfig, type Plugin } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * Keep the MongoDB driver out of Vite's module pipeline.
 *
 * `mongodb` is CommonJS and pulls in Node-only packages (`bson`, `saslprep`).
 * Fresh's Vite plugin sets `resolve.noExternal: true` to dedupe preact, which
 * also drags the driver through CJS interop and makes it fail at runtime with
 * `sparse_bitfield_1.default is not a function`.
 *
 * Dev and build need separate escape hatches: the dev module runner honours
 * `resolve.external`, while the Rollup build only honours an external result
 * from `resolveId`. Both must be listed *after* `fresh()` so they win the
 * config merge.
 */
function externalizeMongodb(): Plugin[] {
  const isMongodb = (source: string) =>
    source === "mongodb" || source.startsWith("mongodb/");

  return [
    {
      name: "externalize-mongodb:serve",
      apply: "serve",
      configEnvironment(name) {
        if (name !== "ssr") return;
        return { resolve: { external: ["mongodb"] } };
      },
    },
    {
      name: "externalize-mongodb:build",
      apply: "build",
      enforce: "pre",
      applyToEnvironment: (environment) => environment.name === "ssr",
      resolveId(source) {
        if (isMongodb(source)) {
          return { id: source, external: true };
        }
      },
    },
  ];
}

export default defineConfig({
  plugins: [fresh(), tailwindcss(), externalizeMongodb()],
});
