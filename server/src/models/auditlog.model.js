import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
      immutable: true,
    },
    emailAttempted: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      immutable: true,
    },
    action: {
      type: String,
      required: [true, 'Audit log action is required'],
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
        '2FA_SETUP_INITIATED',
        '2FA_SETUP_COMPLETED',
        '2FA_VERIFIED',
        '2FA_FAILED',
        'BACKUP_CODE_USED',
        'REFRESH_TOKEN_ROTATED',
        'REFRESH_TOKEN_REUSE_DETECTED',
        'SESSION_REVOKED',
        'PASSWORD_CHANGED',
        'ACCOUNT_LOCKED',
        'ADMIN_PROVISIONED',
        'MENTOR_CREATED',
        'MENTOR_UPDATED',
        'MENTOR_DELETED',
        'NOTICE_CREATED',
        'NOTICE_UPDATED',
        'NOTICE_DELETED',
        'RESULT_CREATED',
        'RESULT_UPDATED',
        'RESULT_DELETED',
        'MATERIAL_CREATED',
        'MATERIAL_UPDATED',
        'MATERIAL_DELETED',
        'SYLLABUS_CREATED',
        'SYLLABUS_UPDATED',
        'SYLLABUS_DELETED',
        'FACILITY_CREATED',
        'FACILITY_UPDATED',
        'FACILITY_DELETED',
        'PLACEMENT_CREATED',
        'PLACEMENT_UPDATED',
        'PLACEMENT_DELETED',
        'GALLERY_CREATED',
        'GALLERY_UPDATED',
        'GALLERY_DELETED',
        'CONTACT_UPDATED',
        'ALUMNI_CREATED',
        'ALUMNI_UPDATED',
        'ALUMNI_DELETED',
        'ALUMNI_UPDATE_CREATED',
        'ALUMNI_UPDATE_UPDATED',
        'ALUMNI_UPDATE_DELETED',
        'ALUMNI_TESTIMONIAL_MODERATED',
        'ALUMNI_CMS_UPDATED',
      ],
      index: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING', 'CRITICAL'],
      required: [true, 'Audit log status is required'],
      immutable: true,
    },
    ipAddress: {
      type: String,
      required: [true, 'IP Address is required for audit logging'],
      index: true,
      immutable: true,
    },
    userAgent: {
      type: String,
      required: true,
      immutable: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
    versionKey: false,
  }
);

// =========================================
// IMMUTABILITY ENFORCEMENT (Hooks)
// =========================================

const blockMutation = async function () {
  const err = new Error(
    'Compliance Violation: Audit logs are strictly immutable and cannot be modified or deleted.'
  );
  err.statusCode = 403;
  throw err;
};

auditLogSchema.pre('updateOne', blockMutation);
auditLogSchema.pre('updateMany', blockMutation);
auditLogSchema.pre('findOneAndUpdate', blockMutation);
auditLogSchema.pre('replaceOne', blockMutation);
auditLogSchema.pre('findOneAndReplace', blockMutation);
auditLogSchema.pre('deleteOne', blockMutation);
auditLogSchema.pre('deleteMany', blockMutation);
auditLogSchema.pre('findOneAndDelete', blockMutation);

// =========================================
// INDEXING STRATEGY
// =========================================
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

// =========================================
// STATIC HELPER METHOD
// =========================================
auditLogSchema.statics.logEvent = async function (logData) {
  try {
    await this.create(logData);
  } catch (error) {
    console.error('CRITICAL: Failed to write to audit log', error);
  }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;