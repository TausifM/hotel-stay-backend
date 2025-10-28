// src/utils/whatsapp.js
import axios from "axios";
import { Hotel } from "../db/models/hotel.js";

export async function sendWhatsAppMessage(phone, hotelId) {
  const hotel = await Hotel.findByPk(hotelId);
  if (!hotel || !hotel.whatsappAccessToken || !hotel.whatsappPhoneNumberId)
    return;

  const url = `https://graph.facebook.com/v18.0/${hotel.whatsappPhoneNumberId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Welcome to Grand Palace Hotel 🏨\nChoose a service:" },
        action: {
          buttons: [
            {
              type: "reply",
              reply: { id: "CLEANING", title: "🧹 Room Cleaning" },
            },
            { type: "reply", reply: { id: "FOOD", title: "🍽 Food Order" } },
            { type: "reply", reply: { id: "WATER", title: "💧 Water Refill" } },
            { type: "reply", reply: { id: "LAUNDRY", title: "👕 Laundry Service" } },
            { type: "reply", reply: { id: "OTHER", title: "❓ Other Request" } },
          ],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${hotel.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}
