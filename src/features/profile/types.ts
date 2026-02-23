export type EducationLevel = 'high_school' | 'college' | 'undergraduate' | 'graduate' | 'phd';

export type CitizenshipStatus =
  | 'canadian_citizen'
  | 'permanent_resident'
  | 'international_student'
  | 'refugee_protected';

export interface Profile {
  id: string;
  full_name: string | null;
  province: string | null;
  education_level: EducationLevel | null;
  field_of_study: string | null;
  gpa: number | null;
  citizenship_status: CitizenshipStatus | null;
  full_time_student: boolean | null;
  financial_need: boolean | null;
}
