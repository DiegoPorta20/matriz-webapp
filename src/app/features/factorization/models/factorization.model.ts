export type Matrix = readonly (readonly number[])[];

export interface MatrixStatistics {
  readonly max: number;
  readonly min: number;
  readonly average: number;
  readonly sum: number;
  readonly isDiagonal: boolean;
}

export interface FactorizationStatistics {
  readonly q: MatrixStatistics;
  readonly r: MatrixStatistics;
}

export interface FactorizationResult {
  readonly original: Matrix;
  readonly q: Matrix;
  readonly r: Matrix;
  readonly statistics: FactorizationStatistics;
}
