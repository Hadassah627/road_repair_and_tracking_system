import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
      {severity || 'Not Assessed'}
    </span>
  );
};

export default SeverityBadge;
