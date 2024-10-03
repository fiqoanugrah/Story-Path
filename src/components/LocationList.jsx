import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLocations, deleteLocation } from '../utils/api';
import QRCode from 'react-qr-code';

const LocationList = () => {
  const { projectId } = useParams();
  const [locations, setLocations] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, [projectId]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await getLocations(projectId);
      setLocations(data);
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
        fetchLocations();
      } catch (err) {
        setError(`Failed to delete location: ${err.message}`);
      }
    }
  };

  const handleMoveLocation = (index, direction) => {
    const newLocations = [...locations];
    const item = newLocations[index];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newLocations.length) {
      newLocations.splice(index, 1);
      newLocations.splice(newIndex, 0, item);
      setLocations(newLocations);
      localStorage.setItem(`locations_${projectId}`, JSON.stringify(newLocations));
    }
  };

  const handleQRCode = (locationId) => {
    setSelectedQR(selectedQR === locationId ? null : locationId);
  };

  const handlePrintAllQRCodes = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>All QR Codes</title></head><body>');
    locations.forEach(location => {
      printWindow.document.write(`<h2>${location.location_name}</h2>`);
      printWindow.document.write(`<div id="qr-${location.id}"></div>`);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    locations.forEach(location => {
      new QRCode(printWindow.document.getElementById(`qr-${location.id}`), {
        text: `https://yourapp.com/location/${location.id}`,
        width: 128,
        height: 128,
      });
    });

    printWindow.print();
  };

  useEffect(() => {
    const storedLocations = localStorage.getItem(`locations_${projectId}`);
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    } else {
      fetchLocations();
    }
  }, [projectId]);

  if (loading) return <div className="loading loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{projectTitle} - Locations</h1>
      </div>
  
      <div className="flex justify-between items-center mb-6">
        <Link to={`/project/${projectId}/location/new`} className="btn btn-primary">
          Add Location
        </Link>
        <div>
          <button onClick={handlePrintAllQRCodes} className="btn btn-warning mr-2">Print QR Codes for All</button>
          <Link to={`/project/${projectId}/preview`} className="btn btn-success">
            Preview
          </Link>
        </div>
      </div>
  
      <div className="space-y-4">
        {locations.map((location, index) => (
          <div key={location.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{location.location_name}</h2>
              <p>Trigger: {location.location_trigger}</p>
              <p>Position: {location.location_position}</p>
              <p>Points: {location.score_points}</p>
              <div className="card-actions justify-end">
                <button 
                  onClick={() => handleMoveLocation(index, 'up')} 
                  className="btn btn-sm btn-outline"
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button 
                  onClick={() => handleMoveLocation(index, 'down')} 
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
                <button onClick={() => handleQRCode(location.id)} className="btn btn-sm btn-outline btn-warning">
                  {selectedQR === location.id ? 'Hide' : 'Show'} QR Code
                </button>
              </div>
              {selectedQR === location.id && (
                <div className="mt-4 flex justify-center">
                  <QRCode value={`${window.location.origin}/location/${location.id}`} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );  
};

export default LocationList;