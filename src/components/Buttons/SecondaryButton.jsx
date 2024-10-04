import React from 'react';

const SecondaryButton = ({ label, onClick, className }) => {
  return (
    <button 
      onClick={onClick} 
      className={`btn btn-secondary ${className}`} 
    >
      {label}
    </button>
  );
};

export default SecondaryButton;
