export interface ComparisonCell {
  prodValue: any;
  devValue: any;
  isMatch: boolean;
}

export interface ComparisonResult {
  rowKey: string;
  cells: Record<string, ComparisonCell>;
  allMatch: boolean;
}

export interface ComparisonSummary {
  totalRows: number;
  matchingRows: number;
  mismatchingRows: number;
  totalCells: number;
  matchingCells: number;
  mismatchingCells: number;
  matchPercentage: number;
  mismatches: ComparisonResult[];
}

export class PnLComparator {
  private normalizeValue(value: any): any {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const num = parseFloat(trimmed);
      if (!isNaN(num) && num.toString() === trimmed) {
        return num;
      }
      return trimmed.toLowerCase();
    }
    return value;
  }

  private valuesMatch(prod: any, dev: any): boolean {
    const normalizedProd = this.normalizeValue(prod);
    const normalizedDev = this.normalizeValue(dev);

    if (normalizedProd === null && normalizedDev === null) {
      return true;
    }

    if (typeof normalizedProd === 'number' && typeof normalizedDev === 'number') {
      return Math.abs(normalizedProd - normalizedDev) < 1e-6;
    }

    return normalizedProd === normalizedDev;
  }

  compare(
    prod: Record<string, any>[],
    dev: Record<string, any>[],
    primaryKeys: string[]
  ): ComparisonSummary {
    const results: ComparisonResult[] = [];
    let totalCells = 0;
    let matchingCells = 0;

    // Create lookup maps
    const devMap = new Map<string, Record<string, any>>();
    dev.forEach((row) => {
      const key = primaryKeys.map((k) => row[k]).join('|');
      devMap.set(key, row);
    });

    // Compare rows
    prod.forEach((prodRow) => {
      const rowKey = primaryKeys.map((k) => prodRow[k]).join('|');
      const devRow = devMap.get(rowKey);

      if (!devRow) {
        // Row exists in PROD but not in DEV
        const cells: Record<string, ComparisonCell> = {};
        Object.keys(prodRow).forEach((col) => {
          cells[col] = {
            prodValue: prodRow[col],
            devValue: '(Missing)',
            isMatch: false,
          };
          totalCells++;
        });

        results.push({
          rowKey,
          cells,
          allMatch: false,
        });
      } else {
        // Compare cells
        const cells: Record<string, ComparisonCell> = {};
        let rowMatches = true;

        const allColumns = new Set([...Object.keys(prodRow), ...Object.keys(devRow)]);
        allColumns.forEach((col) => {
          const prodValue = prodRow[col];
          const devValue = devRow[col];
          const isMatch = this.valuesMatch(prodValue, devValue);

          cells[col] = {
            prodValue,
            devValue,
            isMatch,
          };

          totalCells++;
          if (isMatch) {
            matchingCells++;
          } else {
            rowMatches = false;
          }
        });

        if (!rowMatches) {
          results.push({
            rowKey,
            cells,
            allMatch: false,
          });
        }
      }
    });

    // Check for rows in DEV but not in PROD
    dev.forEach((devRow) => {
      const rowKey = primaryKeys.map((k) => devRow[k]).join('|');
      if (!devMap.has(rowKey) || !prod.find((r) => primaryKeys.map((k) => r[k]).join('|') === rowKey)) {
        const cells: Record<string, ComparisonCell> = {};
        Object.keys(devRow).forEach((col) => {
          cells[col] = {
            prodValue: '(Missing)',
            devValue: devRow[col],
            isMatch: false,
          };
          totalCells++;
        });

        results.push({
          rowKey,
          cells,
          allMatch: false,
        });
      }
    });

    return {
      totalRows: Math.max(prod.length, dev.length),
      matchingRows: prod.length - results.length,
      mismatchingRows: results.length,
      totalCells,
      matchingCells,
      mismatchingCells: totalCells - matchingCells,
      matchPercentage: (matchingCells / totalCells) * 100,
      mismatches: results,
    };
  }
}
