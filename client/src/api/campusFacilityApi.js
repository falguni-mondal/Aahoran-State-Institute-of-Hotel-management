const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Fetches active campus facilities from the backend CMS.
 *
 * @returns {Promise<Array>} List of published campus facility objects
 */
export const getPublicFacilities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/campus-facilities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.facilities)) {
      return data.facilities;
    }

    return [];
  } catch (error) {
    console.error('Failed to retrieve campus facilities from API:', error.message);
    return [];
  }
};

export default getPublicFacilities;