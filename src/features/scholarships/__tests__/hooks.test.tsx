import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useScholarships } from '../hooks';
import { supabase } from '../../../integration/supabase';

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function TestComponent({
  userId,
  activeTab,
}: {
  userId?: string;
  activeTab: 'all' | 'recommended';
}) {
  useScholarships(userId, activeTab);
  return null;
}

describe('useScholarships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns early when userId is undefined', async () => {
    render(<TestComponent activeTab="all" />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('fetches all scholarships when activeTab is all (data truthy)', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [] });
    const gteMock = jest.fn().mockReturnValue({ order: orderMock });
    const eqMock = jest.fn().mockReturnValue({ gte: gteMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    } as any);

    render(<TestComponent userId="1" activeTab="all" />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('scholarships');
    });

    expect(selectMock).toHaveBeenCalledWith('*');
    expect(eqMock).toHaveBeenCalledWith('is_active', true);
    expect(gteMock).toHaveBeenCalled();
    expect(orderMock).toHaveBeenCalledWith('deadline', {
      ascending: true,
    });
  });

  it('falls back to empty array when all scholarships returns null', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: null });
    const gteMock = jest.fn().mockReturnValue({ order: orderMock });
    const eqMock = jest.fn().mockReturnValue({ gte: gteMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    } as any);

    render(<TestComponent userId="1" activeTab="all" />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });

  it('fetches recommended scholarships when activeTab is recommended (data truthy)', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [] } as any);

    render(<TestComponent userId="1" activeTab="recommended" />);

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_recommended_scholarships', {
        p_user_id: '1',
      });
    });
  });

  it('falls back to empty array when recommended returns null', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null } as any);

    render(<TestComponent userId="1" activeTab="recommended" />);

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalled();
    });
  });

  it('switches from all to recommended and triggers both branches', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [] });
    const gteMock = jest.fn().mockReturnValue({ order: orderMock });
    const eqMock = jest.fn().mockReturnValue({ gte: gteMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    } as any);

    mockSupabase.rpc.mockResolvedValue({ data: [] } as any);

    const { rerender } = render(<TestComponent userId="1" activeTab="all" />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    rerender(<TestComponent userId="1" activeTab="recommended" />);

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalled();
    });
  });
});
