/**
 * Generate PWA icons for DURA.
 * Emerald background with white "D" centered.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "fs";

const EMERALD = "#10B981";
const BG_COLOR = EMERALD;
const TEXT_COLOR = "#FFFFFF";

function createSVG(size, padding = 0) {
  const fontSize = Math.round((size - padding * 2) * 0.55);
  const cornerRadius = Math.round(size * 0.18);
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${BG_COLOR}"/>
      <text
        x="50%" y="54%"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        font-size="${fontSize}"
        fill="${TEXT_COLOR}"
        text-anchor="middle"
        dominant-baseline="middle"
      >D</text>
    </svg>
  `);
}

function createMaskableSVG(size) {
  // Maskable icons need safe zone — content within inner 80%
  const padding = Math.round(size * 0.1);
  const fontSize = Math.round((size - padding * 2) * 0.5);
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
      <text
        x="50%" y="54%"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        font-size="${fontSize}"
        fill="${TEXT_COLOR}"
        text-anchor="middle"
        dominant-baseline="middle"
      >D</text>
    </svg>
  `);
}

async function main() {
  mkdirSync("public/icons", { recursive: true });

  const sizes = [192, 512];

  for (const size of sizes) {
    // Standard icon (rounded corners)
    await sharp(createSVG(size)).png().toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`Created icon-${size}x${size}.png`);

    // Maskable icon (full bleed, safe zone content)
    await sharp(createMaskableSVG(size))
      .png()
      .toFile(`public/icons/icon-maskable-${size}x${size}.png`);
    console.log(`Created icon-maskable-${size}x${size}.png`);
  }

  // Favicon (32x32)
  await sharp(createSVG(32, 0)).png().toFile("public/favicon.png");

  // Convert to ICO format (just use the PNG — modern browsers accept it)
  await sharp(createSVG(48, 0)).resize(48, 48).png().toFile("public/favicon.ico");

  console.log("Created favicon.ico");
  console.log("Done! All icons generated in public/icons/");
}

main().catch(console.error);
