import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

const mockSignOut = jest.fn();
const mockNavigate = jest.fn();
const mockGetUser = jest.fn();
const mockUseProfile = jest.fn();
const mockIsProfileComplete = jest.fn();
const mockUseScholarships = jest.fn();

jest.mock('../../../core/auth/auth.service', () => ({
  signOut: () => mockSignOut(),
}));

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../../features/profile/hooks', () => ({
  useProfile: (userId: string | undefined) => mockUseProfile(userId),
  isProfileComplete: (profile: any) => mockIsProfileComplete(profile),
}));

jest.mock('../../../features/scholarships/hooks', () => ({
  useScholarships: (userId: string | undefined, tab: any) => mockUseScholarships(userId, tab),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading before user loads', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
    });

    mockUseProfile.mockReturnValue({
      profile: null,
      loading: true,
    });

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: false,
    });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders dashboard and logout', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(true);

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: false,
    });

    const { findByText } = render(<HomeScreen />);

    await findByText('Dashboard');

    fireEvent.press(await findByText('Logout'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows incomplete profile banner', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(false);

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: false,
    });

    const { findByText } = render(<HomeScreen />);

    await findByText('Complete your profile to unlock personalized scholarship matches.');

    fireEvent.press(await findByText('Complete Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfileSetup');
  });

  it('shows recommended locked state', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(false);

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: false,
    });

    const { findByText } = render(<HomeScreen />);

    await findByText('Dashboard');

    fireEvent.press(await findByText('Recommended'));

    await findByText('Complete your profile to see scholarships you qualify for.');
  });

  it('navigates to ProfileSetup from recommended locked state', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(false);

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: false,
    });

    const { findByText, findAllByText } = render(<HomeScreen />);

    await findByText('Dashboard');

    fireEvent.press(await findByText('Recommended'));

    const buttons = await findAllByText('Complete Profile');
    fireEvent.press(buttons[1]);

    expect(mockNavigate).toHaveBeenCalledWith('ProfileSetup');
  });

  it('switches from recommended back to all tab', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(true);

    mockUseScholarships.mockImplementation((userId, tab) => {
      if (tab === 'recommended') {
        return { data: [], loading: false };
      }

      return {
        data: [
          {
            id: 's1',
            title: 'Scholarship A',
            organization: 'Org A',
            award_amount: 1000,
            deadline: '2025-12-01',
          },
        ],
        loading: false,
      };
    });

    const { findByText } = render(<HomeScreen />);

    await findByText('Dashboard');

    fireEvent.press(await findByText('Recommended'));
    fireEvent.press(await findByText('All Scholarships'));

    expect(await findByText('Scholarship A')).toBeTruthy();
  });

  it('shows scholarships loading state', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(true);

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: true,
    });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders scholarships list', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(true);

    mockUseScholarships.mockReturnValue({
      data: [
        {
          id: 's1',
          title: 'Scholarship A',
          organization: 'Org A',
          award_amount: 1000,
          deadline: '2025-12-01',
        },
      ],
      loading: false,
    });

    const { findByText } = render(<HomeScreen />);

    expect(await findByText('Scholarship A')).toBeTruthy();
    expect(await findByText('Org A')).toBeTruthy();
    expect(await findByText('$1000')).toBeTruthy();
  });

  it('renders scholarship without amount and deadline', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(true);

    mockUseScholarships.mockReturnValue({
      data: [
        {
          id: 's2',
          title: 'Scholarship B',
          organization: 'Org B',
          award_amount: null,
          deadline: null,
        },
      ],
      loading: false,
    });

    const { findByText, queryByText } = render(<HomeScreen />);

    expect(await findByText('Scholarship B')).toBeTruthy();
    expect(await findByText('Org B')).toBeTruthy();
    expect(queryByText('$')).toBeNull();
    expect(queryByText(/Deadline:/)).toBeNull();
  });

  it('shows empty state when no scholarships', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });

    mockUseProfile.mockReturnValue({
      profile: {},
      loading: false,
    });

    mockIsProfileComplete.mockReturnValue(true);

    mockUseScholarships.mockReturnValue({
      data: [],
      loading: false,
    });

    const { findByText } = render(<HomeScreen />);

    expect(await findByText('No scholarships found.')).toBeTruthy();
  });
});
