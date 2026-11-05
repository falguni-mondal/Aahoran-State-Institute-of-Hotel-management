import { z } from 'zod';
import validator from 'validator';

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

export const ALUMNI_COURSES = [
  'B.Sc. in Hospitality & Hotel Administration (HHA)',
  'Craftsmanship Course in Food Production & Patisserie',
  'Craftsmanship Course in Food & Beverage Service',
  'Certificate Course in Front Office Operations',
  'Certificate Course in Housekeeping Operations',
  'Certificate Course in Bakery & Confectionery',
  'Hunar Se Rozgar Tak (HSRT)',
];

const currentYear = new Date().getFullYear() + 1;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
]);

// Non-regex Email Validator using `validator.isEmail` + domain check
export const nonRegexEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (val) =>
      validator.isEmail(val, {
        allow_utf8_local_part: false,
        require_tld: true,
        allow_ip_domain: false,
      }),
    'Please enter a valid, properly formatted email address'
  )
  .refine((val) => {
    const domain = val.split('@')[1] || '';
    return !DISPOSABLE_DOMAINS.has(domain);
  }, 'Disposable or temporary email addresses are not permitted');

// Non-regex Phone Validator checking digit count
export const nonRegexPhoneSchema = z
  .string()
  .trim()
  .refine((val) => {
    const digitsOnly = Array.from(val)
      .filter((ch) => ch >= '0' && ch <= '9')
      .join('');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }, 'Enter a valid 10 to 15 digit phone number');

// Non-regex URL Validator using native `new URL()`
export const nonRegexUrlSchema = z
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
  }, 'Please enter a valid URL starting with https://');

export const clientAlumniRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full Name must be at least 2 characters')
      .max(100, 'Full Name cannot exceed 100 characters'),
    email: nonRegexEmailSchema,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password cannot exceed 72 characters'),
    photograph: z.string().trim().optional().default('/alumni-bg.webp'),
    photoFileId: z.string().trim().nullable().optional().default(null),
    yearOfAdmission: z.coerce
      .number({ invalid_type_error: 'Enter a valid 4-digit admission year' })
      .int()
      .min(1995, 'Year of Admission must be 1995 or later')
      .max(currentYear, `Year of Admission cannot exceed ${currentYear}`),
    yearOfPassing: z.coerce
      .number({ invalid_type_error: 'Enter a valid 4-digit passing year' })
      .int()
      .min(1996, 'Year of Passing must be 1996 or later')
      .max(currentYear + 4, 'Enter a valid Year of Passing'),
    courseCompleted: z
      .string()
      .trim()
      .min(2, 'Please select or enter your completed course')
      .max(120, 'Course name cannot exceed 120 characters'),
    industrySector: z
      .string()
      .trim()
      .min(2, 'Please select your primary industry sector'),
    currentDesignation: z
      .string()
      .trim()
      .min(2, 'Current Designation is required (min 2 characters)')
      .max(120, 'Current Designation cannot exceed 120 characters'),
    organisation: z
      .string()
      .trim()
      .min(2, 'Organisation / Hotel Name is required (min 2 characters)')
      .max(150, 'Organisation / Hotel Name cannot exceed 150 characters'),
    currentLocation: z
      .string()
      .trim()
      .min(2, 'Current Location (City, Country) is required')
      .max(120, 'Current Location cannot exceed 120 characters'),
    contactNumber: nonRegexPhoneSchema,
    linkedInProfile: nonRegexUrlSchema,
    achievements: z
      .string()
      .trim()
      .max(2000, 'Achievements / Profile summary cannot exceed 2000 characters')
      .optional()
      .default(''),
    publicConsent: z.boolean().default(true),
    showEmailPublicly: z.boolean().default(false),
    showPhonePublicly: z.boolean().default(false),
  })
  .refine((data) => data.yearOfPassing >= data.yearOfAdmission, {
    message: 'Year of Passing must be equal to or after Year of Admission',
    path: ['yearOfPassing'],
  });

export const clientAlumniLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter your SIHM Registration ID or Email Address'),
  password: z.string().min(1, 'Enter your account password'),
});

export const clientTestimonialSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, 'Your full name is required')
    .max(100, 'Name is too long'),
  authorEmail: nonRegexEmailSchema,
  batchYear: z
    .string()
    .trim()
    .min(4, 'Batch year is required (e.g., 2018-2021)')
    .max(40, 'Batch year is too long'),
  registrationId: z.string().trim().toUpperCase().optional().default(''),
  designation: z.string().trim().max(120).optional().default(''),
  organisation: z.string().trim().max(120).optional().default(''),
  heading: z
    .string()
    .trim()
    .min(4, 'Catchy heading must be at least 4 characters')
    .max(160, 'Heading cannot exceed 160 characters'),
  content: z
    .string()
    .trim()
    .min(15, 'Please share at least 15 characters about your SIHM experience')
    .max(2000, 'Testimonial cannot exceed 2000 characters'),
});

export const clientReplySchema = z.object({
  parentReplyId: z.string().nullable().optional().default(null),
  authorName: z
    .string()
    .trim()
    .min(2, 'Your name is required')
    .max(80, 'Name is too long'),
  authorEmail: nonRegexEmailSchema,
  authorBatch: z
    .string()
    .trim()
    .min(2, 'Batch Year or Affiliation is required')
    .max(50),
  registrationId: z.string().trim().toUpperCase().optional().default(''),
  content: z
    .string()
    .trim()
    .min(2, 'Reply cannot be empty')
    .max(1500, 'Reply cannot exceed 1500 characters'),
});

export const clientReunionRsvpSchema = z.object({
  registrationId: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, 'Valid SIHM Registration ID is required (e.g. SIHM-2021-BSC-...)')
    .max(40, 'Registration ID is too long'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full Name is required')
    .max(100, 'Name is too long'),
  batchYear: z
    .string()
    .trim()
    .min(4, 'Batch Year is required (e.g., 2018-2021)')
    .max(40, 'Batch Year is too long'),
  email: nonRegexEmailSchema,
  contactNumber: nonRegexPhoneSchema,
  guestsCount: z.coerce.number().int().min(0).max(5).default(0),
  dietaryPreference: z.string().trim().max(60).default('Standard'),
  note: z.string().trim().max(500).optional().default(''),
});

export const extractZodErrors = (zodError) => {
  const fieldErrors = {};
  if (zodError?.issues) {
    zodError.issues.forEach((issue) => {
      const key = issue.path[0] || 'general';
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    });
  }
  return fieldErrors;
};