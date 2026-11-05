import { z } from 'zod';
import validator from 'validator';
import { ALUMNI_SECTORS, ALUMNI_UPDATE_CATEGORIES } from '../models/alumni.model.js';

const currentYear = new Date().getFullYear() + 1;

// Non-regex email validator using `validator.isEmail`
const nonRegexEmailValidator = z
  .string({ required_error: 'Email Address is required' })
  .trim()
  .toLowerCase()
  .refine(
    (val) =>
      validator.isEmail(val, {
        allow_utf8_local_part: false,
        require_tld: true,
        allow_ip_domain: false,
      }),
    'Please provide a valid, deliverable email address'
  );

// Non-regex phone validator (checks digit count between 10 and 15)
const nonRegexPhoneValidator = z
  .string({ required_error: 'Contact Number is required' })
  .trim()
  .refine((val) => {
    const digitsOnly = Array.from(val)
      .filter((ch) => ch >= '0' && ch <= '9')
      .join('');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }, 'Please enter a valid 10 to 15 digit contact number');

// Non-regex URL validator using native `new URL()`
const nonRegexOptionalUrl = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((val) => {
    if (!val) return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Please enter a valid URL starting with http:// or https://');

// =========================================
// 1. ALUMNI REGISTRATION ZOD SCHEMA (WITH PASSWORD)
// =========================================
export const alumniRegistrationSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full Name is required' })
      .trim()
      .min(2, 'Full Name must be at least 2 characters')
      .max(100, 'Full Name cannot exceed 100 characters'),
    email: nonRegexEmailValidator,
    password: z
      .string({ required_error: 'Account Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password cannot exceed 72 characters'),
    photograph: z.string().trim().optional().default('/alumni-bg.webp'),
    photoFileId: z.string().trim().nullable().optional().default(null),
    yearOfAdmission: z.coerce
      .number({ required_error: 'Year of Admission is required' })
      .int()
      .min(1995, 'Year of Admission must be 1995 or later')
      .max(currentYear, `Year of Admission cannot exceed ${currentYear}`),
    yearOfPassing: z.coerce
      .number({ required_error: 'Year of Passing is required' })
      .int()
      .min(1996, 'Year of Passing must be 1996 or later')
      .max(currentYear + 4, 'Invalid Year of Passing'),
    courseCompleted: z
      .string({ required_error: 'Course Completed is required' })
      .trim()
      .min(2, 'Please select or enter your completed course')
      .max(120, 'Course name cannot exceed 120 characters'),
    industrySector: z
      .string()
      .trim()
      .optional()
      .default('Hotel Operations')
      .refine(
        (val) => !val || ALUMNI_SECTORS.includes(val),
        'Please select a valid hospitality industry sector'
      ),
    currentDesignation: z
      .string({ required_error: 'Current Designation is required' })
      .trim()
      .min(2, 'Current Designation must be at least 2 characters')
      .max(120, 'Current Designation cannot exceed 120 characters'),
    organisation: z
      .string({ required_error: 'Organisation / Hotel Name is required' })
      .trim()
      .min(2, 'Organisation / Hotel Name must be at least 2 characters')
      .max(150, 'Organisation / Hotel Name cannot exceed 150 characters'),
    currentLocation: z
      .string({ required_error: 'Current Location is required' })
      .trim()
      .min(2, 'Current Location must be at least 2 characters')
      .max(120, 'Current Location cannot exceed 120 characters'),
    contactNumber: nonRegexPhoneValidator,
    linkedInProfile: nonRegexOptionalUrl,
    achievements: z
      .string()
      .trim()
      .max(2000, 'Achievements / Professional Profile cannot exceed 2000 characters')
      .optional()
      .default(''),
    publicConsent: z.boolean().optional().default(true),
    showEmailPublicly: z.boolean().optional().default(false),
    showPhonePublicly: z.boolean().optional().default(false),
  })
  .refine((data) => data.yearOfPassing >= data.yearOfAdmission, {
    message: 'Year of Passing must be greater than or equal to Year of Admission',
    path: ['yearOfPassing'],
  });

// =========================================
// 2. ALUMNI LOGIN ZOD SCHEMA (REG ID OR EMAIL + PASSWORD)
// =========================================
export const alumniLoginSchema = z.object({
  identifier: z
    .string({ required_error: 'Registration ID or Email is required' })
    .trim()
    .min(3, 'Please enter your Alumni Registration ID or Email Address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Please enter your password'),
});

// =========================================
// 3. TESTIMONIAL SUBMISSION ZOD SCHEMA
// =========================================
export const testimonialSubmissionSchema = z.object({
  authorName: z
    .string({ required_error: 'Your Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  authorEmail: nonRegexEmailValidator,
  batchYear: z
    .string({ required_error: 'Batch Year is required' })
    .trim()
    .min(4, 'Please enter a valid batch year (e.g., 2018-2021 or 2021)')
    .max(40, 'Batch year cannot exceed 40 characters'),
  registrationId: z.string().trim().toUpperCase().optional().default(''),
  designation: z.string().trim().max(120).optional().default(''),
  organisation: z.string().trim().max(120).optional().default(''),
  avatar: z.string().trim().optional().default('/alumni-bg.webp'),
  heading: z
    .string({ required_error: 'A catchy testimonial heading is required' })
    .trim()
    .min(4, 'Heading must be at least 4 characters')
    .max(160, 'Heading cannot exceed 160 characters'),
  content: z
    .string({ required_error: 'Testimonial message is required' })
    .trim()
    .min(15, 'Testimonial must be at least 15 characters')
    .max(2000, 'Testimonial cannot exceed 2000 characters'),
});

// =========================================
// 4. NESTED REPLY SUBMISSION ZOD SCHEMA
// =========================================
export const replySubmissionSchema = z.object({
  parentReplyId: z.string().trim().nullable().optional().default(null),
  authorName: z
    .string({ required_error: 'Name is required to reply' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  authorEmail: nonRegexEmailValidator,
  authorBatch: z
    .string({ required_error: 'Batch or affiliation is required' })
    .trim()
    .min(2, 'Please provide your Batch Year or affiliation')
    .max(60),
  registrationId: z.string().trim().toUpperCase().optional().default(''),
  content: z
    .string({ required_error: 'Reply text cannot be empty' })
    .trim()
    .min(2, 'Reply must be at least 2 characters')
    .max(1500, 'Reply cannot exceed 1500 characters'),
  isOfficialAdmin: z.boolean().optional().default(false),
});

// =========================================
// 5. REUNION RSVP ("MARK AS COMING") ZOD SCHEMA
// =========================================
export const reunionRsvpSchema = z.object({
  registrationId: z
    .string({ required_error: 'Alumni Registration ID is required' })
    .trim()
    .toUpperCase()
    .min(4, 'Please enter your SIHM Alumni Registration ID')
    .max(40, 'Registration ID is too long'),
  fullName: z
    .string({ required_error: 'Full Name is required' })
    .trim()
    .min(2, 'Full Name must be at least 2 characters')
    .max(100, 'Full Name cannot exceed 100 characters'),
  batchYear: z
    .string({ required_error: 'Batch Year is required' })
    .trim()
    .min(4, 'Please specify your Batch Year')
    .max(40, 'Batch Year is too long'),
  email: nonRegexEmailValidator,
  contactNumber: nonRegexPhoneValidator.optional().or(z.literal('')),
  guestsCount: z.coerce.number().int().min(0).max(5).optional().default(0),
  dietaryPreference: z.string().trim().max(60).optional().default('Standard'),
  note: z.string().trim().max(500).optional().default(''),
});

// =========================================
// 6. ADMIN ALUMNI UPDATE / REUNION / NEWS ZOD SCHEMA
// =========================================
export const alumniUpdateItemSchema = z.object({
  category: z.enum(ALUMNI_UPDATE_CATEGORIES),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  subtitle: z.string().trim().max(200).optional().default(''),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(3000),
  publishDate: z.string().optional(),
  eventDate: z.string().trim().max(100).optional().default(''),
  eventVenue: z.string().trim().max(200).optional().default(''),
  company: z.string().trim().max(150).optional().default(''),
  location: z.string().trim().max(150).optional().default(''),
  actionUrl: z.string().trim().max(500).optional().default(''),
  image: z.string().trim().optional().default(''),
  imageFileId: z.string().trim().nullable().optional().default(null),
  isPinned: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const formatZodError = (zodError) => {
  if (!zodError || !zodError.issues) return 'Validation failed.';
  return zodError.issues
    .map((issue) => `${issue.path.join('.') ? `${issue.path.join('.')}: ` : ''}${issue.message}`)
    .join(' | ');
};