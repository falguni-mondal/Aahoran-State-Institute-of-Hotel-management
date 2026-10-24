import mongoose from 'mongoose';

const placementRosterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    batch: {
      type: String,
      required: [true, 'Academic batch is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Appointed role is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Hiring organization is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Candidate portrait image URL is required'],
      default: '/nchmct-bg.webp',
      trim: true,
    },
    imageFileId: {
      type: String,
      default: null,
      trim: true,
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

placementRosterSchema.index({ isActive: 1, order: 1, createdAt: 1 });

const PlacementRoster = mongoose.model('PlacementRoster', placementRosterSchema);

export default PlacementRoster;