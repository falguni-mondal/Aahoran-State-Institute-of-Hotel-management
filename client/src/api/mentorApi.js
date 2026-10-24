const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Fetches the active mentors directory from the backend CMS.
 * Uses native fetch with automatic error handling.
 *
 * @returns {Promise<Array>} List of published mentor objects
 */
export const getPublicMentors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mentors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.mentors)) {
      return data.mentors;
    }

    return [];
  } catch (error) {
    console.error('Failed to retrieve mentors from API:', error.message);
    return [];
  }
};

/**
 * Fetches the Principal mentor record from the backend CMS for the Homepage,
 * regardless of whether the mentor is hidden from the About page.
 *
 * @returns {Promise<Object|null>} Principal mentor object or null
 */
export const getPrincipalMentor = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mentors/principal`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && data.principal) {
      return data.principal;
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve principal mentor from API:', error.message);
    return null;
  }
};

export default getPublicMentors;
