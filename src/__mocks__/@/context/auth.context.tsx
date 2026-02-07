// Mock the entire auth context module
export const AuthContext = {
  Provider: ({ children }: { children: React.ReactNode }) => children,
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  password?: string;
  role_id?: number;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type AuthContextValue = {
  login: (email: string, password: string) => Promise<{ ok: boolean; token?: string; msg?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ ok: boolean; token?: string; msg?: string }>;
  logout: () => void;
  loading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  mustChangePassword: boolean;
  changePassword: (password: string) => Promise<{ ok: boolean; msg?: string }>;
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => children;

export default AuthProvider;
