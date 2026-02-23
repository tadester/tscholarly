import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../../integration/supabase';
import { useProfile } from '../../features/profile/hooks';
import { updateProfile } from '../../features/profile/services';
import { useNavigation } from '@react-navigation/native';

const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

const EDUCATION_LEVELS = [
  { label: 'High School', value: 'high_school' },
  { label: 'College', value: 'college' },
  { label: 'Undergraduate', value: 'undergraduate' },
  { label: 'Graduate', value: 'graduate' },
  { label: 'PhD', value: 'phd' },
];

const CITIZENSHIP_OPTIONS = [
  { label: 'Canadian Citizen', value: 'canadian_citizen' },
  { label: 'Permanent Resident', value: 'permanent_resident' },
  { label: 'International Student', value: 'international_student' },
  { label: 'Refugee / Protected Person', value: 'refugee_protected' },
];

export default function ProfileSetupScreen() {
  const navigation = useNavigation<unknown>();

  const [userId, setUserId] = useState<string>();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id);
      setLoadingUser(false);
    };
    getUser();
  }, []);

  const { profile } = useProfile(userId);

  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [gpa, setGpa] = useState('');
  const [citizenshipStatus, setCitizenshipStatus] = useState<string | null>(null);
  const [fullTime, setFullTime] = useState<boolean | null>(null);
  const [financialNeed, setFinancialNeed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setProvince(profile.province ?? null);
    setEducationLevel(profile.education_level ?? null);
    setFieldOfStudy(profile.field_of_study ?? '');
    setGpa(profile.gpa ? String(profile.gpa) : '');
    setCitizenshipStatus(profile.citizenship_status ?? null);
    setFullTime(profile.full_time_student ?? null);
    setFinancialNeed(profile.financial_need ?? null);
  }, [profile]);

  const saveProfile = async () => {
    if (!userId) return;

    await updateProfile(userId, {
      full_name: fullName || null,
      province,
      education_level: educationLevel,
      field_of_study: fieldOfStudy || null,
      gpa: gpa ? Number(gpa) : null,
      citizenship_status: citizenshipStatus,
      full_time_student: fullTime,
      financial_need: financialNeed,
    });
  };

  if (loadingUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {Platform.OS === 'web' && (
          <View style={styles.left}>
            <Text style={styles.logo}>D</Text>
            <Text style={styles.leftTitle}>Set up your profile</Text>
            <Text style={styles.leftSub}>
              The more you complete, the better your scholarship matches.
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.form}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Complete Profile</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Province</Text>
          <Selector
            options={PROVINCES.map((p) => ({ label: p, value: p }))}
            value={province}
            setValue={setProvince}
          />

          <Text style={styles.section}>Academic Information</Text>

          <Text style={styles.label}>Education Level</Text>
          <Selector
            options={EDUCATION_LEVELS}
            value={educationLevel}
            setValue={setEducationLevel}
          />

          <Text style={styles.label}>Field of Study</Text>
          <TextInput style={styles.input} value={fieldOfStudy} onChangeText={setFieldOfStudy} />

          <Text style={styles.label}>GPA (optional)</Text>
          <TextInput
            style={styles.input}
            value={gpa}
            onChangeText={setGpa}
            keyboardType="decimal-pad"
          />

          <Text style={styles.section}>Status</Text>

          <Text style={styles.label}>Citizenship Status</Text>
          <Selector
            options={CITIZENSHIP_OPTIONS}
            value={citizenshipStatus}
            setValue={setCitizenshipStatus}
          />

          <Text style={styles.label}>Full-Time Student?</Text>
          <BooleanSelector value={fullTime} setValue={setFullTime} />

          <Text style={styles.label}>Financial Need?</Text>
          <BooleanSelector value={financialNeed} setValue={setFinancialNeed} />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              await saveProfile();
              navigation.goBack();
            }}
          >
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              await saveProfile();
              navigation.goBack();
            }}
          >
            <Text style={styles.secondaryText}>Finish Later</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
            <Text style={styles.linkText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

function Selector({ options, value, setValue }: unknown) {
  return (
    <View style={styles.selectorRow}>
      {options.map((opt: unknown) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => setValue(opt.value)}
          style={[styles.selector, value === opt.value && styles.selectorActive]}
        >
          <Text style={value === opt.value ? styles.selectorTextActive : styles.selectorText}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BooleanSelector({ value, setValue }: unknown) {
  return (
    <View style={styles.selectorRow}>
      <TouchableOpacity
        onPress={() => setValue(true)}
        style={[styles.selector, value === true && styles.selectorActive]}
      >
        <Text style={value === true ? styles.selectorTextActive : styles.selectorText}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setValue(false)}
        style={[styles.selector, value === false && styles.selectorActive]}
      >
        <Text style={value === false ? styles.selectorTextActive : styles.selectorText}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3F6FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 1000,
    maxHeight: '95%',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  left: {
    flex: 1,
    backgroundColor: '#EEF3FF',
    padding: 40,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  leftTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  leftSub: {
    marginTop: 10,
    color: '#555',
  },
  form: {
    flex: 1,
    padding: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
    fontWeight: '700',
    fontSize: 15,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  selectorActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  selectorText: {
    color: '#333',
  },
  selectorTextActive: {
    color: '#FFF',
  },
  primaryButton: {
    marginTop: 30,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFF',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
