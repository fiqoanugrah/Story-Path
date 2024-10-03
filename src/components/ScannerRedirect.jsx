import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLocation } from '../utils/api';

const ScannerRedirect = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationAndRedirect = async () => {
      try {
        const location = await getLocation(locationId);
        if (location && location.project_id) {
          navigate(`/project/${location.project_id}/preview`, { state: { initialLocation: locationId } });
        } else {
          setError('Location not found');
        }
      } catch (err) {
        setError('Error fetching location data');
      }
    };

    fetchLocationAndRedirect();
  }, [locationId, navigate]);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return <div className="loading loading-lg">Redirecting...</div>;
};

export default ScannerRedirect;