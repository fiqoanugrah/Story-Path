import axios from 'axios';

/**
 * Base URL and authentication configuration for the API
 */
const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';
export const USERNAME = 's4829897';

/**
 * Axios instance with preset configuration for API requests
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`
  }
});

/**
 * General error handling function to log and rethrow errors
 * @param {Object} error - The error object caught from API request
 * @param {string} action - Descriptive action where the error occurred (for logs)
 */
const handleError = (error, action) => {
  console.error(`Error ${action}:`, error.response?.data || error.message);
  throw error;  // Rethrow for UI error handling
};

// ---- Project Functions ---- //

/**
 * Fetches all projects from the API
 * @returns {Promise<Object[]>} List of projects
 */
export const getProjects = async () => {
  try {
    const response = await api.get('/project');
    return response.data;
  } catch (error) {
    handleError(error, 'fetching projects');
  }
};

/**
 * Fetches a single project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Object>} The project data
 */
export const getProject = async (id) => {
  try {
    const response = await api.get(`/project?id=eq.${id}`);
    return response.data[0];
  } catch (error) {
    handleError(error, 'fetching project');
  }
};

/**
 * Creates a new project
 * @param {Object} projectData - The project data to create
 * @returns {Promise<Object>} The created project data
 */
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/project', { ...projectData, username: USERNAME });
    return response.data;
  } catch (error) {
    handleError(error, 'creating project');
  }
};

/**
 * Updates an existing project
 * @param {string} id - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise<Object>} The updated project data
 */
export const updateProject = async (id, projectData) => {
  try {
    const response = await api.patch(`/project?id=eq.${id}`, { ...projectData, username: USERNAME });
    return response.data;
  } catch (error) {
    handleError(error, 'updating project');
  }
};

/**
 * Deletes a project by ID
 * @param {string} id - Project ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (id) => {
  try {
    await api.delete(`/project?id=eq.${id}`);
  } catch (error) {
    handleError(error, 'deleting project');
  }
};

// ---- Location Functions ---- //

/**
 * Fetches all locations for a given project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object[]>} List of locations
 */
export const getLocations = async (projectId) => {
  try {
    const response = await api.get(`/location?project_id=eq.${projectId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'fetching locations');
  }
};

/**
 * Fetches a single location by ID
 * @param {string} id - Location ID
 * @returns {Promise<Object>} The location data
 */
export const getLocation = async (id) => {
  try {
    const response = await api.get(`/location?id=eq.${id}`);
    return response.data[0];
  } catch (error) {
    handleError(error, 'fetching location');
  }
};

/**
 * Creates a new location
 * @param {Object} locationData - The location data to create
 * @returns {Promise<Object>} The created location data
 */
export const createLocation = async (locationData) => {
  try {
    const response = await api.post('/location', locationData);
    return response.data;
  } catch (error) {
    handleError(error, 'creating location');
  }
};

/**
 * Updates an existing location
 * @param {string} id - Location ID
 * @param {Object} locationData - Updated location data
 * @returns {Promise<Object>} The updated location data
 */
export const updateLocation = async (id, locationData) => {
  try {
    const response = await api.patch(`/location?id=eq.${id}`, locationData, {
      headers: {
        'Prefer': 'return=minimal'  // Minimize returned response to reduce payload
      },
    });
    return response.data;
  } catch (error) {
    handleError(error, 'updating location');
  }
};

/**
 * Deletes a location by ID
 * @param {string} id - Location ID
 * @returns {Promise<void>}
 */
export const deleteLocation = async (id) => {
  try {
    await api.delete(`/location?id=eq.${id}`);
  } catch (error) {
    handleError(error, 'deleting location');
  }
};

/**
 * Uploads an image file to the server
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} The uploaded image URL
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.url) {
      return response.data.url;
    } else {
      throw new Error('Image URL not received from server');
    }
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload image: ${error.response?.data?.message || error.message}`);
  }
};

export default api;
