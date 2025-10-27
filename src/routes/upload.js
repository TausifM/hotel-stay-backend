import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { UPLOAD_DIR } from '../utils/constants.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve uploads folder (in production use CDN / proper static hosting)
router.use('/files', express.static(path.resolve(process.cwd(), UPLOAD_DIR)));

export default router;
