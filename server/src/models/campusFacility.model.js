import mongoose from 'mongoose';

const facilityImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Facility image URL is required'],
      trim: true,
    },
    fileId: {
      type: String,
      default: null,
      trim: true,
    },
    alt: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const campusFacilitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Facility title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Facility slug identifier is required'],
      trim: true,
      lowercase: true,
    },
    images: {
      type: [facilityImageSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

campusFacilitySchema.index({ isActive: 1, order: 1, createdAt: 1 });

const CampusFacility = mongoose.model('CampusFacility', campusFacilitySchema);

export default CampusFacility;