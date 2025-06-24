
import React from 'react';

// Developer access component is now disabled - redirects to normal login
const DeveloperAccess: React.FC = () => {
  // Redirect to login instead of showing developer access
  React.useEffect(() => {
    window.location.href = '/login';
  }, []);

  return null;
};

export default DeveloperAccess;
