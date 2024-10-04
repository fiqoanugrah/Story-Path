import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createLocation, updateLocation, getLocation, USERNAME } from '../../utils/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Leaflet icon images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * MapEvents component handles clicks on the map to update the position
 * @param {function} setPosition - Function to update position state on click
 */
function MapEvents({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e); // Update map position when map is clicked
    },
  });
  return null;
}

/**
 * LocationForm component
 * Handles creation and editing of locations, with a map interface for selecting a position.
 */
const LocationForm = () => {
  const { projectId, id } = useParams(); // Get projectId and locationId from URL params
  const navigate = useNavigate(); // Hook to handle navigation
  const [formData, setFormData] = useState({
    location_name: '',
    location_trigger: 'Location',
    location_position: '',
    score_points: 0,
    clue: '',
    location_content: ''
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [mapPosition, setMapPosition] = useState(null); // Map position state

  useEffect(() => {
    if (id) {
      fetchLocation(id); // Fetch existing location if editing
    }
  }, [id]);

  useEffect(() => {
    if (formData.location_position) {
      const [lat, lng] = formData.location_position.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapPosition([lat, lng]); // Set map position if valid coordinates exist
      }
    }
  }, [formData.location_position]);

  /**
   * Fetch the existing location for editing
   * @param {string} locationId - The ID of the location to fetch
   */
  const fetchLocation = async (locationId) => {
    try {
      setLoading(true); // Show loading spinner
      const location = await getLocation(locationId);
      setFormData(location);
      if (location.location_position) {
        const [lat, lng] = location.location_position.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapPosition([lat, lng]); // Set map position if coordinates are valid
        } else {
          setMapPosition([-27.4975, 153.0137]); // Default to Brisbane if coordinates are invalid
        }
      }
    } catch (err) {
      setError(`Failed to fetch location: ${err.message}`);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  /**
   * Handle form input changes for location data
   * @param {object} e - Event object from input change
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value !== "" ? parseFloat(value) : 0) : value, // Handle numeric input
    }));
  };

  /**
   * Handle rich text content changes for location content
   * @param {string} content - The updated rich text content
   */
  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, location_content: content }));
  };

  /**
   * Handle click event on the map to set the position
   * @param {object} e - Leaflet event object containing latlng
   */
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMapPosition([lat, lng]); // Update map position
    setFormData((prev) => ({
      ...prev,
      location_position: `${lat.toFixed(6)},${lng.toFixed(6)}`, // Set position in form data
    }));
  };

  /**
   * Handle form submission for creating or updating location
   * @param {object} e - Event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    setError(null);
    try {
      const dataToSend = {
        ...formData,
        project_id: projectId,
        username: USERNAME,
      };
      if (id) {
        await updateLocation(id, dataToSend); // Update location if ID exists
      } else {
        await createLocation(dataToSend); // Create new location otherwise
      }
      navigate(`/project/${projectId}/locations`); // Redirect to locations list
    } catch (err) {
      setError(`Failed to save location: ${err.message}`);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="min-h-screen bg-base-200 p-4">
      {/* Back button */}
      <button
        onClick={() => navigate(`/project/${projectId}/locations`)}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <span>Back to Locations</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{id ? 'Edit' : 'Create'} Location</h1>
        {error && <div className="alert alert-error mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Location Name</span>
            </label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Location Trigger</span>
            </label>
            <select
              name="location_trigger"
              value={formData.location_trigger}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="Location">Location</option>
              <option value="QR Code">QR Code</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Location Position</span>
            </label>
            <input
              type="text"
              name="location_position"
              value={formData.location_position}
              onChange={handleChange}
              className="input input-bordered w-full mb-2"
              placeholder="Latitude, Longitude"
              required
            />
            <div className="h-96 w-full mb-2">
              <MapContainer 
                center={mapPosition || [-27.4975, 153.0137]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapPosition && (
                  <Marker position={mapPosition}>
                    <Popup>Selected location</Popup>
                  </Marker>
                )}
                <MapEvents setPosition={handleMapClick} />
              </MapContainer>
            </div>
            <p className="text-sm text-gray-600">Click on the map to set the location or enter coordinates manually.</p>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Points for Reaching Location</span>
            </label>
            <input
              type="number"
              name="score_points"
              value={formData.score_points}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Clue</span>
            </label>
            <textarea
              name="clue"
              value={formData.clue}
              onChange={handleChange}
              className="textarea textarea-bordered h-24 w-full"
              placeholder="Enter the clue that leads to the next location"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Location Content</span>
            </label>
            <ReactQuill
              value={formData.location_content}
              onChange={handleContentChange}
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                  [{list: 'ordered'}, {list: 'bullet'}],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  ['link', 'image', 'video'],
                  ['clean']
                ],
              }}
              formats={['header', 'font', 'list', 'bullet', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'link', 'image', 'video']}
              className="min-h-[200px] bg-white"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : null}
            {id ? 'Update' : 'Create'} Location
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;
