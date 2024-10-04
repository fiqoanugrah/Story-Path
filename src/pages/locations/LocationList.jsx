import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLocations, deleteLocation } from '../../utils/api';
import { QRCodeSVG } from 'qrcode.react';

/**
 * LocationList component
 * Displays the list of locations for a given project with the ability to add, edit, delete, and show QR codes for each location.
 */
const LocationList = () => {
  const { projectId } = useParams(); // Extract projectId from URL params
  const [locations, setLocations] = useState([]); // Store the list of locations
  const [projectTitle, setProjectTitle] = useState(''); // Store the project title
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedQR, setSelectedQR] = useState(null); // Track which location's QR code is being shown
  const [showAllQR, setShowAllQR] = useState(false); // State to toggle showing all QR codes

  // Fetch locations on component mount or when projectId changes
  useEffect(() => {
    fetchLocations();
  }, [projectId]);

  /**
   * Fetch all locations for the given project
   */
  const fetchLocations = async () => {
    try {
      setLoading(true); // Show loading spinner
      const data = await getLocations(projectId);
      setLocations(data); // Set locations data
      setProjectTitle(data[0]?.project_title || 'Project'); // Set project title
    } catch (err) {
      setError(`Failed to fetch locations: ${err.message}`); // Handle fetch error
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  /**
   * Handle the deletion of a location
   * @param {string} id - The ID of the location to delete
   */
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
        fetchLocations(); // Refresh locations after deletion
      } catch (err) {
        setError(`Failed to delete location: ${err.message}`);
      }
    }
  };

  /**
   * Generate the data to be encoded in a QR code for a specific location
   * @param {Object} location - The location object
   * @returns {string} - The QR code data as a JSON string
   */
  const generateQRCodeData = (location) => {
    const data = {
      id: location.id,
      name: location.location_name,
      position: location.location_position,
      trigger: location.location_trigger,
      points: location.score_points,
      clue: location.clue,
      project_id: projectId,
    };
    return JSON.stringify(data);
  };

  /**
   * Render the QR code for a specific location
   * @param {Object} location - The location object
   * @returns JSX to render the QR code
   */
  const renderQRCode = (location) => {
    const qrData = generateQRCodeData(location);
    return (
      <div className="flex justify-center items-center mt-4">
        <QRCodeSVG value={qrData} size={150} level="M" />
      </div>
    );
  };

  /**
   * Toggle displaying QR codes for all locations
   */
  const handlePrintAllQRCodes = () => {
    setShowAllQR(!showAllQR);
  };

  /**
   * Move a location up or down in the list
   * @param {number} index - The index of the location to move
   * @param {number} direction - The direction to move (-1 for up, 1 for down)
   */
  const moveLocation = (index, direction) => {
    const newLocations = [...locations];
    const [movedLocation] = newLocations.splice(index, 1);
    newLocations.splice(index + direction, 0, movedLocation);
    setLocations(newLocations); // Update locations with the new order
  };

  if (loading) return <div className="loading loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{projectTitle} - Locations</h1>
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap">
        <Link to={`/project/${projectId}/location/new`} className="btn btn-primary mb-2 sm:mb-0">
          Add Location
        </Link>
        <div className="flex space-x-4">
          <button onClick={handlePrintAllQRCodes} className="btn btn-warning">
            {showAllQR ? 'Hide All QR Codes' : 'Print QR Codes for All'}
          </button>
          <Link to={`/project/${projectId}/preview`} className="btn btn-success">
            Preview
          </Link>
        </div>
      </div>

      {showAllQR && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">All QR Codes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div key={location.id} className="p-4 bg-white shadow-md rounded-lg flex flex-col justify-center items-center">
                <h3 className="text-lg font-bold mb-2">{location.location_name} QR Code</h3>
                {renderQRCode(location)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {locations.map((location, index) => (
          <div key={location.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{location.location_name}</h2>
              <p>Trigger: {location.location_trigger}</p>
              <p>Position: {location.location_position}</p>
              <p>Points: {location.score_points}</p>
              <div className="card-actions justify-end space-x-2">
                {/* Arrow buttons for reordering */}
                <button
                  onClick={() => moveLocation(index, -1)}
                  className="btn btn-sm btn-outline"
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveLocation(index, 1)}
                  className="btn btn-sm btn-outline"
                  disabled={index === locations.length - 1}
                >
                  ↓
                </button>

                <Link to={`/project/${projectId}/location/edit/${location.id}`} className="btn btn-sm btn-outline btn-info">
                  Edit
                </Link>
                <button onClick={() => handleDelete(location.id)} className="btn btn-sm btn-outline btn-error">
                  Delete
                </button>
                <button onClick={() => setSelectedQR(selectedQR === location.id ? null : location.id)} className="btn btn-sm btn-outline btn-warning">
                  {selectedQR === location.id ? 'Hide' : 'Show'} QR Code
                </button>
              </div>
              {selectedQR === location.id && renderQRCode(location)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationList;
