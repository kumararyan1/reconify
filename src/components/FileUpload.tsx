import React, { useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File, type: 'prod' | 'dev') => void;
  selectedFiles: { prod: File | null; dev: File | null };
  loading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFiles, loading }) => {
  const prodInputRef = useRef<HTMLInputElement>(null);
  const devInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Datasets</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* PROD Upload */}
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
          <label className="block text-sm font-semibold mb-4 text-blue-900">
            Production Dataset (PROD)
          </label>
          <input
            ref={prodInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files && onFileSelect(e.target.files[0], 'prod')}
            disabled={loading}
            className="hidden"
          />
          <button
            onClick={() => prodInputRef.current?.click()}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition mb-3"
          >
            Choose PROD File
          </button>
          {selectedFiles.prod && (
            <p className="text-sm text-blue-700 font-medium">
              ✓ {selectedFiles.prod.name}
            </p>
          )}
        </div>

        {/* DEV Upload */}
        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50">
          <label className="block text-sm font-semibold mb-4 text-purple-900">
            Development Dataset (DEV)
          </label>
          <input
            ref={devInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files && onFileSelect(e.target.files[0], 'dev')}
            disabled={loading}
            className="hidden"
          />
          <button
            onClick={() => devInputRef.current?.click()}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition mb-3"
          >
            Choose DEV File
          </button>
          {selectedFiles.dev && (
            <p className="text-sm text-purple-700 font-medium">
              ✓ {selectedFiles.dev.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
