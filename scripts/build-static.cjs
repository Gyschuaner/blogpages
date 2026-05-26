const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "myblog");
const outputDir = path.join(root, "docs", ".vuepress", "dist");

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Static site source not found: ${sourceDir}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.cpSync(sourceDir, outputDir, { recursive: true });

console.log(`Copied ${path.relative(root, sourceDir)} to ${path.relative(root, outputDir)}`);
