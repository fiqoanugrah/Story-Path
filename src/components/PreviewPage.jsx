import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getLocations } from '../utils/api';

const PreviewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
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
        const locationsData = await getLocations(projectId);
        setProject(projectData);
        setLocations(locationsData);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleLocationChange = (index) => {
    if (index !== currentLocationIndex) {
      setCurrentLocationIndex(index);
      if (index !== -1 && !locationsVisited.includes(locations[index].id)) {
        updateScore(locations[index], 'visit');
        setLocationsVisited(prev => [...prev, locations[index].id]);
      }
    }
  };

  const updateScore = (location, action) => {
    if (project.participant_scoring === 'Number of Locations Entered' && action === 'visit') {
      setPoints(prevPoints => prevPoints + 1);
    } else if (project.participant_scoring === 'Number of Scanned QR Codes' && action === 'scan') {
      setPoints(prevPoints => prevPoints + 1);
    } else if (project.participant_scoring === 'Not Scored') {
      // Do not update points for 'Not Scored' option
    } else {
      setPoints(prevPoints => prevPoints + location.score_points);
    }
  };

  const simulateQRScan = () => {
    if (currentLocationIndex !== -1) {
      const location = locations[currentLocationIndex];
      if (location.location_trigger === 'QR Code' || location.location_trigger === 'Both') {
        updateScore(location, 'scan');
      }
    }
  };

  const renderContent = () => {
    if (currentLocationIndex === -1) {
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{project.title}</h2>
          <p className="mb-2">{project.instructions}</p>
          {project.homescreen_display === 'Display initial clue' ? (
            <p className="mb-2"><strong>Initial Clue:</strong> {project.initial_clue}</p>
          ) : (
            <div>
              <h3 className="font-bold mb-2">All Locations:</h3>
              <ul className="list-disc list-inside">
                {locations.map((loc, index) => (
                  <li key={loc.id} className="cursor-pointer hover:text-blue-500" onClick={() => handleLocationChange(index)}>
                    {loc.location_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } else {
      const location = locations[currentLocationIndex];
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{location.location_name}</h2>
          <div dangerouslySetInnerHTML={{ __html: location.location_content }} />
          {location.clue && (
            <p className="mt-2"><strong>Clue:</strong> {location.clue}</p>
          )}
          {(location.location_trigger === 'QR Code' || location.location_trigger === 'Both') && (
            <button 
              className="btn btn-primary mt-2" 
              onClick={simulateQRScan}
            >
              Simulate QR Code Scan
            </button>
          )}
        </div>
      );
    }
  };

  if (loading) return <div className="loading loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project?.title} - Preview</h1>
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
          <div className="card bg-base-100 shadow-xl" style={{height: '600px', maxWidth: '375px', margin: '0 auto', overflowY: 'auto'}}>
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