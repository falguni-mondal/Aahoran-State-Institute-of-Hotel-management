import mongoose from 'mongoose';

const distanceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Landmark title is required'],
      trim: true,
    },
    distance: {
      type: String,
      required: [true, 'Distance value is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['flight', 'rail', 'node', 'urban', 'curve'],
      default: 'node',
    },
  },
  { _id: true }
);

export const DEFAULT_CONTACT_DATA = {
  generalEmail: 'sihmdurgapur@gmail.com',
  primaryPhone: '+91 892 759 6669',
  whatsappNumber: '918927596669',
  officeHours: '(Mon - Fri: 9AM - 5PM) except Public Holidays',
  secondaryPhone: '0343-2500775',
  additionalPhones: [],
  placementEmail: 'tpocell.sihmdgp@gmail.com',
  placementLabel: 'Placement',
  address:
    'State Institute of Hotel Management,\nFuljhore, Durgapur - 713206\nWest Bengal, India.',
  mapDirectionsUrl:
    'https://www.google.com/maps?q=23.54757943246294,87.33992374149645',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=23.54757943246294,87.33992374149645&z=16&output=embed',
  distances: [
    {
      title: 'Kazi Nazrul Islam Airport',
      distance: '24.6 km',
      type: 'flight',
    },
    {
      title: 'Durgapur Railway Station',
      distance: '11.7 km',
      type: 'rail',
    },
    {
      title: 'Benachity Prantika',
      distance: '8.6 km',
      type: 'node',
    },
    {
      title: 'Durgapur City Center Bus Stand',
      distance: '7.8 km',
      type: 'urban',
    },
    {
      title: 'Muchipara Bus Stand',
      distance: '6.9 km',
      type: 'curve',
    },
  ],
};

const contactSchema = new mongoose.Schema(
  {
    generalEmail: {
      type: String,
      default: DEFAULT_CONTACT_DATA.generalEmail,
      trim: true,
    },
    primaryPhone: {
      type: String,
      default: DEFAULT_CONTACT_DATA.primaryPhone,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: DEFAULT_CONTACT_DATA.whatsappNumber,
      trim: true,
    },
    officeHours: {
      type: String,
      default: DEFAULT_CONTACT_DATA.officeHours,
      trim: true,
    },
    secondaryPhone: {
      type: String,
      default: DEFAULT_CONTACT_DATA.secondaryPhone,
      trim: true,
    },
    additionalPhones: {
      type: [String],
      default: [],
    },
    placementEmail: {
      type: String,
      default: DEFAULT_CONTACT_DATA.placementEmail,
      trim: true,
    },
    placementLabel: {
      type: String,
      default: DEFAULT_CONTACT_DATA.placementLabel,
      trim: true,
    },
    address: {
      type: String,
      default: DEFAULT_CONTACT_DATA.address,
      trim: true,
    },
    mapDirectionsUrl: {
      type: String,
      default: DEFAULT_CONTACT_DATA.mapDirectionsUrl,
      trim: true,
    },
    mapEmbedUrl: {
      type: String,
      default: DEFAULT_CONTACT_DATA.mapEmbedUrl,
      trim: true,
    },
    distances: {
      type: [distanceItemSchema],
      default: () => DEFAULT_CONTACT_DATA.distances,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;