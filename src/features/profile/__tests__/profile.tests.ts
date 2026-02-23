// mock BEFORE imports

const mockSingle = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn();
jest.mock('../../../integration/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useProfile, isProfileComplete } from '../hooks';
import { getProfile, updateProfile } from '../services';
import { Profile } from '../types';

describe('profile tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // select chain
    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      single: mockSingle,
    });

    // update chain
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
  });

  const mockProfile: Profile = {
    id: '1',
    full_name: 'John Doe',
    province: 'AB',
    education_level: 'undergraduate',
    field_of_study: 'CS',
    gpa: 3.5,
    citizenship_status: 'canadian_citizen',
    full_time_student: true,
    financial_need: true,
  };

  it('useProfile does nothing without userId', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('useProfile fetches profile', async () => {
    mockSingle.mockResolvedValue({
      data: mockProfile,
    });

    const { result } = renderHook(() => useProfile('1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toEqual(mockProfile);
  });

  it('isProfileComplete true case', () => {
    expect(isProfileComplete(mockProfile)).toBe(true);
  });

  it('isProfileComplete false cases', () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(isProfileComplete({ ...mockProfile, province: null })).toBe(false);
    expect(isProfileComplete({ ...mockProfile, education_level: null })).toBe(false);
    expect(isProfileComplete({ ...mockProfile, field_of_study: null })).toBe(false);
    expect(isProfileComplete({ ...mockProfile, citizenship_status: null })).toBe(false);
    expect(isProfileComplete({ ...mockProfile, full_time_student: null })).toBe(false);
    expect(isProfileComplete({ ...mockProfile, financial_need: null })).toBe(false);
  });

  it('getProfile builds correct chain', async () => {
    await getProfile('123');

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });

  it('updateProfile builds correct chain', async () => {
    await updateProfile('123', { province: 'AB' });

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ province: 'AB' });
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });
});
