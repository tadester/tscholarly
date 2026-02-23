export interface Scholarship {
  id: string;
  scholarship_name: string;
  awarding_organization: string;
  award_amount: number;
  deadline: string;
  province: string | null;
  is_national: boolean;
  education_level: string;
  minimum_gpa: number | null;
  is_active: boolean;
}
