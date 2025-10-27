import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';

export async function extractTextFromImage(imagePath) {
  try {
    const processedPath = `${imagePath}-processed.png`;
    await sharp(imagePath)
      .resize({ width: 1000 })
      .grayscale()
      .normalize()
      .toFile(processedPath);

    const result = await Tesseract.recognize(processedPath, 'eng', {
      logger: (m) => {
        if (process.env.DEBUG_OCR === 'true') console.log(m);
      }
    });

    const text = result.data.text.replace(/\s+/g, ' ').trim();
    fs.unlink(processedPath, () => {});
    return text;
  } catch (err) {
    console.error('OCR failed:', err);
    throw err;
  }
}

// Aadhaar-specific regex parser
export function parseAadhaarDetails(ocrText) {
  const nameMatch = ocrText.match(/Name[:\s]*([A-Z][A-Za-z\s]+)/i);
  const dobMatch = ocrText.match(/DOB[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
  const genderMatch = ocrText.match(/\b(Male|Female|Transgender)\b/i);
  const aadhaarMatch = ocrText.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
  const addressMatch = ocrText.match(/Address[:\s]*(.+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    dob: dobMatch ? dobMatch[1].trim() : null,
    gender: genderMatch ? genderMatch[1].trim() : null,
    aadhaarNumber: aadhaarMatch ? aadhaarMatch[0].trim() : null,
    address: addressMatch ? addressMatch[1].trim() : null,
    rawText: ocrText
  };
}
