import { signUp, signIn, signOut, resetPassword, getSession } from '../auth.service';

/**
 * We mock supabase before importing the service.
 */
const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockResetPassword = jest.fn();
const mockGetSession = jest.fn();

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      resetPasswordForEmail: (...args: any[]) => mockResetPassword(...args),
      getSession: (...args: any[]) => mockGetSession(...args),
    },
  },
}));

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls supabase.auth.signUp with correct parameters', async () => {
    mockSignUp.mockResolvedValue({ data: 'signup-success' });

    const result = await signUp('test@example.com', 'password123');

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ data: 'signup-success' });
  });

  it('calls supabase.auth.signInWithPassword with correct parameters', async () => {
    mockSignIn.mockResolvedValue({ data: 'signin-success' });

    const result = await signIn('test@example.com', 'password123');

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ data: 'signin-success' });
  });

  it('calls supabase.auth.signOut', async () => {
    mockSignOut.mockResolvedValue({ success: true });

    const result = await signOut();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('calls supabase.auth.resetPasswordForEmail', async () => {
    mockResetPassword.mockResolvedValue({ sent: true });

    const result = await resetPassword('test@example.com');

    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual({ sent: true });
  });

  it('calls supabase.auth.getSession', async () => {
    mockGetSession.mockResolvedValue({ session: 'mock-session' });

    const result = await getSession();

    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ session: 'mock-session' });
  });
});
