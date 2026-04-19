const sharp = require('sharp');
const path = require('path');

async function preprocessImage(inputPath) {
  const outputPath = path.join(
    path.dirname(inputPath),
    'processed.png'
  );

  await sharp(inputPath)
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 1000 })
    .toFile(outputPath);

  return outputPath;
}

module.exports = preprocessImage;