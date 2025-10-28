import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Hotel = sequelize.define(
  "Hotel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // 🏨 Basic Info
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    starRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1–5 rating",
    },

    // 🌍 Location
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },

    // ☎️ Contact & Communication
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    website: { type: DataTypes.STRING },
    whatsappNumber: { type: DataTypes.STRING },

    // 💬 WhatsApp Cloud API Integration
    whatsappAccessToken: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Meta Cloud API token for hotel’s WhatsApp",
    },
    whatsappPhoneNumberId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Meta Cloud API phone number ID",
    },
    whatsappVerifyToken: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Webhook verification token for WhatsApp setup",
    },

    // 💸 Pricing & Offers
    baseRoomPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    discount: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment:
        "e.g. { type: 'percentage', value: 10, validTill: '2025-12-31' }",
    },
    specialOffers: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment:
        "e.g. [{ title: 'Weekend Getaway', description: '20% off for 2 nights' }]",
    },
    promoCodes: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "e.g. [{ code: 'WELCOME10', discount: 10 }]",
    },

    // 🏠 Room & Facilities
    roomInventory: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Stores room types, counts, rates, etc.",
    },
    servicesOffered: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "e.g. ['Food', 'Laundry', 'Cleaning', 'WiFi']",
    },
    amenities: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "e.g. ['Pool', 'Gym', 'Parking', 'Spa']",
    },

    // 🔒 SaaS Tenant Context
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Owner or property group",
    },

    // ⚙️ Operational Config
    checkInEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    autoAssignRoom: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoSendWelcomeMessage: { type: DataTypes.BOOLEAN, defaultValue: true },
    allowOnlineBooking: { type: DataTypes.BOOLEAN, defaultValue: true },

    // 🧩 Metadata
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Custom per-hotel data or settings",
    },
    // After existing fields, add:

    // ✅ Check-in & Guest Experience
    webCheckInAllowed: { type: DataTypes.BOOLEAN, defaultValue: false },
    mobileGuestAppEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    selfServiceKioskEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    digitalKeyEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },

    // 🤖 AI & Upselling
    aiUpsellEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    aiCheckInEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    upsellOffers: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "e.g. [{ when: 'preArrival', offer: 'Room upgrade 20% off' }]",
    },

    // 📊 Analytics & BI
    analyticsEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    reportingDashboards: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "dashboard config & widgets",
    },

    // 🔗 Channel & Booking Integration
    channelManagerEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    connectedBookingChannels: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "e.g. ['Booking.com', 'Airbnb', 'Expedia']",
    },

    // 🛡️ Default Values & Meta
    defaultCurrency: { type: DataTypes.STRING, defaultValue: "INR" },
    timeZone: { type: DataTypes.STRING, allowNull: true },
    // maybe loyalty program
    loyaltyProgramEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    loyaltyProgramDetails: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    tableName: "hotels",
    timestamps: true,
    indexes: [
      { fields: ["tenantId"] },
      { fields: ["city"] },
      { fields: ["state"] },
    ],
  }
);
