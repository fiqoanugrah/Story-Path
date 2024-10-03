import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProject, updateProject, getProject, USERNAME } from '../utils/api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_published: false,
    participant_scoring: 'Not Scored',
    instructions: '',
    initial_clue: '',
    homescreen_display: 'Display initial clue'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId) => {
    try {
      setLoading(true);
      const project = await getProject(projectId);
      setFormData(project);
    } catch (err) {
      setError(`Failed to fetch project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        await updateProject(id, formData);
      } else {
        await createProject(formData);
      }
      navigate('/projects');
    } catch (err) {
      setError(`Failed to save project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{id ? 'Edit Project' : 'Create New Project'}</h1>
      {error && <div className="alert alert-error shadow-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="form-control w-full max-w-lg">
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

        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
        />

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

        <label className="label">
          <span className="label-text">Instructions</span>
        </label>
        <textarea
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
        />

        <label className="label">
          <span className="label-text">Initial Clue</span>
        </label>
        <textarea
          name="initial_clue"
          value={formData.initial_clue}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
        />

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

        <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
          {id ? 'Update Project' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;