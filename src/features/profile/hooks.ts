import { useEffect, useState } from 'react';
import { getProfile } from './services';
import { Profile } from './types';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const { data } = await getProfile(userId);
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
};

export const isProfileComplete = (profile: Profile | null) => {
  if (!profile) return false;

  return (
    !!profile.province &&
    !!profile.education_level &&
    !!profile.field_of_study &&
    !!profile.citizenship_status &&
    profile.full_time_student !== null &&
    profile.financial_need !== null
  );
};
