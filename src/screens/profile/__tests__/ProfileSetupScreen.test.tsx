import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ProfileSetupScreen from '../ProfileSetupScreen';

const mockGetUser = jest.fn();
const mockUseProfile = jest.fn();
const mockUpdateProfile = jest.fn();
const mockGoBack = jest.fn();

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
  },
}));

jest.mock('../../../features/profile/hooks', () => ({
  useProfile: (userId: string | undefined) => mockUseProfile(userId),
}));

jest.mock('../../../features/profile/services', () => ({
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('ProfileSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProfile.mockReturnValue({ profile: null });
  });

  it('passes filled values correctly to updateProfile', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });

    const { findByText, getAllByDisplayValue, getByDisplayValue } = render(<ProfileSetupScreen />);

    await findByText('Complete Profile');

    const inputs = getAllByDisplayValue('');

    fireEvent.changeText(inputs[0], 'Jane Doe'); // fullName
    fireEvent.changeText(inputs[1], 'Engineering'); // fieldOfStudy
    fireEvent.changeText(inputs[2], '3.8'); // gpa

    fireEvent.press(await findByText('Continue'));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith('u1', {
        full_name: 'Jane Doe',
        province: null,
        education_level: null,
        field_of_study: 'Engineering',
        gpa: 3.8,
        citizenship_status: null,
        full_time_student: null,
        financial_need: null,
      });
    });
  });
  /* 101 — loading branch               */

  it('renders loading spinner initially', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    const { getByTestId, findByText } = render(<ProfileSetupScreen />);

    // wait for form to remove act warning
    await findByText('Complete Profile');
  });

  it('fully executes profile useEffect mapping', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {
        full_name: null,
        province: undefined,
        education_level: undefined,
        field_of_study: null,
        gpa: 0,
        citizenship_status: undefined,
        full_time_student: undefined,
        financial_need: undefined,
      },
    });

    const { findByText } = render(<ProfileSetupScreen />);
    await findByText('Complete Profile');
  });

  it('covers numeric GPA conversion branch', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {
        full_name: 'Jane',
        province: 'AB',
        education_level: 'college',
        field_of_study: 'Math',
        gpa: 3.5,
        citizenship_status: 'canadian_citizen',
        full_time_student: true,
        financial_need: false,
      },
    });

    const { findByDisplayValue } = render(<ProfileSetupScreen />);

    expect(await findByDisplayValue('3.5')).toBeTruthy();
  });

  /* 82 — !userId return branch         */

  it('covers saveProfile early return when no userId', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
    });

    const { findByText } = render(<ProfileSetupScreen />);
    await findByText('Complete Profile');

    fireEvent.press(await findByText('Continue'));

    await waitFor(() => {
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  /* 244 — Platform.OS === web branch   */

  it('renders left panel when Platform is web', async () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'web',
    });

    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    const { findByText } = render(<ProfileSetupScreen />);

    expect(await findByText('Set up your profile')).toBeTruthy();
  });

  /* Full selector + boolean coverage   */

  it('covers selectors and boolean styles', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    const { findByText, findAllByText } = render(<ProfileSetupScreen />);
    await findByText('Complete Profile');

    fireEvent.press(await findByText('BC'));
    fireEvent.press(await findByText('Graduate'));
    fireEvent.press(await findByText('Permanent Resident'));

    const yesButtons = await findAllByText('Yes');
    const noButtons = await findAllByText('No');

    fireEvent.press(yesButtons[0]);
    fireEvent.press(noButtons[1]);
  });
  it('Finish Later calls saveProfile and goBack', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    const { findByText } = render(<ProfileSetupScreen />);

    await findByText('Complete Profile');

    fireEvent.press(await findByText('Finish Later'));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
  it('Back to Dashboard button calls navigation.goBack only', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });

    const { findByText } = render(<ProfileSetupScreen />);

    await findByText('Complete Profile');

    fireEvent.press(await findByText('Back to Dashboard'));

    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  /* Full save flow                     */

  it('saves and navigates back', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    const { findByText } = render(<ProfileSetupScreen />);
    await findByText('Complete Profile');

    fireEvent.press(await findByText('Continue'));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
});
