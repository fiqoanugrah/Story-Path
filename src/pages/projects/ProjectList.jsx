import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject } from '../../utils/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(`Failed to fetch projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (err) {
        setError(`Failed to delete project: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Link to="/project/new" className="btn btn-primary">Add Project</Link>
        </div>
        <div className="space-y-4"> {/* Add space between project cards */}
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-4 shadow-md rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2"> {/* Adjusted alignment with space */}
                  <h2 className="text-xl font-bold">{project.title}</h2> {/* Bold title */}
                  <span className={`badge ${project.is_published ? 'badge-success' : 'badge-warning'}`}>
                    {project.is_published ? 'Published' : 'Unpublished'}
                  </span>
                </div>
              </div>
              <p>{project.description}</p>
              <div className="flex justify-end space-x-2"> {/* Buttons aligned to the right */}
                <Link to={`/project/edit/${project.id}`} className="btn btn-sm btn-outline btn-info">
                  Edit
                </Link>
                <Link to={`/project/${project.id}/locations`} className="btn btn-sm btn-outline btn-success">
                  View Locations
                </Link>
                <button onClick={() => handleDelete(project.id)} className="btn btn-sm btn-outline btn-error">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
