import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MATRIX_MAX_DIMENSION } from '../../../../core/config/api.config';
import { finiteNumberValidator } from '../../../../shared/validators/matrix.validators';

type CellControl = FormControl<number | null>;
type RowControl = FormArray<CellControl>;

const INITIAL_MATRIX = [
  [1, 2],
  [3, 4],
];

@Component({
  selector: 'app-matrix-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './matrix-editor.html',
  styleUrl: './matrix-editor.scss',
})
export class MatrixEditorComponent {
  readonly isBusy = input(false);
  readonly factorize = output<number[][]>();

  readonly form = new FormGroup({ grid: new FormArray<RowControl>([]) });

  private readonly rowCount = signal(INITIAL_MATRIX.length);
  private readonly columnCount = signal(INITIAL_MATRIX[0].length);

  readonly rows = this.rowCount.asReadonly();
  readonly columns = this.columnCount.asReadonly();

  readonly canAddRow = computed(() => this.rowCount() < MATRIX_MAX_DIMENSION);
  readonly canRemoveRow = computed(() => this.rowCount() > this.columnCount());

  readonly canAddColumn = computed(
    () => this.columnCount() < this.rowCount() && this.columnCount() < MATRIX_MAX_DIMENSION,
  );
  readonly canRemoveColumn = computed(() => this.columnCount() > 1);

  readonly maxDimension = MATRIX_MAX_DIMENSION;

  constructor() {
    INITIAL_MATRIX.forEach((row) => {
      this.grid.push(this.buildRow(row));
    });
  }

  get grid(): FormArray<RowControl> {
    return this.form.controls.grid;
  }

  addRow(): void {
    if (!this.canAddRow()) {
      return;
    }
    this.grid.push(this.buildRow(new Array<number>(this.columnCount()).fill(0)));
    this.rowCount.update((count) => count + 1);
  }

  removeRow(): void {
    if (!this.canRemoveRow()) {
      return;
    }
    this.grid.removeAt(this.grid.length - 1);
    this.rowCount.update((count) => count - 1);
  }

  addColumn(): void {
    if (!this.canAddColumn()) {
      return;
    }
    this.grid.controls.forEach((row) => {
      row.push(this.buildCell(0));
    });
    this.columnCount.update((count) => count + 1);
  }

  removeColumn(): void {
    if (!this.canRemoveColumn()) {
      return;
    }
    this.grid.controls.forEach((row) => {
      row.removeAt(row.length - 1);
    });
    this.columnCount.update((count) => count - 1);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.factorize.emit(this.toMatrix());
  }

  private toMatrix(): number[][] {
    return this.grid.controls.map((row) => row.controls.map((cell) => cell.value ?? 0));
  }

  private buildRow(values: readonly number[]): RowControl {
    return new FormArray(values.map((value) => this.buildCell(value)));
  }

  private buildCell(value: number): CellControl {
    return new FormControl<number | null>(value, { validators: finiteNumberValidator });
  }
}
