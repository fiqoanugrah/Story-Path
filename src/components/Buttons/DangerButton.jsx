import React from 'react';

const DangerButton = ({ children, onClick }) => {
  return (
    <button className="btn btn-error" onClick={onClick}>
      {children}
    </button>
  );
};

export default DangerButton;
