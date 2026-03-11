import React from 'react';

interface SchemaValidationProps {
  errors: string[];
  isValid: boolean;
}

export const SchemaValidation: React.FC<SchemaValidationProps> = ({ errors, isValid }) => {
  if (isValid) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-2">✓ Schema Validation Passed</h3>
        <p className="text-green-700">Both datasets have consistent schemas and primary keys.</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-red-800 mb-4">✗ Schema Validation Failed</h3>
      <ul className="space-y-2">
        {errors.map((error, index) => (
          <li key={index} className="text-red-700 text-sm flex items-start">
            <span className="mr-2">•</span>
            <span>{error}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
