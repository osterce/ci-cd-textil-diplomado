import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import LoginPage from './login.page';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconMail: () => <div data-testid="icon-mail" />,
  IconLock: () => <div data-testid="icon-lock" />,
}));

// Mock auth context
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();
const mockChangePassword = jest.fn();

jest.mock('@/hooks/use-auth-context', () => ({
  useAuthContext: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    changePassword: mockChangePassword,
    loading: false,
    token: null,
    isAuthenticated: false,
    profile: null,
    mustChangePassword: false,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ ok: true, token: 'fake-token' });
  });

  describe('Rendering Tests', () => {
    it('should render the welcome title', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByText('Bienvenidossss')).toBeInTheDocument();
    });

    it('should render the description text', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByText('Ingresa tus credenciales para acceder al sistema')).toBeInTheDocument();
    });

    it('should render email field with label and icon', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByTestId('icon-mail')).toBeInTheDocument();
    });

    it('should render password field with label and icon', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByTestId('icon-lock')).toBeInTheDocument();
    });

    it('should render the login button', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should render email input with correct placeholder', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const emailInput = screen.getByPlaceholderText('tu@correo.com');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render password input with correct placeholder', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Validation Tests', () => {
    it('should show error for password less than 6 characters', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('tu@correo.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '12345');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should not submit form with empty fields', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });
  });

  describe('Interaction Tests', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('tu@correo.com') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('should call login function with correct credentials on submit', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('tu@correo.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show error toast on failed login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ ok: false, msg: 'Invalid credentials' });
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('tu@correo.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('El usuario o la contraseña es incorrecta');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle successful login flow', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('tu@correo.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
        expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'admin123');
      });
    });

    it('should not call login if form validation fails', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('tu@correo.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });
  });
});
