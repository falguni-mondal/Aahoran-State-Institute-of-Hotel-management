import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import auditLogRouter from './routes/auditlog.routes.js';
import mentorRouter from './routes/mentor.routes.js';
import noticeRouter from './routes/notice.routes.js';
import resultRoutes from './routes/result.routes.js';
import studyMaterialRoutes from './routes/studyMaterial.routes.js';
import syllabusRoutes from './routes/syllabus.routes.js';
import campusFacilityRoutes from './routes/campusFacility.routes.js';
import placementRosterRoutes from './routes/placementRoster.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import contactRoutes from './routes/contact.routes.js';
import alumniRoutes from './routes/alumni.routes.js';

const app = express();

// =========================================
// 1. REVERSE PROXY & SECURITY HEADERS
// =========================================

// Enables Express to read X-Forwarded-For headers for accurate client IP resolution
app.set('trust proxy', 1);

// Set strict HTTP security headers
app.use(helmet());

// Development request telemetry
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =========================================
// 2. CORS (Cross-Origin Resource Sharing)
// =========================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Cross-Origin Request Blocked by Security Policy'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, // Required to accept HttpOnly sihm_session cookies
  })
);

// =========================================
// 3. BODY PARSING & OPTIMIZATION
// =========================================

app.use(compression());

// Parse JSON bodies with generous limit for multi-image gallery & facility CMS payloads
app.use(express.json({ limit: '500kb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Parse incoming cookies into req.cookies
app.use(cookieParser());

// =========================================
// 4. INJECTION & ATTACK PREVENTION
// =========================================

// Express 5 Safe In-Place NoSQL Sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// =========================================
// 5. APPLICATION ROUTES
// =========================================

// API Operational Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SIHM Backend Core API operational.',
    timestamp: new Date().toISOString(),
  });
});

// Authentication and Clearance Handshake Route
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admins', adminRouter);
app.use('/api/v1/audit-logs', auditLogRouter);
app.use('/api/v1/mentors', mentorRouter);
app.use('/api/v1/notices', noticeRouter);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/study-materials', studyMaterialRoutes);
app.use('/api/v1/syllabus', syllabusRoutes);
app.use('/api/v1/campus-facilities', campusFacilityRoutes);
app.use('/api/v1/placements', placementRosterRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/alumni', alumniRoutes);

// =========================================
// 6. ERROR HANDLING
// =========================================

// Unhandled Route Handler (404)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Resource not located: ${req.originalUrl}`,
  });
});

// Central Global Error Boundary
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || (String(err.statusCode).startsWith('4') ? 'fail' : 'error');

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || 'An internal administrative server error occurred.',
    });
  }
});

export default app;