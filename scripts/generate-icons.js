import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function svgForSize(size) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0%" stop-color="#00bfff"/>
        <stop offset="100%" stop-color="#00ffaa"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="${Math.round(size*0.12)}" fill="#000"/>
    <rect width="100%" height="100%" rx="${Math.round(size*0.12)}" fill="url(#g)" opacity="0.14"/>
    <text x="50%" y="52%" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.46)}" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="700">G</text>
  </svg>
  `;
}

async function make(size, outName) {
  const svg = svgForSize(size);
  const buffer = Buffer.from(svg);
  await sharp(buffer).png().toFile(path.join(outDir, outName));
  console.log("Generated", outName);
}

(async () => {
  try {
    await make(192, "icon-192.png");
    await make(512, "icon-512.png");
    console.log("Icons generated at public/icons/");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();