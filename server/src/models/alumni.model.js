import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ALUMNI_SECTORS = [
  'Hotel Operations',
  'Food Production & Culinary Arts',
  'Food & Beverage Service',
  'Front Office Operations',
  'Housekeeping Operations',
  'Cruise Line Industry',
  'Airline & Airport Hospitality',
  'Tourism & Travel Management',
  'Entrepreneurship',
  'Hospitality Education',
  'International Hospitality Industry',
];

export const ALUMNI_UPDATE_CATEGORIES = [
  'reunion',
  'announcement',
  'achievement',
  'institute_news',
  'career_opportunity',
  'newsletter',
];

// =========================================
// 1. ALUMNI ACCOUNT, PROFILE & DIRECTORY SCHEMA
// =========================================
const alumniSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: [true, 'Unique Alumni Registration ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Account password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['Alumni'],
      default: 'Alumni',
      immutable: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    photograph: {
      type: String,
      default: '/alumni-bg.webp',
      trim: true,
    },
    photoFileId: {
      type: String,
      default: null,
      trim: true,
    },
    yearOfAdmission: {
      type: Number,
      required: [true, 'Year of admission is required'],
      index: true,
    },
    yearOfPassing: {
      type: Number,
      required: [true, 'Year of passing is required'],
      index: true,
    },
    courseCompleted: {
      type: String,
      required: [true, 'Course completed is required'],
      trim: true,
      index: true,
    },
    industrySector: {
      type: String,
      default: 'Hotel Operations',
      trim: true,
      index: true,
    },
    currentDesignation: {
      type: String,
      required: [true, 'Current designation is required'],
      trim: true,
    },
    organisation: {
      type: String,
      required: [true, 'Organisation / Hotel name is required'],
      trim: true,
    },
    currentLocation: {
      type: String,
      required: [true, 'Current location is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    linkedInProfile: {
      type: String,
      default: '',
      trim: true,
    },
    achievements: {
      type: String,
      default: '',
      trim: true,
    },
    // Privacy & Consent Controls
    publicConsent: {
      type: Boolean,
      default: true,
    },
    showEmailPublicly: {
      type: Boolean,
      default: false,
    },
    showPhonePublicly: {
      type: Boolean,
      default: false,
    },
    // Admin Moderation & Feature Highlights
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    isDistinguished: {
      type: Boolean,
      default: false,
      index: true,
    },
    distinguishedCitation: {
      type: String,
      default: '',
      trim: true,
    },
    isSuccessStory: {
      type: Boolean,
      default: false,
      index: true,
    },
    successStoryTitle: {
      type: String,
      default: '',
      trim: true,
    },
    successStoryContent: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

alumniSchema.index({ status: 1, publicConsent: 1, yearOfPassing: -1 });

// Hash password before saving
alumniSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare plaintext password against bcrypt hash
alumniSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// =========================================
// 2. ALUMNI TESTIMONIAL & INFINITE REPLIES SCHEMA (ADMIN MODERATED, NO LIKES)
// =========================================
const replyItemSchema = new mongoose.Schema(
  {
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      default: null,
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    authorEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    authorBatch: {
      type: String,
      default: '',
      trim: true,
    },
    registrationId: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: '',
      trim: true,
    },
    authorRole: {
      type: String,
      enum: ['Alumni', 'Guest', 'Admin', 'SuperAdmin'],
      default: 'Guest',
    },
    isOfficialAdmin: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true,
      maxlength: [1500, 'Reply cannot exceed 1500 characters'],
    },
    // Every public reply must be approved by Admin first (official admin replies auto-approve)
    isApproved: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const alumniTestimonialSchema = new mongoose.Schema(
  {
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      default: null,
    },
    authorName: {
      type: String,
      required: [true, 'Alumni name is required'],
      trim: true,
    },
    authorEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    batchYear: {
      type: String,
      required: [true, 'Batch year is required'],
      trim: true,
    },
    registrationId: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    designation: {
      type: String,
      default: '',
      trim: true,
    },
    organisation: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: '/alumni-bg.webp',
      trim: true,
    },
    heading: {
      type: String,
      required: [true, 'Testimonial catchy heading is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Testimonial message is required'],
      trim: true,
    },
    // Every public testimonial/post must be approved by Admin before public display
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    replies: {
      type: [replyItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

alumniTestimonialSchema.index({ isApproved: 1, isFeatured: -1, createdAt: -1 });

// =========================================
// 3. ALUMNI UPDATES, REUNIONS, NEWS & CAREERS SCHEMA
// =========================================
const reunionAttendeeSchema = new mongoose.Schema(
  {
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      default: null,
    },
    registrationId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    batchYear: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      default: '',
      trim: true,
    },
    guestsCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    dietaryPreference: {
      type: String,
      default: 'Standard',
      trim: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      default: 'Coming',
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const alumniUpdateSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Update category is required'],
      enum: ALUMNI_UPDATE_CATEGORIES,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    eventDate: {
      type: String,
      default: '',
      trim: true,
    },
    eventVenue: {
      type: String,
      default: '',
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    actionUrl: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    imageFileId: {
      type: String,
      default: null,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    attendees: {
      type: [reunionAttendeeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

alumniUpdateSchema.index({ isActive: 1, category: 1, isPinned: -1, publishDate: -1 });

// =========================================
// 4. ALUMNI ACTIVITY TELEMETRY LOG SCHEMA
// =========================================
const alumniActivitySchema = new mongoose.Schema(
  {
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      default: null,
      index: true,
    },
    registrationId: {
      type: String,
      default: 'GUEST',
      uppercase: true,
      trim: true,
      index: true,
    },
    alumniName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'REGISTRATION_SUBMITTED',
        'ALUMNI_LOGIN',
        'PROFILE_APPROVED',
        'PROFILE_UPDATED',
        'REUNION_RSVP_COMING',
        'TESTIMONIAL_POSTED',
        'COMMENT_REPLIED',
        'ADMIN_MODERATION',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '0.0.0.0',
    },
    status: {
      type: String,
      enum: ['Active', 'Flagged', 'Archived'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

alumniActivitySchema.index({ createdAt: -1 });

// =========================================
// 5. ALUMNI PAGE CMS CONFIGURATION SCHEMA
// =========================================
const sectorConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    featuredCompanies: { type: String, default: '', trim: true },
    alumniCountLabel: { type: String, default: '85+ Alumni', trim: true },
  },
  { _id: false }
);

const statConfigSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    suffix: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const alumniPageConfigSchema = new mongoose.Schema(
  {
    heroEyebrow: {
      type: String,
      default: 'Global Hospitality Brotherhood & Sisterhood',
      trim: true,
    },
    heroTitleLine1: {
      type: String,
      default: 'ALUMNI',
      trim: true,
    },
    heroTitleLine2: {
      type: String,
      default: 'NETWORK',
      trim: true,
    },
    introHeading: {
      type: String,
      default: 'Once a Student, Always a Part of SIHM Family',
      trim: true,
    },
    introParagraph1: {
      type: String,
      default:
        'The State Institute of Hotel Management, Durgapur, takes immense pride in its alumni, who represent the institute across various segments of the hospitality and tourism industry. Our alumni are ambassadors of our institution, carrying forward the values of professionalism, excellence, dedication and service.',
      trim: true,
    },
    introParagraph2: {
      type: String,
      default:
        'The Alumni Network aims to strengthen lifelong connections, encourage professional collaboration, celebrate achievements and create opportunities for present and future generations of hospitality professionals.',
      trim: true,
    },
    privacyNotice: {
      type: String,
      default:
        'Alumni personal information is never publicly displayed without explicit consent. All registration records, testimonials, and replies are maintained securely and require administrative verification before public publishing.',
      trim: true,
    },
    stats: {
      type: [statConfigSchema],
      default: [
        { label: 'Global Alumni Network', value: '1,800', suffix: '+' },
        { label: 'Hospitality & Luxury Brands', value: '140', suffix: '+' },
        { label: 'Countries Represented', value: '18', suffix: '+' },
        { label: 'Industry Leadership Roles', value: '94', suffix: '%' },
      ],
    },
    careerSectors: {
      type: [sectorConfigSchema],
      default: [
        {
          name: 'Hotel Operations',
          tagline: 'General Management & Luxury Property Leadership',
          description:
            'Driving operational excellence across 5-star palaces, business hotels, and international resort chains.',
          featuredCompanies: 'Taj Hotels, Oberoi Group, ITC Hotels, Marriott International',
          alumniCountLabel: '340+ Alumni',
        },
        {
          name: 'Food Production & Culinary Arts',
          tagline: 'Executive Chefs, Patissiers & Culinary Directors',
          description:
            'Curating signature gastronomy, artisan patisserie, and high-volume luxury banquet kitchens worldwide.',
          featuredCompanies: 'The Leela, Hyatt Regency, Conrad, JW Marriott',
          alumniCountLabel: '290+ Alumni',
        },
        {
          name: 'Food & Beverage Service',
          tagline: 'F&B Directors, Sommeliers & Mixology Specialists',
          description:
            'Orchestrating fine-dining concepts, specialty beverage programs, and luxury hospitality experiences.',
          featuredCompanies: 'Four Seasons, Sheraton, Radisson Blu, The Park',
          alumniCountLabel: '260+ Alumni',
        },
        {
          name: 'Front Office Operations',
          tagline: 'Rooms Division Managers & Guest Relations Heads',
          description:
            'Leading VIP guest experiences, revenue optimization, and bespoke concierge standards.',
          featuredCompanies: 'Ritz-Carlton, Westin, Hilton, Trident Hotels',
          alumniCountLabel: '220+ Alumni',
        },
        {
          name: 'Housekeeping Operations',
          tagline: 'Executive Housekeepers & Aesthetic Curators',
          description:
            'Maintaining immaculate luxury suite standards, sustainable linen systems, and property aesthetics.',
          featuredCompanies: 'Accor, Novotel, Lalit Great Eastern, Holiday Inn',
          alumniCountLabel: '180+ Alumni',
        },
        {
          name: 'Cruise Line Industry',
          tagline: 'Maritime Hospitality & International Fleet Operations',
          description:
            'Managing luxury ocean liners, onboard culinary brigades, and global passenger hospitality.',
          featuredCompanies: 'Royal Caribbean, Carnival, Norwegian, Costa Cruises',
          alumniCountLabel: '115+ Alumni',
        },
        {
          name: 'Airline & Airport Hospitality',
          tagline: 'Cabin Crew, In-Flight Catering & Lounge Operations',
          description:
            'Delivering premium aviation hospitality, international VIP lounge management, and flight kitchens.',
          featuredCompanies: 'Qatar Airways, Emirates, IndiGo, TajSATS',
          alumniCountLabel: '130+ Alumni',
        },
        {
          name: 'Tourism & Travel Management',
          tagline: 'Destination Marketing & Luxury Tour Curation',
          description:
            'Shaping state tourism boards, experiential travel agencies, and heritage circuit management.',
          featuredCompanies: 'MakeMyTrip, Thomas Cook, WB Tourism, SOTC',
          alumniCountLabel: '95+ Alumni',
        },
        {
          name: 'Entrepreneurship',
          tagline: 'Founders of Restaurants, Cloud Kitchens & Boutiques',
          description:
            'Building independent culinary ventures, artisanal cafes, event firms, and boutique resorts.',
          featuredCompanies: 'Independent Founders, Hospitality Startups & Consultancies',
          alumniCountLabel: '80+ Alumni',
        },
        {
          name: 'Hospitality Education',
          tagline: 'Academic Deans, Researchers & Culinary Mentors',
          description:
            'Mentoring the next generation of hospitality leaders across NCHMCT and international institutes.',
          featuredCompanies: 'IHMs, SIHMs, Private Hospitality Universities',
          alumniCountLabel: '65+ Alumni',
        },
        {
          name: 'International Hospitality Industry',
          tagline: 'Global Placements Across Middle East, Europe & Asia-Pacific',
          description:
            'Representing SIHM Durgapur across international luxury hubs in Dubai, Doha, London, Singapore, and Maldives.',
          featuredCompanies: 'Jumeirah, Atlantis Dubai, Marina Bay Sands, Raffles',
          alumniCountLabel: '175+ Alumni',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const Alumni = mongoose.model('Alumni', alumniSchema);
export const AlumniTestimonial = mongoose.model(
  'AlumniTestimonial',
  alumniTestimonialSchema
);
export const AlumniUpdate = mongoose.model('AlumniUpdate', alumniUpdateSchema);
export const AlumniActivity = mongoose.model(
  'AlumniActivity',
  alumniActivitySchema
);
export const AlumniPageConfig = mongoose.model(
  'AlumniPageConfig',
  alumniPageConfigSchema
);

export default Alumni;