import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../AuthContext';

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
    },
    from: (...args: any[]) => mockFrom(...args),
  },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('initializes with session and fetches profile', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1', email_confirmed_at: 'yes' },
        },
      },
    });

    mockSingle.mockResolvedValue({
      data: { id: 'user-1', full_name: 'John Doe' },
      error: null,
    });

    let value: any;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            value = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    await waitFor(() => expect(value.loading).toBe(false));

    expect(value.user.id).toBe('user-1');
    expect(value.profile.full_name).toBe('John Doe');
  });

  it('handles profile fetch error branch', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1', email_confirmed_at: 'yes' },
        },
      },
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'error' },
    });

    let value: any;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            value = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    await waitFor(() => expect(value.loading).toBe(false));

    expect(value.profile).toBeNull();
  });

  it('updates state when auth state changes to logged in', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    let authCallback: any;

    mockOnAuthStateChange.mockImplementation((callback: any) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    mockSingle.mockResolvedValue({
      data: { id: 'user-2', full_name: 'Jane Doe' },
      error: null,
    });

    let value: any;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            value = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    await waitFor(() => expect(value.loading).toBe(false));

    await act(async () => {
      await authCallback('SIGNED_IN', {
        user: { id: 'user-2', email_confirmed_at: 'yes' },
      });
    });

    await waitFor(() => {
      expect(value.user?.id).toBe('user-2');
      expect(value.profile?.full_name).toBe('Jane Doe');
    });
  });

  it('clears profile when auth state changes to logged out', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    let authCallback: any;

    mockOnAuthStateChange.mockImplementation((callback: any) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    let value: any;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            value = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    await waitFor(() => expect(value.loading).toBe(false));

    await act(async () => {
      await authCallback('SIGNED_OUT', null);
    });

    await waitFor(() => expect(value.user).toBeNull());

    expect(value.profile).toBeNull();
  });

  it('unsubscribes on unmount', () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { unmount } = render(
      <AuthProvider>
        <></>
      </AuthProvider>,
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
