import React from 'react';
import { ComparisonSummary } from '../utils/pnlComparator';

interface ComparisonSummaryProps {
  summary: ComparisonSummary;
}

export const ComparisonSummaryComponent: React.FC<ComparisonSummaryProps> = ({ summary }) => {
  const getMatchStatusColor = (percentage: number): string => {
    if (percentage === 100) return 'bg-green-100 border-green-300';
    if (percentage >= 90) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getMatchStatusText = (percentage: number): string => {
    if (percentage === 100) return 'text-green-800';
    if (percentage >= 90) return 'text-yellow-800';
    return 'text-red-800';
  };

  return (
    <div className={`border-2 rounded-lg p-6 mb-6 ${getMatchStatusColor(summary.matchPercentage)}`}>
      <h3 className={`text-xl font-bold mb-4 ${getMatchStatusText(summary.matchPercentage)}`}>
        Comparison Summary
      </h3>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Total Rows</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalRows}</p>
        </div>

        <div className="bg-white rounded p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Matching Rows</p>
          <p className="text-2xl font-bold text-green-600">{summary.matchingRows}</p>
        </div>

        <div className="bg-white rounded p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Mismatching Rows</p>
          <p className="text-2xl font-bold text-red-600">{summary.mismatchingRows}</p>
        </div>

        <div className="bg-white rounded p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Match Rate</p>
          <p className={`text-2xl font-bold ${getMatchStatusText(summary.matchPercentage)}`}>
            {summary.matchPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded p-4 border border-gray-200">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Cell Match Rate</span>
          <span className="text-sm font-semibold text-gray-700">
            {summary.matchingCells} / {summary.totalCells}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              summary.matchPercentage === 100 ? 'bg-green-500' :
              summary.matchPercentage >= 90 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${summary.matchPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
