import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProject, getLocations } from '../../utils/api';

const PreviewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [locations, setLocations] = useState([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(-1);
  const [points, setPoints] = useState(0);
  const [locationsVisited, setLocationsVisited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectData = await getProject(projectId);
        let locationsData = await getLocations(projectId);

        // Sort locations based on creation order (assuming 'id' reflects creation order)
        locationsData = locationsData.sort((a, b) => a.id - b.id);
        
        setProject(projectData);
        setLocations(locationsData);

        if (location.state?.isFromQRScan) {
          const scannedLocationData = location.state.initialLocation;
          const locationIndex = locationsData.findIndex(loc => loc.id === scannedLocationData.id);
          if (locationIndex !== -1) {
            handleLocationChange(locationIndex);
          }
        }
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, location.state]);

  const handleLocationChange = (index) => {
    if (index !== currentLocationIndex) {
      setCurrentLocationIndex(index);
      if (index !== -1 && !locationsVisited.includes(locations[index].id)) {
        updateScore(locations[index]);
        setLocationsVisited(prev => [...prev, locations[index].id]);
      }
    }
  };

  const updateScore = (location) => {
    setPoints(prevPoints => prevPoints + location.score_points);
  };

  const renderContent = () => {
    if (currentLocationIndex === -1) {
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{project.title}</h2>
          <p className="mb-2">{project.instructions}</p>
          <p className="mb-2"><strong>Initial Clue:</strong> {project.initial_clue}</p>
        </div>
      );
    } else {
      const location = locations[currentLocationIndex];
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{location.location_name}</h2>
          <div dangerouslySetInnerHTML={{ __html: location.location_content }} />
          {/* Display the actual clue for each location */}
          <p className="mt-2"><strong>Clue:</strong> {location.clue}</p>
        </div>
      );
    }
  };

  if (loading) return <div className="loading loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
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
