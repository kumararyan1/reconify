import React, { useState } from 'react';
import { ComparisonResult } from '../utils/pnlComparator';

interface MismatchTableProps {
  mismatches: ComparisonResult[];
}

export const MismatchTable: React.FC<MismatchTableProps> = ({ mismatches }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  if (mismatches.length === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
        <p className="text-green-800 font-semibold">✓ All rows match! Perfect reconciliation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-red-50 border-b-2 border-red-200">
        <h3 className="text-lg font-bold text-red-800">
          {mismatches.length} Row(s) with Mismatches
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Row Key</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mismatch Count</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {mismatches.map((result) => {
              const mismatchCount = Object.values(result.cells).filter((c) => !c.isMatch).length;
              const isExpanded = expandedRows.has(result.rowKey);

              return (
                <React.Fragment key={result.rowKey}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-mono break-all">
                      {result.rowKey}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-mismatch">{mismatchCount} cells</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(result.rowKey)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        {isExpanded ? '▼ Hide Details' : '▶ Show Details'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan={3} className="px-6 py-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-white border-b">
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Column</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">PROD Value</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">DEV Value</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(result.cells).map(([column, cell]) => (
                                <tr
                                  key={column}
                                  className={cell.isMatch ? 'bg-green-50' : 'bg-red-50'}
                                >
                                  <td className="px-4 py-2 font-semibold text-gray-800">{column}</td>
                                  <td className="px-4 py-2 text-gray-700 font-mono break-all">
                                    {cell.prodValue ?? '(null)'}
                                  </td>
                                  <td className="px-4 py-2 text-gray-700 font-mono break-all">
                                    {cell.devValue ?? '(null)'}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={`badge ${
                                        cell.isMatch ? 'badge-match' : 'badge-mismatch'
                                      }`}
                                    >
                                      {cell.isMatch ? '✓ Match' : '✗ Mismatch'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
