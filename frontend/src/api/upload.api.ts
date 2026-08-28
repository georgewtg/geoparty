import type { ApiResponse } from '../types/api';
import { api } from './axios';

export const uploadFileLocal = async (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<string>>('/upload/local', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};