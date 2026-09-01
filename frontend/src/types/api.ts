export type ApiResponse<T> = {
  success: boolean;
  payload: T;
  message?: string;
};