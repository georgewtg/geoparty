import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';


interface RedirectProps {
  firstTimePath: string;
  fallbackPath: string;
}


export const FirstVisitRedirect: React.FC<RedirectProps> = ({ 
  firstTimePath, 
  fallbackPath 
}) => {
  const [hasVisited] = useState(() => {
    return Boolean(sessionStorage.getItem('hasVisitedBefore'));
  });

  useEffect(() => {
    if (!hasVisited) {
      sessionStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [hasVisited]);

  return <Navigate to={hasVisited ? fallbackPath : firstTimePath} replace />;
};