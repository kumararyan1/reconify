export interface SchemaInfo {
  columnName: string;
  dataType: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  schema: SchemaInfo[];
}

export class SchemaValidator {
  static getDataType(value: any): string {
    if (value === null || value === undefined || value === '') return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (!isNaN(Number(value))) return 'number';
    if (value instanceof Date || !isNaN(Date.parse(value))) return 'date';
    return 'string';
  }

  static inferSchema(rows: Record<string, any>[]): SchemaInfo[] {
    if (rows.length === 0) return [];

    const typeMap = new Map<string, Map<string, number>>();

    // Count type occurrences for each column
    rows.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        const type = this.getDataType(value);
        if (!typeMap.has(key)) {
          typeMap.set(key, new Map());
        }
        const counts = typeMap.get(key)!;
        counts.set(type, (counts.get(type) || 0) + 1);
      });
    });

    // Determine the most common type for each column
    const schema: SchemaInfo[] = [];
    typeMap.forEach((counts, columnName) => {
      const mostCommonType = Array.from(counts.entries()).reduce((prev, current) =>
        prev[1] > current[1] ? prev : current
      )[0];

      schema.push({ columnName, dataType: mostCommonType });
    });

    return schema;
  }

  static validateSchemaConsistency(
    prod: ValidationResult,
    dev: ValidationResult,
    primaryKeys: string[]
  ): ValidationResult {
    const errors: string[] = [];

    // Check if columns match
    const prodColumns = new Set(prod.schema.map((s) => s.columnName));
    const devColumns = new Set(dev.schema.map((s) => s.columnName));

    const missingInDev = [...prodColumns].filter((col) => !devColumns.has(col));
    const missingInProd = [...devColumns].filter((col) => !prodColumns.has(col));

    if (missingInDev.length > 0) {
      errors.push(`Columns missing in DEV: ${missingInDev.join(', ')}`);
    }
    if (missingInProd.length > 0) {
      errors.push(`Columns missing in PROD: ${missingInProd.join(', ')}`);
    }

    // Check if data types match for common columns
    const prodSchemaMap = new Map(prod.schema.map((s) => [s.columnName, s.dataType]));
    const devSchemaMap = new Map(dev.schema.map((s) => [s.columnName, s.dataType]));

    [...prodColumns].forEach((col) => {
      if (devColumns.has(col)) {
        const prodType = prodSchemaMap.get(col);
        const devType = devSchemaMap.get(col);
        if (prodType !== devType) {
          errors.push(`Data type mismatch for column '${col}': PROD is ${prodType}, DEV is ${devType}`);
        }
      }
    });

    // Validate primary keys exist
    const allColumns = new Set([...prodColumns, ...devColumns]);
    primaryKeys.forEach((key) => {
      if (!allColumns.has(key)) {
        errors.push(`Primary key '${key}' not found in either dataset`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      schema: prod.schema,
    };
  }

  static validate(data: Record<string, any>[]): ValidationResult {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push('Dataset is empty');
    }

    const schema = this.inferSchema(data);

    return {
      isValid: errors.length === 0,
      errors,
      schema,
    };
  }
}
