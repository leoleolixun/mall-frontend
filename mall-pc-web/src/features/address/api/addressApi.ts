import { request } from "@/api/client";
import type { AddressRequest, AddressResponse } from "@/api/client";

export const addressApi = {
  create(payload: AddressRequest): Promise<AddressResponse> {
    return request<AddressResponse>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  delete(id: number): Promise<void> {
    return request<void>(`/addresses/${id}`, {
      method: "DELETE"
    });
  },
  list(): Promise<AddressResponse[]> {
    return request<AddressResponse[]>("/addresses");
  },
  setDefault(id: number): Promise<void> {
    return request<void>(`/addresses/${id}/default`, {
      method: "PUT"
    });
  },
  update(id: number, payload: AddressRequest): Promise<AddressResponse> {
    return request<AddressResponse>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }
};
