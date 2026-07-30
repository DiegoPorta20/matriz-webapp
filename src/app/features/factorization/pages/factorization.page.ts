import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import type { ApiError } from '../../../core/models/api-response.model';
import { MatrixEditorComponent } from '../components/matrix-editor/matrix-editor';
import { MatrixViewComponent } from '../components/matrix-view/matrix-view';
import { StatisticsCardComponent } from '../components/statistics-card/statistics-card';
import type { FactorizationResult } from '../models/factorization.model';
import { FactorizationApiService } from '../services/factorization-api.service';

@Component({
  selector: 'app-factorization-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatrixEditorComponent,
    MatrixViewComponent,
    StatisticsCardComponent,
  ],
  templateUrl: './factorization.page.html',
  styleUrl: './factorization.page.scss',
})
export class FactorizationPage {
  private readonly factorizationApi = inject(FactorizationApiService);

  readonly result = signal<FactorizationResult | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<ApiError | null>(null);

  factorize(matrix: number[][]): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.factorizationApi.factorize(matrix).subscribe({
      next: (result) => {
        this.result.set(result);
        this.isLoading.set(false);
      },
      error: (error: ApiError) => {
        this.result.set(null);
        this.error.set(error);
        this.isLoading.set(false);
      },
    });
  }
}
