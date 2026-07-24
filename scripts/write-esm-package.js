// Marks dist/esm as an ES module tree so Node treats the .js files there as ESM,
// while the root package stays CommonJS. Run after the ESM tsc pass.
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "dist", "esm");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "package.json"), '{\n  "type": "module"\n}\n');
