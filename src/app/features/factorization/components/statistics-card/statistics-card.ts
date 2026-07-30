import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MatrixNumberPipe } from '../../../../shared/pipes/matrix-number.pipe';
import type { MatrixStatistics } from '../../models/factorization.model';

@Component({
  selector: 'app-statistics-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatrixNumberPipe],
  templateUrl: './statistics-card.html',
  styleUrl: './statistics-card.scss',
})
export class StatisticsCardComponent {
  readonly title = input.required<string>();
  readonly statistics = input.required<MatrixStatistics>();
}
