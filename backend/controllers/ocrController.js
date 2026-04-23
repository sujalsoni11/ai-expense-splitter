const Tesseract = require('tesseract.js');
const path = require('path');

const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'eng',
      { logger: m => console.log(m) }
    );

    // Extract max amount (Basic regex setup for prices)
    const cleanText = text.replace(/,/g, '');
    const numbers = cleanText.match(/\d+(\.\d{1,2})?/g);
    const amount = numbers ? Math.max(...numbers.map(Number)) : 0;

    res.json({
      text,
      amount,
      imageUrl: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error("Tesseract OCR Error:", error);
    res.status(500).json({ 
      message: 'OCR failed using local engine',
      error: error.message 
    });
  }
};

module.exports = { scanReceipt };