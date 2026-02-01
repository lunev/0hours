import { zip } from "zip-a-folder";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createRelease = async () => {
  const buildDir = path.resolve(__dirname, "..", "build");
  const releaseDir = path.resolve(__dirname, "..", "release");
  const manifestPath = path.resolve(__dirname, "..", "public", "manifest.json");

  const pkg = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const version = pkg.version;
  const name = pkg.name;

  const shortName = name.toLowerCase().replaceAll(" ", "-");

  const mainZip = path.join(releaseDir, `${shortName}-v${version}.zip`);

  if (!fs.existsSync(releaseDir)) fs.mkdirSync(releaseDir);
  if (fs.existsSync(mainZip)) fs.unlinkSync(mainZip);

  try {
    console.log(`📦 Packaging version ${version}...`);

    await zip(buildDir, mainZip);

    console.log(`✅ Extension ZIP ready: ${mainZip}`);
  } catch (err) {
    console.error("❌ Error during release:", err);
    process.exit(1);
  }
};

createRelease();
