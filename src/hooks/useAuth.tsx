import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  incrementReports: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('arvUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setState({ user, loading: false, error: null });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('arvUser');
        setState({ user: null, loading: false, error: null });
      }
    } else {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check stored users (in real app, this would be API call)
      const storedUsers = JSON.parse(localStorage.getItem('arvUsers') || '[]');
      const user = storedUsers.find((u: User) => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      localStorage.setItem('arvUser', JSON.stringify(userWithoutPassword));
      setState({ user: userWithoutPassword, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem('arvUsers') || '[]');
      const existingUser = storedUsers.find((u: User) => u.email === data.email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser: User & { password: string } = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        reportsGenerated: 0,
        hasSubscription: false,
        createdAt: new Date(),
        password: data.password,
      };
      
      // Store user (in real app, this would be API call)
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('arvUsers', JSON.stringify(updatedUsers));
      
      // Remove password from user object for state
      const { password, ...userWithoutPassword } = newUser;
      
      localStorage.setItem('arvUser', JSON.stringify(userWithoutPassword));
      setState({ user: userWithoutPassword, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('arvUser');
    setState({ user: null, loading: false, error: null });
  };

  const incrementReports = () => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = {
        ...prev.user,
        reportsGenerated: prev.user.reportsGenerated + 1
      };
      
      // Update stored user
      localStorage.setItem('arvUser', JSON.stringify(updatedUser));
      
      // Update users array
      const storedUsers = JSON.parse(localStorage.getItem('arvUsers') || '[]');
      const updatedUsers = storedUsers.map((u: User) => 
        u.id === updatedUser.id ? { ...u, reportsGenerated: updatedUser.reportsGenerated } : u
      );
      localStorage.setItem('arvUsers', JSON.stringify(updatedUsers));
      
      return { ...prev, user: updatedUser };
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    incrementReports,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};