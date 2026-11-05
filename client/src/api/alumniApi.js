const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

const ALUMNI_TOKEN_KEY = 'sihm_alumni_access_token';
const ALUMNI_USER_CACHE_KEY = 'sihm_alumni_user_cache';

export const getStoredAlumniToken = () => {
  try {
    return localStorage.getItem(ALUMNI_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredAlumniUser = () => {
  try {
    const raw = localStorage.getItem(ALUMNI_USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const persistAlumniSession = (token, alumni) => {
  try {
    if (token) localStorage.setItem(ALUMNI_TOKEN_KEY, token);
    if (alumni) localStorage.setItem(ALUMNI_USER_CACHE_KEY, JSON.stringify(alumni));
  } catch {
    // Ignore storage quota errors
  }
};

export const clearStoredAlumniSession = () => {
  try {
    localStorage.removeItem(ALUMNI_TOKEN_KEY);
    localStorage.removeItem(ALUMNI_USER_CACHE_KEY);
  } catch {
    // Ignore
  }
};

const buildAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getStoredAlumniToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Fetches dynamic "NEW" badge flags for the main Navbar & Footer.
 */
export const getPublicNavBadges = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/nav-badges`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.badges : null;
  } catch {
    return null;
  }
};

/**
 * Fetches complete public Alumni Network hub data (plus currentUser if logged in).
 */
export const getPublicAlumniHub = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/hub`, {
      method: 'GET',
      headers: buildAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      if (data.currentUser) {
        persistAlumniSession(getStoredAlumniToken(), data.currentUser);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve Alumni Hub data:', error.message);
    return null;
  }
};

/**
 * Uploads an alumni portrait photograph directly to ImageKit CDN or falls back
 * to a compressed Data URL if ImageKit credentials are not configured in local dev.
 */
export const uploadAlumniPortrait = async (file) => {
  if (!file) return { url: '/alumni-bg.webp', fileId: null };

  try {
    if (IMAGEKIT_PUBLIC_KEY) {
      const authRes = await fetch(`${API_BASE_URL}/alumni/upload-auth`);
      if (authRes.ok) {
        const { signature, expire, token } = await authRes.json();
        if (signature && expire && token) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append(
            'fileName',
            `alumni_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          );
          formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
          formData.append('signature', signature);
          formData.append('expire', expire);
          formData.append('token', token);
          formData.append('folder', '/alumni/portraits');
          formData.append('useUniqueFileName', 'true');

          const uploadRes = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const result = await uploadRes.json();
            return { url: result.url, fileId: result.fileId };
          }
        }
      }
    }
  } catch (err) {
    console.warn('ImageKit direct upload fallback triggered:', err.message);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 480;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve({
          url: canvas.toDataURL('image/webp', 0.82),
          fileId: null,
        });
      };
      img.onerror = () => resolve({ url: '/alumni-bg.webp', fileId: null });
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ url: '/alumni-bg.webp', fileId: null });
    reader.readAsDataURL(file);
  });
};

/**
 * Registers a new Alumnus account, persists session, and triggers Resend email.
 */
export const submitAlumniRegistration = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/alumni/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Registration failed.');
    error.registrationId = data.registrationId || null;
    error.fieldErrors = data.errors || null;
    throw error;
  }

  if (data.accessToken || data.alumni) {
    persistAlumniSession(data.accessToken, data.alumni);
  }
  return data;
};

/**
 * Logs in an Alumnus by Registration ID or Email + Password.
 */
export const loginAlumnusAccount = async ({ identifier, password }) => {
  const response = await fetch(`${API_BASE_URL}/alumni/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid login credentials.');
  }

  if (data.accessToken || data.alumni) {
    persistAlumniSession(data.accessToken, data.alumni);
  }
  return data;
};

/**
 * Fetches current logged-in Alumnus session from backend.
 */
export const fetchCurrentAlumniSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/auth/me`, {
      method: 'GET',
      headers: buildAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.authenticated && data.alumni) {
      persistAlumniSession(getStoredAlumniToken(), data.alumni);
      return data.alumni;
    }
    return null;
  } catch {
    return getStoredAlumniUser();
  }
};

/**
 * Logs out the current Alumnus session.
 */
export const logoutAlumnusAccount = async () => {
  try {
    await fetch(`${API_BASE_URL}/alumni/auth/logout`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      credentials: 'include',
    });
  } catch {
    // Continue local cleanup
  } finally {
    clearStoredAlumniSession();
  }
};

/**
 * Verifies an Alumni Registration ID and auto-fills basic details for Reunion RSVP.
 */
export const verifyRegistrationId = async (registrationId) => {
  const response = await fetch(
    `${API_BASE_URL}/alumni/verify/${encodeURIComponent(registrationId.trim())}`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration ID not found.');
  }
  return data.alumni;
};

/**
 * Posts a new Alumni Testimonial (queued for Admin approval).
 */
export const postAlumniTestimonial = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/alumni/testimonials`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit testimonial.');
  }
  return data;
};

/**
 * Posts a nested reply to a testimonial or to another reply (queued for Admin approval).
 */
export const postTestimonialReply = async (testimonialId, payload) => {
  const response = await fetch(
    `${API_BASE_URL}/alumni/testimonials/${testimonialId}/replies`,
    {
      method: 'POST',
      headers: buildAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit reply.');
  }
  return data;
};

/**
 * Submits Reunion RSVP ("Mark as Coming").
 */
export const markReunionComing = async (reunionId, payload) => {
  const response = await fetch(
    `${API_BASE_URL}/alumni/updates/${reunionId}/rsvp`,
    {
      method: 'POST',
      headers: buildAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit Reunion RSVP.');
  }
  return data;
};