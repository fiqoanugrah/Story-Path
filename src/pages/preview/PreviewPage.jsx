import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProject, getLocations } from '../../utils/api';

/**
 * PreviewPage component
 * Displays the project preview with location-based content and a points system.
 * Users can select locations from a dropdown to view their associated content and clues.
 */
const PreviewPage = () => {
  const { projectId } = useParams(); // Get the project ID from the URL parameters
  const navigate = useNavigate(); // Navigation hook for programmatic navigation
  const location = useLocation(); // Hook to access route state for QR scan or page origin
  const [project, setProject] = useState(null); // State to store project details
  const [locations, setLocations] = useState([]); // State to store project locations
  const [currentLocationIndex, setCurrentLocationIndex] = useState(-1); // Track current selected location
  const [points, setPoints] = useState(0); // Track user points based on locations visited
  const [locationsVisited, setLocationsVisited] = useState([]); // Store IDs of visited locations
  const [loading, setLoading] = useState(true); // State to show loading indicator
  const [error, setError] = useState(null); // State to store error messages

  /**
   * useEffect hook to fetch project and locations data when the component mounts
   * Also handles auto-selecting a location if navigating from QR scan
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Show loading spinner
        const projectData = await getProject(projectId); // Fetch project details
        let locationsData = await getLocations(projectId); // Fetch project locations

        // Sort locations based on their creation order (assuming 'id' reflects creation order)
        locationsData = locationsData.sort((a, b) => a.id - b.id);
        
        setProject(projectData); // Store project data in state
        setLocations(locationsData); // Store locations in state

        // If redirected from QR scan, find and select the initial location
        if (location.state?.isFromQRScan) {
          const scannedLocationData = location.state.initialLocation;
          const locationIndex = locationsData.findIndex(loc => loc.id === scannedLocationData.id);
          if (locationIndex !== -1) {
            handleLocationChange(locationIndex); // Automatically select the scanned location
          }
        }
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`); // Display error message
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchData();
  }, [projectId, location.state]); // Re-run effect when projectId or location state changes

  /**
   * Handle location change (from dropdown selection)
   * Updates the current location and adds points if the location has not been visited before
   * @param {number} index - The index of the selected location in the locations array
   */
  const handleLocationChange = (index) => {
    if (index !== currentLocationIndex) {
      setCurrentLocationIndex(index); // Update selected location index
      if (index !== -1 && !locationsVisited.includes(locations[index].id)) {
        updateScore(locations[index]); // Add points for unvisited location
        setLocationsVisited(prev => [...prev, locations[index].id]); // Add to visited list
      }
    }
  };

  /**
   * Update user score when visiting a new location
   * @param {Object} location - The selected location object with score points
   */
  const updateScore = (location) => {
    setPoints(prevPoints => prevPoints + location.score_points); // Increment points
  };

  /**
   * Render the content of the current location or the project initial content (home screen)
   * @returns JSX to render based on current location
   */
  const renderContent = () => {
    if (currentLocationIndex === -1) {
      // Display initial project details (homescreen) if no location is selected
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{project.title}</h2>
          <p className="mb-2">{project.instructions}</p>
          <p className="mb-2"><strong>Initial Clue:</strong> {project.initial_clue}</p>
        </div>
      );
    } else {
      // Display selected location details and clue
      const location = locations[currentLocationIndex];
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{location.location_name}</h2>
          <div dangerouslySetInnerHTML={{ __html: location.location_content }} />
          {/* Display the actual clue for the selected location */}
          <p className="mt-2"><strong>Clue:</strong> {location.clue}</p>
        </div>
      );
    }
  };

  // Display loading spinner while fetching data
  if (loading) return <div className="loading loading-lg"></div>;

  // Display error message if an error occurred during data fetching
  if (error) return <div className="alert alert-error">{error}</div>;

  // Display message if no project data is available
  if (!project) return <div>No project data available.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.title} - Preview</h1>
        <button onClick={() => navigate(`/project/${projectId}/locations`)} className="btn btn-primary">
          Back to Locations
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/4">
          <select
            value={currentLocationIndex}
            onChange={(e) => handleLocationChange(parseInt(e.target.value))}
            className="select select-bordered w-full"
          >
            <option value="-1">Homescreen</option>
            {locations.map((loc, index) => (
              <option key={loc.id} value={index}>{loc.location_name}</option>
            ))}
          </select>

          <div className="mt-4 card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Stats</h2>
              <p>Points: {points} / {locations.reduce((sum, loc) => sum + loc.score_points, 0)}</p>
              <p>Locations Visited: {locationsVisited.length} / {locations.length}</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
