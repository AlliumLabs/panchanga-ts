// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts", // Entry point for your library
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs", // CommonJS format
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm", // ES Module format
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(), // so Rollup can find node_modules
    commonjs(), // so Rollup can convert CommonJS to ES modules
    typescript({
      useTsconfigDeclarationDir: true,
    }),
  ],
  // Mark astronomy-engine as external so it's not bundled
  external: ["astronomy-engine"],
};
