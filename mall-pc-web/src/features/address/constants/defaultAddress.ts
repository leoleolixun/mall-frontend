import type { AddressRequest } from "@/api/client";

export const defaultAddressPayload: AddressRequest = {
  receiver_name: "李先生",
  receiver_phone: "13888888888",
  province: "上海市",
  city: "上海市",
  district: "浦东新区",
  detail: "XX 路 88 号",
  is_default: true
};

