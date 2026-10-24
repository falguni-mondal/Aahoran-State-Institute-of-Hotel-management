import Contact, { DEFAULT_CONTACT_DATA } from '../models/contact.model.js';
import AuditLog from '../models/auditlog.model.js';
import catchAsync from '../utils/catchAsync.js';

// =========================================
// 1. PUBLIC: GET CONTACT DETAILS
// =========================================
export const getPublicContact = catchAsync(async (req, res) => {
  const contactDoc = await Contact.findOne().select('-__v').lean();

  res.status(200).json({
    status: 'success',
    contact: contactDoc || DEFAULT_CONTACT_DATA,
  });
});

// =========================================
// 2. ADMIN: GET CONTACT DETAILS
// =========================================
export const getAdminContact = catchAsync(async (req, res) => {
  let contactDoc = await Contact.findOne().lean();

  if (!contactDoc) {
    contactDoc = DEFAULT_CONTACT_DATA;
  }

  res.status(200).json({
    status: 'success',
    contact: contactDoc,
  });
});

// =========================================
// 3. ADMIN: UPDATE CONTACT DETAILS
// =========================================
export const updateContact = catchAsync(async (req, res) => {
  const {
    generalEmail,
    primaryPhone,
    whatsappNumber,
    officeHours,
    secondaryPhone,
    additionalPhones,
    placementEmail,
    placementLabel,
    address,
    mapDirectionsUrl,
    mapEmbedUrl,
    distances,
  } = req.body;

  let contact = await Contact.findOne();
  if (!contact) {
    contact = new Contact(DEFAULT_CONTACT_DATA);
  }

  if (generalEmail !== undefined) contact.generalEmail = String(generalEmail).trim();
  if (primaryPhone !== undefined) {
    contact.primaryPhone = String(primaryPhone).trim();
    if (whatsappNumber === undefined) {
      const digitsOnly = String(primaryPhone).replace(/[^0-9]/g, '');
      if (digitsOnly) contact.whatsappNumber = digitsOnly;
    }
  }
  if (whatsappNumber !== undefined) {
    contact.whatsappNumber = String(whatsappNumber).replace(/[^0-9]/g, '');
  }
  if (officeHours !== undefined) contact.officeHours = String(officeHours).trim();
  if (secondaryPhone !== undefined) contact.secondaryPhone = String(secondaryPhone).trim();
  if (Array.isArray(additionalPhones)) {
    contact.additionalPhones = additionalPhones
      .map((p) => String(p).trim())
      .filter(Boolean);
  }
  if (placementEmail !== undefined) contact.placementEmail = String(placementEmail).trim();
  if (placementLabel !== undefined) contact.placementLabel = String(placementLabel).trim();
  if (address !== undefined) contact.address = String(address).trim();
  if (mapDirectionsUrl !== undefined) contact.mapDirectionsUrl = String(mapDirectionsUrl).trim();
  if (mapEmbedUrl !== undefined) contact.mapEmbedUrl = String(mapEmbedUrl).trim();

  if (Array.isArray(distances)) {
    const validTypes = ['flight', 'rail', 'node', 'urban', 'curve'];
    contact.distances = distances
      .filter((d) => d && String(d.title || '').trim() && String(d.distance || '').trim())
      .map((d, idx) => ({
        title: String(d.title).trim(),
        distance: String(d.distance).trim(),
        type: validTypes.includes(d.type)
          ? d.type
          : validTypes[idx % validTypes.length],
      }));
  }

  await contact.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'CONTACT_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      contactId: contact._id,
      generalEmail: contact.generalEmail,
      primaryPhone: contact.primaryPhone,
      placementEmail: contact.placementEmail,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Contact page details updated successfully.',
    contact,
  });
});