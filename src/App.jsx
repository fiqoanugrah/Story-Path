import React from 'react';
import 'leaflet/dist/leaflet.css'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Header from './components/Header';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import LocationList from './components/LocationList';
import LocationForm from './components/LocationForm';
import PreviewPage from "./components/PreviewPage";
import ScannerRedirect from "./components/ScannerRedirect";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-base-200">
          <Header />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/new" element={<ProjectForm />} />
              <Route path="/project/edit/:id" element={<ProjectForm />} />
              <Route path="/project/:projectId/locations" element={<LocationList />} />
              <Route path="/project/:projectId/location/new" element={<LocationForm />} />
              <Route path="/project/:projectId/location/edit/:id" element={<LocationForm />} />
              <Route path="/project/:projectId/preview" element={<PreviewPage />} />
              <Route path="/location/:locationId" element={<ScannerRedirect />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;