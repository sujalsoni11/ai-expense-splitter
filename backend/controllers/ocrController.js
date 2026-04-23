const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

const renderSecretPath = '/etc/secrets/vision-key.json';
const localPath = path.join(__dirname, '../vision-key.json');

const client = new vision.ImageAnnotatorClient({
  keyFilename: fs.existsSync(renderSecretPath) ? renderSecretPath : localPath
});

const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const [result] = await client.textDetection(req.file.path);
    const text = result.fullTextAnnotation?.text || "";

    // Extract max amount
    const numbers = text.match(/\d+(\.\d{1,2})?/g);
    const amount = numbers ? Math.max(...numbers.map(Number)) : 0;

    res.json({
      text,
      amount,
      imageUrl: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error("Google Vision OCR Error:", error);
    res.status(500).json({ 
      message: 'OCR failed. Please ensure vision-key.json is present and valid.',
      error: error.message 
    });
  }
};

module.exports = { scanReceipt };