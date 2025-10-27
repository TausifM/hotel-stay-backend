import express from 'express';
import multer from 'multer';
import { Checkin } from '../db/models/checkin.js';
import { Booking } from '../db/models/booking.js';
import { Upload } from '../db/models/upload.js';
import { authMiddleware } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ioEmit } from '../realtime/index.js';
import { extractTextFromImage, parseAadhaarDetails } from '../utils/ocr.js';

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post('/:bookingId', authMiddleware, upload.single('idDoc'), async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.hotelId !== req.user.tenantId) return res.status(403).json({ error: 'Forbidden' });

    let uploadRecord = null;
    let aadhaarData = null;

    if (req.file) {
      uploadRecord = await Upload.create({
        ownerId: req.user.id,
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size
      });

      // OCR + Aadhaar field extraction
      const ocrText = await extractTextFromImage(req.file.path);
      aadhaarData = parseAadhaarDetails(ocrText);
    }

    // If Aadhaar number extracted successfully → mark verified
    const isVerified = aadhaarData?.aadhaarNumber ? true : false;

    const checkin = await Checkin.create({
      bookingId,
      idDocumentUrl: uploadRecord ? `/uploads/${uploadRecord.filename}` : null,
      verified: isVerified,
      verifiedAt: isVerified ? new Date() : null,
      ...aadhaarData,
      metadata: aadhaarData
    });

    ioEmit(req.user.tenantId, 'checkin:created', checkin);
    res.status(201).json({ checkin, extracted: aadhaarData });
  } catch (err) {
    next(err);
  }
});

export default router;
