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
     // 2️⃣ Find or create customer
    const [customer] = await Customer.findOrCreate({
      where: { phone },
      defaults: { name: "Guest", phone, hotelId: hotel.id, createdBy: hotel.tenantId },
    });
    // Match the message text to a service type
    const normalized = text.toLowerCase();
    let type = "General";

    if (normalized.includes("clean")) type = "Room Cleaning";
    else if (normalized.includes("food")) type = "Food Order";
    else if (normalized.includes("laundry")) type = "Laundry";
    else if (normalized.includes("other")) type = "Other Request";

    // 4️⃣ Create service request
    const request = await ServiceRequest.create({
      hotelId: hotel.id,
      customerId: customer.id,
      roomId: customer.currentRoomId,
      type: serviceType,
      status: "pending",
      message: text,
    });
    // Notify staff via Socket.io
    // broadcastServiceRequest(hotel.id, request);
    // broadcastNotification(hotel.id, {
    //   type: "ServiceRequest",
    //   message: `WhatsApp: ${type} requested via ${phoneNumber}`,
    //   meta: request,
    // });
    // 5️⃣ Create notification for hotel staff
    const notif = await Notification.create({
      hotelId: hotel.id,
      title: `New ${serviceType} Request`,
      message: `${customer.name} requested: ${text}`,
      type: "ServiceRequest",
    });

    // 6️⃣ Broadcast to dashboard
    broadcastServiceRequest(hotel.id, request);
    broadcastNotification(hotel.id, notif);

    // ✅ Auto-reply to guest on WhatsApp (optional)
    if (hotel.whatsappAccessToken && hotel.whatsappPhoneNumberId) {
      const url = `https://graph.facebook.com/v18.0/${hotel.whatsappPhoneNumberId}/messages`;
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to: phoneNumber,
          text: { body: `✅ Thank you! Your ${serviceType} request has been received. Our staff will assist you shortly.` },
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
