"use server";
import { BASE_URL } from "@/services/api";
import axios, { AxiosError } from "axios";
import { signOut } from "next-auth/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getHeaders = () => {
  const token_refresh = cookies().get("token_refresh");
  const token_access = cookies().get("token_access");

  // Construct the Cookie header with only token_refresh and token_access
  const cookieHeader = [
    token_access ? `token_access=${token_access.value}` : null,
    token_refresh ? `token_refresh=${token_refresh.value}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  return {
    Cookie: cookieHeader,
    token_refresh: token_refresh ? token_refresh.value : null,
    token_access: token_access ? token_access.value : null,
  };
};

export default async function customBaseFetch({
  url,
  method,
  data,
  params,
  headers,
}: {
  url: string;
  method?: string;
  data?: any;
  params?: any;
  headers?: any;
}) {
  try {
    const result = await axios.request({
      url,
      method,
      data,
      params,
      headers: {
        ...headers,
        ...getHeaders(),
        "x-api-key": process.env.X_API_KEY,
      },
    });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;

    if (err.response?.status === 401) {
      // Handle 401 error
      // Redirect to login page

      const data: { token: Authentication[] } =
        (await handlerRefreshToken()) as { token: Authentication[] };

      // redirect('/auth')
      if (data.token && data.token.length > 0) {
        return {
          data,
        };
      } else {
        return {
          error: {
            status: 401,
            message: "Unauthorized",
          },
        };
      }
    }

    return {
      error: {
        status: err.response?.status,
        // data: (err.response?.data as any)?.message || err.message,
        message: (err.response?.data as any)?.message || err.message,
      },
    };
  }
}

export interface Authentication {
  name: string;
  value: string;
}
const handlerRefreshToken = async () => {
  try {
    // Refresh token logic
    const token: Authentication[] = [];
    const response = await axios.request({
      url: `${BASE_URL}auth/refresh`,
      method: "POST",
      headers: { ...getHeaders() },
      withCredentials: true,
    });

    if (response.headers["set-cookie"]) {
      const dataCookies = response.headers["set-cookie"];

      dataCookies.forEach((cookie) => {
        const [nameValue, ...rest] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        token.push({ name: name.trim(), value: value.trim() });
      });
    }

    return {
      token: token,
    };
  } catch (error) {
    return error;
  }
};
