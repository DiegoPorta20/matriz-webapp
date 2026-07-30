import { Pipe } from '@angular/core';
import type { PipeTransform } from '@angular/core';

const DECIMALS = 4;

const DISPLAY_ZERO_THRESHOLD = 0.5 * 10 ** -DECIMALS;

@Pipe({ name: 'matrixNumber' })
export class MatrixNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (!Number.isFinite(value)) {
      return '—';
    }

    if (Math.abs(value) < DISPLAY_ZERO_THRESHOLD) {
      return '0';
    }

    return trimTrailingZeros(value.toFixed(DECIMALS));
  }
}

const trimTrailingZeros = (formatted: string): string =>
  formatted.includes('.') ? formatted.replace(/\.?0+$/, '') : formatted;
