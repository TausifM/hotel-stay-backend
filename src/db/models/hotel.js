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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Owner user ID",
    },
    // 🏨 Basic Info
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    starRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1–5 rating",
    },

    imageUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      comment: "Array of image URLs",
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
    // 🕒 Policies & Timings
    checkInTime: { type: DataTypes.TIME, allowNull: true },
    checkOutTime: { type: DataTypes.TIME, allowNull: true },
    cancelationPolicy: { type: DataTypes.TEXT, allowNull: true },
    smokingPolicy: { type: DataTypes.STRING, allowNull: true },
    petPolicy: { type: DataTypes.STRING, allowNull: true },

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
    adultCount: { type: DataTypes.INTEGER, defaultValue: 1 },
    childCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    pricePerNight: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, allowNull: false },
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
    // tenantId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   comment: "Owner or property group",
    // },

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
    totalBookings: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalRevenue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    averageRating: { type: DataTypes.FLOAT, defaultValue: 0.0 },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    occupancyRate: { type: DataTypes.FLOAT, defaultValue: 0.0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
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
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "hotels",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["city"] },
      { fields: ["state"] },
    ],
  }
);
