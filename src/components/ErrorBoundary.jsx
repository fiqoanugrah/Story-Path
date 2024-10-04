import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null }; // Track error state and error object
  }

  // Update state when an error is encountered in any child component
  static getDerivedStateFromError(error) {
    return { hasError: true, error }; // Set error state
  }

  // Log the error details for debugging
  componentDidCatch(error, errorInfo) {
    console.log('Error caught by ErrorBoundary:', error, errorInfo); // Log error information
  }

  render() {
    if (this.state.hasError) {
      // Display a user-friendly error message when an error is caught
      return <h1>Something went wrong. Error: {this.state.error.toString()}</h1>;
    }

    // Render child components if no error is caught
    return this.props.children; 
  }
}

export default ErrorBoundary;
