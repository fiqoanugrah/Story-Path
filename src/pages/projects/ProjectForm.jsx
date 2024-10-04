import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProject, updateProject, getProject, USERNAME } from '../../utils/api';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

/**
 * ProjectForm component
 * Renders a form to create or edit a project based on the presence of an ID in the URL params.
 */
const ProjectForm = () => {
  const { id } = useParams(); // Extract project ID from route parameters
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_published: false,
    participant_scoring: 'Not Scored',
    instructions: '',
    initial_clue: '',
    homescreen_display: 'Display initial clue',
  });
  const [loading, setLoading] = useState(false); // State to track loading
  const [error, setError] = useState(null); // State to track errors

  // Fetch the project data if an ID is provided (edit mode)
  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  /**
   * Fetch project data from the server
   * @param {string} projectId - The ID of the project to fetch
   */
  const fetchProject = async (projectId) => {
    try {
      setLoading(true);
      const project = await getProject(projectId);
      setFormData(project); // Populate form with the fetched project data
    } catch (err) {
      setError(`Failed to fetch project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  /**
   * Handle changes to form inputs
   * Updates the form data state when an input is changed
   * @param {Object} e - The event object from the input field
   */
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value }); // Dynamically update form data
  };

  /**
   * Handle form submission
   * Sends the form data to the server for either creating or updating a project
   * @param {Object} e - The event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setError(null);
    try {
      if (id) {
        // If there's an ID, update the existing project
        await updateProject(id, formData);
      } else {
        // Otherwise, create a new project
        await createProject(formData);
      }
      navigate('/projects'); // Navigate back to the projects list after submission
    } catch (err) {
      setError(`Failed to save project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show a loading spinner if the form is submitting or loading project data
  if (loading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  
  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/projects')}
          className="text-blue-700 font-semibold mb-6 flex items-center"
        >
          <span className="mr-2">&larr;</span> Back to Projects
        </button>
        
        <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Project' : 'Create New Project'}</h1>
        {error && <div className="alert alert-error mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered h-24 w-full"
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Published</span>
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="toggle"
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Participant Scoring</span>
            </label>
            <select
              name="participant_scoring"
              value={formData.participant_scoring}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="Not Scored">Not Scored</option>
              <option value="Number of Scanned QR Codes">Number of Scanned QR Codes</option>
              <option value="Number of Locations Entered">Number of Locations Entered</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Instructions</span>
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="textarea textarea-bordered h-24 w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Initial Clue</span>
            </label>
            <textarea
              name="initial_clue"
              value={formData.initial_clue}
              onChange={handleChange}
              className="textarea textarea-bordered h-24 w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Homescreen Display</span>
            </label>
            <select
              name="homescreen_display"
              value={formData.homescreen_display}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="Display initial clue">Display initial clue</option>
              <option value="Display all locations">Display all locations</option>
            </select>
          </div>

          <PrimaryButton 
            label={id ? 'Update Project' : 'Create Project'} 
            className="w-full" 
          />
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
