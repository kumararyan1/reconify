import { useState, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { ComparisonSummaryComponent } from './components/ComparisonSummary';
import { MismatchTable } from './components/MismatchTable';
import { SchemaValidation } from './components/SchemaValidation';
import { parseFile } from './utils/fileParser';
import { SchemaValidator, ValidationResult } from './utils/schemaValidator';
import { PnLComparator, ComparisonSummary } from './utils/pnlComparator';
import './index.css';

interface AppState {
  prodData: any | null;
  devData: any | null;
  prodSchema: ValidationResult | null;
  devSchema: ValidationResult | null;
  schemaValidation: any;
  comparisonResult: ComparisonSummary | null;
  error: string | null;
  loading: boolean;
  selectedFiles: { prod: File | null; dev: File | null };
  primaryKey: string;
}

const DEFAULT_PRIMARY_KEY = 'id,trade_id';

export function App() {
  const [state, setState] = useState<AppState>({
    prodData: null,
    devData: null,
    prodSchema: null,
    devSchema: null,
    schemaValidation: null,
    comparisonResult: null,
    error: null,
    loading: false,
    selectedFiles: { prod: null, dev: null },
    primaryKey: DEFAULT_PRIMARY_KEY,
  });

  const primaryKeyInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File, type: 'prod' | 'dev') => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      const parsed = await parseFile(file);
      const schema = SchemaValidator.validate(parsed.rows);

      setState((prev) => ({
        ...prev,
        selectedFiles: { ...prev.selectedFiles, [type]: file },
        [type === 'prod' ? 'prodData' : 'devData']: parsed.rows,
        [type === 'prod' ? 'prodSchema' : 'devSchema']: schema,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: `Failed to parse ${type.toUpperCase()} file: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }));
    }
  };

  const handleCompare = async () => {
    try {
      setState((prev) => ({ ...prev, error: null, loading: true }));

      if (!state.prodData || !state.devData) {
        throw new Error('Both PROD and DEV files must be uploaded');
      }

      if (!state.prodSchema || !state.devSchema) {
        throw new Error('Schema validation not completed');
      }

      const primaryKeys = state.primaryKey
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);

      if (primaryKeys.length === 0) {
        throw new Error('At least one primary key must be specified');
      }

      // Validate schema consistency
      const schemaValidation = SchemaValidator.validateSchemaConsistency(
        state.prodSchema,
        state.devSchema,
        primaryKeys
      );

      setState((prev) => ({ ...prev, schemaValidation }));

      if (!schemaValidation.isValid) {
        throw new Error(
          `Schema validation failed:\n${schemaValidation.errors.join('\n')}`
        );
      }

      // Perform comparison
      const comparator = new PnLComparator();
      const result = comparator.compare(state.prodData, state.devData, primaryKeys);

      setState((prev) => ({
        ...prev,
        comparisonResult: result,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An unknown error occurred',
        loading: false,
      }));
    }
  };

  const handleReset = () => {
    setState({
      prodData: null,
      devData: null,
      prodSchema: null,
      devSchema: null,
      schemaValidation: null,
      comparisonResult: null,
      error: null,
      loading: false,
      selectedFiles: { prod: null, dev: null },
      primaryKey: DEFAULT_PRIMARY_KEY,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            PnL Reconciliation Tool
          </h1>
          <p className="text-gray-400">
            Compare PROD and DEV financial datasets with confidence
          </p>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-900 border-2 border-red-600 rounded-lg p-6 mb-6 text-white">
            <h3 className="font-bold mb-2">Error</h3>
            <p className="whitespace-pre-wrap text-sm">{state.error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          {/* File Upload Section */}
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFiles={state.selectedFiles}
            loading={state.loading}
          />

          {/* Primary Key Configuration */}
          {state.selectedFiles.prod || state.selectedFiles.dev ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-800">
                Primary Key(s) (comma-separated)
              </label>
              <input
                ref={primaryKeyInputRef}
                type="text"
                value={state.primaryKey}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, primaryKey: e.target.value }))
                }
                placeholder="e.g., id,trade_id"
                disabled={state.loading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
              />
              <p className="text-xs text-gray-600 mt-2">
                Specify the column(s) that uniquely identify each row
              </p>
            </div>
          ) : null}

          {/* Compare Button */}
          {state.selectedFiles.prod && state.selectedFiles.dev ? (
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleCompare}
                disabled={state.loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition disabled:cursor-not-allowed"
              >
                {state.loading ? 'Comparing...' : 'Compare Datasets'}
              </button>
              <button
                onClick={handleReset}
                disabled={state.loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          ) : null}

          {/* Schema Validation */}
          {state.schemaValidation && (
            <SchemaValidation
              isValid={state.schemaValidation.isValid}
              errors={state.schemaValidation.errors}
            />
          )}

          {/* Comparison Results */}
          {state.comparisonResult && (
            <>
              <ComparisonSummaryComponent summary={state.comparisonResult} />
              <MismatchTable mismatches={state.comparisonResult.mismatches} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>PnL Reconciliation Tool • Built for developer productivity testing</p>
        </div>
      </div>
    </div>
  );
}
