/**
 * Production-Ready API Contract & Types
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errorMessages?: Array<{ path: string; message: string }>;
  success: false;
}

export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 422 | 500;
