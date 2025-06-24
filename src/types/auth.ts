export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  reportsGenerated: number;
  hasSubscription: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ARVReport {
  id: string;
  address: string;
  estimatedValue: number;
  createdAt: Date;
  userId: string;
}
