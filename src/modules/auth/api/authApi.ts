import { z } from "zod";
import { baseApi } from "@/core/api/apiBaseQuery";
import { ApiResponse } from "@/core/api/api.types";

// ============================================================================
// Zod Request Validation Schemas
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export type SignUpDTO = z.infer<typeof SignUpSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;

export interface AuthResponseData {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// ============================================================================
// Production Auth API Integration Slices
// ============================================================================

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponseData>, LoginDTO>({
      query: (credentials) => {
        // Validate at client boundary before network request
        LoginSchema.parse(credentials);

        return {
          url: "/auth/login",
          method: "POST",
          body: credentials,
        };
      },
      invalidatesTags: ["auth"],
    }),

    signUp: builder.mutation<ApiResponse<AuthResponseData>, SignUpDTO>({
      query: (data) => {
        SignUpSchema.parse(data);

        return {
          url: "/users/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["user"],
    }),

    verifyOTP: builder.mutation<ApiResponse<{ message: string }>, VerifyOtpDTO>({
      query: (otpPayload) => {
        VerifyOtpSchema.parse(otpPayload);

        return {
          url: "/users/verify-otp",
          method: "POST",
          body: otpPayload,
        };
      },
    }),

    resendOTP: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
      query: (payload) => ({
        url: "/users/resend-otp",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignUpMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} = authApi;
