import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MatrixNumberPipe } from '../../../../shared/pipes/matrix-number.pipe';
import type { MatrixStatistics } from '../../models/factorization.model';

@Component({
  selector: 'app-statistics-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [MatrixNumberPipe],
  templateUrl: './statistics-card.html',
})
export class StatisticsCardComponent {
  readonly title = input.required<string>();
  readonly statistics = input.required<MatrixStatistics>();
}
