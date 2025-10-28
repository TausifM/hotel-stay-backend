// src/routes/serviceRequests.js
import express from "express";
import { ServiceRequest } from "../db/models/service_request.js";
import { authMiddleware } from "../middleware/auth.js";
import { broadcastServiceRequest } from "../realtime/index.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { hotelId, customerId, type, details } = req.body;
    const request = await ServiceRequest.create({ hotelId, customerId, type, details });
    // Emit realtime event (optional)
    // req.io?.emit(`hotel:${hotelId}:serviceRequest`, request);
    broadcastServiceRequest(hotelId, request);
    res.status(201).json({ message: "Request created", request });
  } catch (err) { next(err); }
});

export default router;
