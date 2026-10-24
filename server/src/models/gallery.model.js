import mongoose from 'mongoose';

export const GALLERY_CATEGORIES = [
  'our-campus',
  'inaugural-programme',
  'freshers-welcome',
  'farewell',
  'krida',
  'stcp',
  'programme-and-events',
];

const galleryImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
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
    aspect: {
      type: String,
      enum: ['vertical', 'horizontal', 'square'],
      default: 'horizontal',
    },
  },
  { _id: true }
);

const gallerySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Gallery subnav category is required'],
      enum: GALLERY_CATEGORIES,
      index: true,
    },
    programDate: {
      type: String,
      default: '',
      trim: true,
    },
    formattedDate: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [galleryImageSchema],
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

gallerySchema.index({ category: 1, isActive: 1, order: 1, createdAt: -1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;