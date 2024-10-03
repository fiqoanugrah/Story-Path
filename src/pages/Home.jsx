import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white py-4">
    <div className="container mx-auto px-4 text-center">
      <p>&copy; 2024 StoryPath. All rights reserved.</p>
    </div>
  </footer>
);

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-blue-100 text-blue-900 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Welcome to StoryPath</h1>
            <p className="text-xl mb-8">Create and explore immersive location-based experiences. </p>
            <Link 
              to="/projects" 
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              View Projects
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What You Can Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Create Projects" 
              description="Design virtual museum exhibits, location-based tours, and treasure hunts."
            />
            <FeatureCard 
              title="Add Locations" 
              description="Populate your projects with interesting locations and content."
            />
            <FeatureCard 
              title="Preview & Test" 
              description="Simulate your experiences before deploying them to the real world."
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;