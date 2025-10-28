import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import { Customer } from "../db/models/customer.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import path from "path";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const router = express.Router();

// === Setup Multer for uploads ===
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype))
      return cb(new Error("Invalid file type"));
    cb(null, true);
  },
});

// Helper: only run a multer middleware when request is valid multipart/form-data
function multerIfMultipart(middleware) {
  return (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    // If request is not multipart, skip multer and continue
    if (!contentType.startsWith("multipart/form-data")) return next();
    // If boundary is missing, respond with a clear error instead of letting busboy throw
    if (!contentType.includes("boundary=")) {
      return res
        .status(400)
        .json({ error: "Malformed multipart/form-data: missing boundary" });
    }
    // Delegate to the provided multer middleware but intercept Multer errors
    try {
      return middleware(req, res, (err) => {
        if (err) {
          // Multer-specific error
          if (err instanceof multer.MulterError) {
            console.warn(
              "Multer error on upload route:",
              err.code,
              err.message
            );
            return res
              .status(400)
              .json({
                error: err.code || "MULTER_ERROR",
                message: err.message,
              });
          }
          // Other errors -> forward to global error handler
          return next(err);
        }
        return next();
      });
    } catch (err) {
      // Synchronous errors
      if (err instanceof multer.MulterError) {
        console.warn(
          "Synchronous Multer error on upload route:",
          err.code,
          err.message
        );
        return res
          .status(400)
          .json({ error: err.code || "MULTER_ERROR", message: err.message });
      }
      return next(err);
    }
  };
}

// === OCR helper to extract Aadhaar fields ===
function parseAadhaarText(text) {
  const data = {};

  // Normalize text
  const cleaned = text
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[|_,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Name
  const nameMatch =
    cleaned.match(/(?:Name|नाम)[:\-]?\s*([A-Za-z\s]+)(?=\s+(?:Year|DOB|YOB|Male|Female|पुरुष|महिला))/i) ||
    cleaned.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/);

  // Year or Date of Birth (very flexible)
  const dobMatch =
    cleaned.match(/(?:Year\s*of\s*Birth|YOB|DOB|Date\s*of\s*Birth)[^0-9]*(\d{4}|\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);

  // Gender
  const genderMatch = cleaned.match(/\b(MALE|FEMALE|पुरुष|महिला)\b/i);

  // Aadhaar number
  const aadharMatch = cleaned.match(/\d{4}\s?\d{4}\s?\d{4}/);

  // Address
  const addressMatch = cleaned.match(/Address[:\-]?\s*([\w\s,.-]+\d{6})/i);

  if (nameMatch) data.name = nameMatch[1].trim();

  if (dobMatch) {
    const dobText = dobMatch[1];
    if (/^\d{4}$/.test(dobText)) {
      // Only year detected
      data.dob = new Date(`${dobText}-01-01`);
    } else if (dobText.includes("/")) {
      const [day, month, year] = dobText.split("/");
      data.dob = new Date(`${year}-${month}-${day}`);
    } else if (dobText.includes("-")) {
      const [day, month, year] = dobText.split("-");
      data.dob = new Date(`${year}-${month}-${day}`);
    }
  }

  if (genderMatch) {
    const g = genderMatch[1].toLowerCase();
    data.gender = g.includes("male") || g.includes("पुरुष") ? "Male" : "Female";
  }

  if (aadharMatch) data.aadharNumber = aadharMatch[0].replace(/\s/g, "");
  if (addressMatch) data.address = addressMatch[1].trim();

  return data;
}

// === POST /api/customers/upload-id ===
// Upload Aadhaar and auto-create customer
router.post(
  "/upload-id",
  authMiddleware,
  requireRole(["superadmin", "admin", "hotelOwner", "staff", "reception", "manager"]),
  multerIfMultipart(
    upload.fields([
      { name: "files", maxCount: 5 },
      { name: "idImage", maxCount: 1 },
    ])
  ),
  async (req, res, next) => {
    try {
      const user = req.user;
      const hotelId = user.tenantId;
      if (!hotelId)
        return res.status(400).json({ error: "No tenant assigned" });

      // Accept either single or multiple files
      const file =
        (req.files?.idImage && req.files.idImage[0]) ||
        (req.files?.files && req.files.files[0]);

      if (!file) return res.status(400).json({ error: "No image uploaded" });

      const filePath = path.resolve(file.path);

      console.log("🧠 Extracting text via OCR...");
      const { data: ocrData } = await Tesseract.recognize(filePath, "eng");
      const extractedText = ocrData.text;

      const parsed = parseAadhaarText(extractedText);
      if (!parsed.name) parsed.name = "Unknown";
      // Prevent duplicate Aadhaar
      const existing = await Customer.findOne({ where: { aadharNumber: parsed.aadharNumber } });
      if (existing) return res.status(200).json({ message: "Returning customer", customer: existing });

      const customer = await Customer.create({
        hotelId,
        createdBy: user.id,
        idImageUrl: `/uploads/${file.filename}`,
        ocrText: extractedText,
        verified: true,
        idType: "Aadhaar",
        ...parsed,
      });
 // ✅ Send WhatsApp welcome message (if number exists)
      if (customer.phone) {
        await sendWhatsAppMessage(customer.phone, hotelId);
          }
      res
        .status(201)
        .json({ message: "Customer added successfully", customer });
    } catch (err) {
      console.error("OCR Error:", err);
      next(err);
    }
  }
);

// === PUT /api/customers/:id ===
// Update customer info or re-upload ID
router.put(
  "/:id",
  authMiddleware,
  requireRole(["superadmin", "admin", "hotelOwner", "staff", "reception", "manager"]),
  multerIfMultipart(
    upload.fields([
      { name: "files", maxCount: 5 },
      { name: "idImage", maxCount: 1 },
    ])
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);

      if (!customer)
        return res.status(404).json({ error: "Customer not found" });
      if (customer.hotelId !== req.user.tenantId)
        return res.status(403).json({ error: "Forbidden" });

      let updates = { ...req.body };

      // If a new image is uploaded → extract Aadhaar data again
      if (req.file) {
        const filePath = path.resolve(req.file.path);
        const { data: ocrData } = await Tesseract.recognize(filePath, "eng");
        const extractedText = ocrData.text;
        const parsed = parseAadhaarText(extractedText);

        updates = {
          ...updates,
          idImageUrl: `/uploads/${req.file.filename}`,
          ocrText: extractedText,
          verified: true,
          ...parsed,
        };
      }

      await customer.update(updates);
      res.json({ message: "Customer updated successfully", customer });
    } catch (err) {
      console.error("Customer update error:", err);
      next(err);
    }
  }
);

// === GET /api/customers ===
// List all customers for this hotel
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const hotelId = req.user.tenantId;
    const customers = await Customer.findAll({ where: { hotelId } });
    res.json({message: "Customers fetched successfully", customers });
  } catch (err) {
    next(err);
  }
});

// === GET /api/customers/:id ===
// List all customers

router.get("/all-customers", authMiddleware, async (req, res, next) => {
  try {
    const customers = await Customer.findAll();
    console.log("Customers fetched successfully:", customers);
    res.json({message: "Customers fetched successfully", customers });
  } catch (err) {
    next(err);
  }
});

// === GET /api/customers/:id ===
// Fetch a single customer
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// === DELETE /api/customers/:id ===
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["superadmin", "admin", "hotelOwner", "staff", "reception", "manager"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);
      if (!customer)
        return res.status(404).json({ error: "Customer not found" });
      await customer.destroy();
      res.json({ message: "Customer deleted" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
