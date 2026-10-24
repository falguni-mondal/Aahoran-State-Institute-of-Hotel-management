import apiClient from '../api/axios.js';

const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

/**
 * Normalizes a target ImageKit folder path so it always starts with '/'
 * and contains only safe path characters.
 */
const normalizeFolderPath = (folder = '/mentors') => {
  const cleaned = String(folder || '/mentors')
    .trim()
    .replace(/\\/g, '/')
    .replace(/[^a-zA-Z0-9/_-]/g, '-')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  return cleaned.startsWith('/') ? cleaned || '/uploads' : `/${cleaned}`;
};

/**
 * Uploads an image file directly to ImageKit using backend-generated authentication parameters.
 *
 * @param {File} file - The image file selected from an <input type="file" />
 * @param {string} folder - Target folder inside ImageKit (e.g., '/campus-facilities/library', '/placements/executive-roster', '/gallery/our-campus')
 * @returns {Promise<{ url: string, fileId: string }>} Upload result containing the CDN URL and fileId
 */
export const uploadToImageKit = async (file, folder = '/mentors') => {
  if (!file) {
    throw new Error('Please select an image file to upload.');
  }

  if (!IMAGEKIT_PUBLIC_KEY) {
    throw new Error(
      'VITE_IMAGEKIT_PUBLIC_KEY is not defined in your frontend environment variables.'
    );
  }

  const normalizedFolder = normalizeFolderPath(folder);
  const folderPrefix =
    normalizedFolder
      .replace(/^\//, '')
      .replace(/\//g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '_') || 'asset';

  // 1. Fetch ephemeral signature, token, and expire time from our protected backend endpoint
  const authResponse = await apiClient.get('/mentors/upload-auth');
  const { signature, expire, token } = authResponse.data;

  if (!signature || !expire || !token) {
    throw new Error('Failed to retrieve authentication tokens for ImageKit upload.');
  }

  // 2. Build multi-part form payload required by ImageKit Upload API
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'fileName',
    `${folderPrefix}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  );
  formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
  formData.append('signature', signature);
  formData.append('expire', expire);
  formData.append('token', token);
  formData.append('folder', normalizedFolder);
  formData.append('useUniqueFileName', 'true');

  // 3. Post directly to ImageKit API
  const uploadResponse = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  const uploadResult = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(uploadResult.message || 'Image upload to ImageKit failed.');
  }

  return {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
  };
};

/**
 * Uploads multiple image files sequentially to ImageKit with progress reporting.
 *
 * @param {File[]} files - Array of File objects
 * @param {string} folder - Target ImageKit folder path
 * @param {(current: number, total: number) => void} onProgress - Optional progress callback
 * @returns {Promise<Array<{ url: string, fileId: string, name: string }>>}
 */
export const uploadMultipleToImageKit = async (
  files = [],
  folder = '/gallery',
  onProgress
) => {
  const fileList = Array.from(files);
  const uploaded = [];

  for (let i = 0; i < fileList.length; i += 1) {
    if (onProgress) {
      onProgress(i + 1, fileList.length);
    }
    const result = await uploadToImageKit(fileList[i], folder);
    uploaded.push({
      url: result.url,
      fileId: result.fileId,
      name: fileList[i].name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
    });
  }

  return uploaded;
};

export default uploadToImageKit;