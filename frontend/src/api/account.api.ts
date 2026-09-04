import type { AccountData, AuthContextData, LoginAccountPayload, RegisterAccountPayload } from '../types/account';
import type { ApiResponse } from '../types/api';
import { api } from './axios';

export const fetchAuth = async (): Promise<ApiResponse<AuthContextData>> => {
  const response = await api.get<ApiResponse<AuthContextData>>('/account/me', {
    withCredentials: true
  });
  return response.data;
};

export const registerAccount = async (formData: RegisterAccountPayload): Promise<ApiResponse<AccountData>> => {
  const response = await api.post<ApiResponse<AccountData>>('/account/register', formData);
  return response.data;
};

export const loginAccount = async (formData: LoginAccountPayload): Promise<ApiResponse<AccountData>> => {
  const response = await api.post<ApiResponse<AccountData>>('/account/login', formData);
  return response.data;
};

export const logoutAccount = async (): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>('/account/logout');
  return response.data;
};