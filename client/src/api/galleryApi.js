const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Fetches active gallery entries for a specific gallery subnav category.
 *
 * @param {string} category - Subnav slug (e.g., 'our-campus', 'freshers-welcome')
 * @returns {Promise<Array>} List of published gallery post objects
 */
export const getPublicGalleryByCategory = async (category) => {
  try {
    const endpoint = category
      ? `${API_BASE_URL}/gallery/public/${encodeURIComponent(category)}`
      : `${API_BASE_URL}/gallery/public`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.items)) {
      return data.items;
    }

    return [];
  } catch (error) {
    console.error(`Failed to retrieve gallery (${category}) from API:`, error.message);
    return [];
  }
};

export default getPublicGalleryByCategory;