// src/routes/whatsapp.js
import express from "express";
import { ServiceRequest } from "../models/serviceRequest.js";
import { Hotel } from "../models/hotel.js";
import { broadcastNotification, broadcastServiceRequest } from "../realtime/index.js";
import axios from "axios";

const router = express.Router();

/**
 * ✅ Verify Webhook (Meta requires this)
 */
router.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * 📩 Handle incoming messages
 */
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    console.log("📨 Incoming WhatsApp message:", JSON.stringify(data, null, 2));

    const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phoneNumber = message?.from;
    const text = message?.text?.body?.trim();

    if (!text || !phoneNumber) return res.sendStatus(200);

    // Find the hotel that owns this WhatsApp number
    const hotel = await Hotel.findOne({ where: { whatsappNumber: phoneNumber } });
    if (!hotel) {
      console.warn("⚠️ No hotel found for WhatsApp number", phoneNumber);
      return res.sendStatus(200);
    }

    // Match the message text to a service type
    const normalized = text.toLowerCase();
    let type = "General";

    if (normalized.includes("clean")) type = "Room Cleaning";
    else if (normalized.includes("food")) type = "Food Order";
    else if (normalized.includes("laundry")) type = "Laundry";
    else if (normalized.includes("water")) type = "Water Refill";

    // Create a ServiceRequest
    const request = await ServiceRequest.create({
      hotelId: hotel.id,
      type,
      description: text,
      status: "Pending",
    });

    // Notify staff via Socket.io
    broadcastServiceRequest(hotel.id, request);
    broadcastNotification(hotel.id, {
      type: "ServiceRequest",
      message: `WhatsApp: ${type} requested via ${phoneNumber}`,
      meta: request,
    });

    // ✅ Auto-reply to guest on WhatsApp (optional)
    if (hotel.whatsappAccessToken && hotel.whatsappPhoneNumberId) {
      const url = `https://graph.facebook.com/v18.0/${hotel.whatsappPhoneNumberId}/messages`;
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to: phoneNumber,
          text: { body: `✅ Your ${type} request has been received. Our team will assist you shortly.` },
        },
        {
          headers: {
            Authorization: `Bearer ${hotel.whatsappAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ WhatsApp webhook error:", err);
    res.sendStatus(500);
  }
});

export default router;
