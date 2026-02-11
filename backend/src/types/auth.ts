export interface JWTPayload {
  id: string;
  email: string;
  role: 'investor' | 'entrepreneur' | 'admin';
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  role: 'investor' | 'entrepreneur';
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    kycStatus: string;
  };
  error?: string;
}
