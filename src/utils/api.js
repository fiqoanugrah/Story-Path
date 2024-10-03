import axios from 'axios';

const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';
export const USERNAME = 's4829897';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`
  }
});

const handleError = (error, action) => {
  console.error(`Error ${action}:`, error.response?.data || error.message);
  throw error;  // Ensure we still throw the error so we can catch it in the UI
};

// Project functions
export const getProjects = async () => {
  try {
    const response = await api.get('/project');
    return response.data;
  } catch (error) {
    handleError(error, 'fetching projects');
  }
};

export const getProject = async (id) => {
  try {
    const response = await api.get(`/project?id=eq.${id}`);
    return response.data[0];
  } catch (error) {
    handleError(error, 'fetching project');
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/project', { ...projectData, username: USERNAME });
    return response.data;
  } catch (error) {
    handleError(error, 'creating project');
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.patch(`/project?id=eq.${id}`, { ...projectData, username: USERNAME });
    return response.data;
  } catch (error) {
    handleError(error, 'updating project');
  }
};

export const deleteProject = async (id) => {
  try {
    await api.delete(`/project?id=eq.${id}`);
  } catch (error) {
    handleError(error, 'deleting project');
  }
};

// Location functions
export const getLocations = async (projectId) => {
  try {
    const response = await api.get(`/location?project_id=eq.${projectId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'fetching locations');
  }
};

export const getLocation = async (id) => {
  try {
    const response = await api.get(`/location?id=eq.${id}`);
    return response.data[0];
  } catch (error) {
    handleError(error, 'fetching location');
  }
};

export const createLocation = async (locationData) => {
  try {
    const response = await api.post('/location', locationData);
    return response.data;
  } catch (error) {
    handleError(error, 'creating location');
  }
};

export const updateLocation = async (id, locationData) => {
  try {
    const response = await api.patch(`/location?id=eq.${id}`, locationData, {
      headers: {
        'Prefer': 'return=minimal'
      },
    });
    return response.data;
  } catch (error) {
    handleError(error, 'updating location');
  }
};

export const deleteLocation = async (id) => {
  try {
    await api.delete(`/location?id=eq.${id}`);
  } catch (error) {
    handleError(error, 'deleting location');
  }
};

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
