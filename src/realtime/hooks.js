// src/realtime/hooks.js
import { broadcastNotification, broadcastServiceRequest, broadcastBookingUpdate } from "./index.js";
import { Notification } from "../db/models/notification.js";

/**
 * Attach Sequelize hooks to models for realtime + notifications.
 * Should be called after all models are imported.
 */
export function attachModelHooks({ Hotel, ServiceRequest, Booking, Payment, Feedback }) {
  // 🧹 Service Request created
  ServiceRequest.addHook("afterCreate", async (request) => {
    const notif = await Notification.create({
      hotelId: request.hotelId,
      type: "ServiceRequest",
      message: `New ${request.type} request from room ${request.roomNumber || "?"}`,
      meta: request.toJSON(),
    });
    broadcastServiceRequest(request.hotelId, request);
    broadcastNotification(request.hotelId, notif);
  });

  // 💳 Payment success
  Payment.addHook("afterCreate", async (payment) => {
    const notif = await Notification.create({
      hotelId: payment.hotelId,
      type: "Payment",
      message: `Payment of ₹${payment.amount} received for booking ${payment.bookingId}`,
      meta: payment.toJSON(),
    });
    broadcastNotification(payment.hotelId, notif);
  });

  // 🧾 Booking created or updated
  Booking.addHook("afterUpdate", async (booking) => {
    broadcastBookingUpdate(booking.hotelId, booking);
    const notif = await Notification.create({
      hotelId: booking.hotelId,
      type: "Booking",
      message: `Booking #${booking.id} updated (status: ${booking.status})`,
      meta: booking.toJSON(),
    });
    broadcastNotification(booking.hotelId, notif);
  });

  // ⭐ Guest feedback
  Feedback.addHook("afterCreate", async (feedback) => {
    const notif = await Notification.create({
      hotelId: feedback.hotelId,
      type: "Feedback",
      message: `Guest left feedback: ${feedback.rating}⭐ - ${feedback.comment || ""}`,
      meta: feedback.toJSON(),
    });
    broadcastNotification(feedback.hotelId, notif);
  });

  console.log("✅ Sequelize realtime hooks attached.");
}
