import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ScannerRedirect = () => {
  const { locationData } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const decodedData = JSON.parse(decodeURIComponent(locationData));
      navigate(`/project/${decodedData.project_id}/preview`, { 
        state: { 
          initialLocation: decodedData,
          isFromQRScan: true
        } 
      });
    } catch (err) {
      console.error('Error parsing QR code data:', err);
      navigate('/error');
    }
  }, [locationData, navigate]);

  return <div className="loading loading-lg">Redirecting...</div>;
};

export default ScannerRedirect;