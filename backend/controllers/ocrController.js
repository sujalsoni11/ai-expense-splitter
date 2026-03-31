const Tesseract = require('tesseract.js');
const fs = require('fs');

// @desc    Upload receipt and extract details
// @route   POST /api/ocr/scan
// @access  Private
const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = req.file.path;

    // Run Tesseract OCR on the image
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );

    // Basic regex to find "Total" or monetary amounts
    // Real-world implementation would use more sophisticated NLP
    const totalRegex = /total[\s:]*[$₹]?[\s]*([0-9,]+(\.[0-9]{2})?)/i;
    let match = text.match(totalRegex);
    let amount = 0;

    if (match && match[1]) {
      // Remove commas and parse float
      amount = parseFloat(match[1].replace(/,/g, ''));
    } else {
      // Fallback: just look for the largest number prefixed with $ or ₹
      // Or any large floating point number
      const amountsRegex = /[$₹]?\s?([0-9,]+\.[0-9]{2})/g;
      const amounts = [...text.matchAll(amountsRegex)]
        .map(m => parseFloat(m[1].replace(/,/g, '')))
        .filter(n => !isNaN(n));
      
      if (amounts.length > 0) {
        amount = Math.max(...amounts); // Often the largest number on a receipt is the total
      }
    }

    // Include the path to serve the image later
    const optimizedPath = imagePath.replace(/\\/g, '/');

    res.json({
      text, // Full text for debugging
      amount,
      receiptImage: `/${optimizedPath}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  scanReceipt
};
