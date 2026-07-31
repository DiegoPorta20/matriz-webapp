import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MatrixNumberPipe } from '../../../../shared/pipes/matrix-number.pipe';
import type { Matrix } from '../../models/factorization.model';

@Component({
  selector: 'app-matrix-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatrixNumberPipe],
  templateUrl: './matrix-view.html',
})
export class MatrixViewComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly matrix = input.required<Matrix>();

  readonly dimensions = computed(() => {
    const matrix = this.matrix();
    const columns = matrix.length > 0 ? matrix[0].length : 0;
    return `${String(matrix.length)} × ${String(columns)}`;
  });

  readonly tableDescription = computed(() => `${this.title()}, ${this.dimensions()}`);
}
