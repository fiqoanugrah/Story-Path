import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ScannerRedirect = () => {
  const { locationData } = useParams(); // Extracts encoded location data from the URL
  const navigate = useNavigate(); // Allows programmatic navigation

  useEffect(() => {
    try {
      // Decode the location data from the QR code and navigate to the preview page
      const decodedData = JSON.parse(decodeURIComponent(locationData));
      navigate(`/project/${decodedData.project_id}/preview`, { 
        state: { 
          initialLocation: decodedData, // Passing the decoded location data to the preview page
          isFromQRScan: true // Flag to indicate the user arrived from a QR scan
        } 
      });
    } catch (err) {
      // Handle any errors that occur during decoding or parsing of the QR data
      console.error('Error parsing QR code data:', err);
      navigate('/error'); // Redirect to an error page if parsing fails
    }
  }, [locationData, navigate]); // Only runs when locationData or navigate changes

  return <div className="loading loading-lg">Redirecting...</div>; // Show loading state while redirecting
};

export default ScannerRedirect;
