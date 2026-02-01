/**
 * RESTORE PREVIOUS VERSION SCRIPT
 * * BEST PRACTICES & USAGE:
 * 1. Default: `npm run prev`       -> Restores the latest ZIP from /release to /build.
 * 2. Specific: `npm run prev 1.0.2` -> Searches for a file containing "1.0.2" and restores it.
 * 3. Workflow: Use this to compare current dev code with production or to debug old versions.
 * 4. Safety: This script WIPES the /build folder before unzipping to avoid "file ghosts".
 * 5. Chrome: After running, always go to chrome://extensions and click the "Refresh" icon.
 */

import extract from "extract-zip";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const unzipPrev = async () => {
  const buildDir = path.resolve(__dirname, "..", "build");
  const releaseDir = path.resolve(__dirname, "..", "release");

  // npm run prev 1.0.2
  // targetVersion === 1.0.2
  const targetVersion = process.argv[2];

  if (!fs.existsSync(releaseDir)) {
    console.error("❌ Folder 'release' not found.");
    return;
  }

  const allFiles = fs.readdirSync(releaseDir).filter((f) => f.endsWith(".zip"));

  let selectedFile;

  if (targetVersion) {
    selectedFile = allFiles.find(
      (f) => f.includes(`v${targetVersion}`) || f.includes(targetVersion),
    );

    if (!selectedFile) {
      console.error(`❌ Could not find a ZIP file for version: ${targetVersion}`);
      console.log("Available files:", allFiles);
      return;
    }
  } else {
    const sortedFiles = allFiles
      .map((f) => ({
        name: f,
        path: path.join(releaseDir, f),
        time: fs.statSync(path.join(releaseDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (sortedFiles.length === 0) {
      console.error("❌ No ZIP files found in 'release' folder.");
      return;
    }
    selectedFile = sortedFiles[0].name;
  }

  const zipPath = path.join(releaseDir, selectedFile);
  console.log(`📦 Unzipping: ${selectedFile}...`);

  try {
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
    }

    await extract(zipPath, { dir: buildDir });

    console.log(`✅ Success! Version from ${selectedFile} is now in /build.`);
    console.log("👉 Go to chrome://extensions and click 'Refresh'.");
  } catch (err) {
    console.error("❌ Extraction failed:", err);
  }
};

unzipPrev();
