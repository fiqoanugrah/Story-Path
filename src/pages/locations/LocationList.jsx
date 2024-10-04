import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLocations, deleteLocation } from '../../utils/api';
import { QRCodeSVG } from 'qrcode.react';

const LocationList = () => {
  const { projectId } = useParams();
  const [locations, setLocations] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showAllQR, setShowAllQR] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, [projectId]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await getLocations(projectId);
      setLocations(data); // Setting the locations data
      setProjectTitle(data[0]?.project_title || 'Project');
    } catch (err) {
      setError(`Failed to fetch locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const generateQRCodeData = (location) => {
    const data = {
      id: location.id,
      name: location.location_name,
      position: location.location_position,
      trigger: location.location_trigger,
      points: location.score_points,
      clue: location.clue,
      project_id: projectId
    };
    return JSON.stringify(data);
  };

  const renderQRCode = (location) => {
    const qrData = generateQRCodeData(location);
    return (
      <div className="flex justify-center items-center mt-4"> {/* Centering the QR Code */}
        <QRCodeSVG 
          value={qrData} 
          size={150} 
          level="M"
        />
      </div>
    );
  };

  const handlePrintAllQRCodes = () => {
    setShowAllQR(!showAllQR); 
  };

  // Moving location in the array
  const moveLocation = (index, direction) => {
    const newLocations = [...locations];
    const [movedLocation] = newLocations.splice(index, 1); 
    newLocations.splice(index + direction, 0, movedLocation); 
    setLocations(newLocations); // Force state update with new order
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
            {locations.map(location => (
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
