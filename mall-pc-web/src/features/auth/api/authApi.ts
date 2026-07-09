import { authStorage, request } from "@/api/client";
import type { AuthResponse, UpdateProfileRequest, UserResponse } from "@/api/client";

export const authApi = {
  login(payload: { username: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login/password", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  logout(refreshToken: string): Promise<void> {
    return request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  },
  me(): Promise<UserResponse> {
    return request<UserResponse>("/me");
  },
  register(payload: { username: string; password: string; nickname: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateProfile(payload: UpdateProfileRequest): Promise<UserResponse> {
    return request<UserResponse>("/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  storage: authStorage
};
