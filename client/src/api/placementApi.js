const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Fetches active Executive Roster items for the Placement page from the backend CMS.
 *
 * @returns {Promise<Array>} List of published placement roster objects
 */
export const getPublicPlacements = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/placements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.placements)) {
      return data.placements;
    }

    return [];
  } catch (error) {
    console.error('Failed to retrieve placement roster from API:', error.message);
    return [];
  }
};

export default getPublicPlacements;
