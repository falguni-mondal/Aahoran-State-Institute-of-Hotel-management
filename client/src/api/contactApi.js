const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Fetches live Contact Page configuration from the backend CMS.
 *
 * @returns {Promise<Object|null>} Contact details object or null
 */
export const getPublicContact = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && data.contact) {
      return data.contact;
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve contact details from API:', error.message);
    return null;
  }
};

export default getPublicContact;
