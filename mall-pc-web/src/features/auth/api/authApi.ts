import { ApiError, authStorage, refreshAuth, request } from "@/api/client";
import type { AuthResponse, UpdateProfileRequest, UserResponse } from "@/api/client";

export const authApi = {
  login(payload: { username: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login/password", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async logout(): Promise<void> {
    const logoutWithToken = (refreshToken: string): Promise<void> => request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    }, false);
    const auth = authStorage.read();
    if (!auth?.refresh_token) {
      return;
    }

    try {
      await logoutWithToken(auth.refresh_token);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
      const refreshed = await refreshAuth();
      await logoutWithToken(refreshed.refresh_token);
    }
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
