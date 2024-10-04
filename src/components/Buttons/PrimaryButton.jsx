import React from 'react';

const PrimaryButton = ({ label, onClick, className }) => {
  return (
    <button 
      onClick={onClick} 
      className={`btn btn-primary ${className}`} 
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
