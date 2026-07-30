export interface ApiSuccessResponse<TData> {
  readonly success: true;
  readonly data: TData;
  readonly message: string;
  readonly timestamp: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly errors: string[];
  readonly timestamp: string;
}

export interface ApiError {
  readonly status: number;
  readonly message: string;
  readonly details: string[];
}
