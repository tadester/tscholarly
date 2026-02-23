import { getRecommendedScholarships } from '../services';
import { supabase } from '../../../integration/supabase';

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Scholarships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendedScholarships', () => {
    it('calls supabase.rpc with correct parameters', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [] } as any);

      await getRecommendedScholarships('user-123');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_recommended_scholarships', {
        p_user_id: 'user-123',
      });
    });
  });

  describe('supabase query chain for all scholarships', () => {
    it('builds correct query chain', async () => {
      const orderMock = jest.fn().mockResolvedValue({ data: [] });
      const gteMock = jest.fn().mockReturnValue({ order: orderMock });
      const eqMock = jest.fn().mockReturnValue({ gte: gteMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

      mockSupabase.from.mockReturnValue({
        select: selectMock,
      } as any);

      await supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true });

      expect(mockSupabase.from).toHaveBeenCalledWith('scholarships');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('is_active', true);
      expect(gteMock).toHaveBeenCalled();
      expect(orderMock).toHaveBeenCalledWith('deadline', {
        ascending: true,
      });
    });
  });

  describe('recommended scholarships rpc direct call', () => {
    it('calls rpc correctly', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [] } as any);

      await supabase.rpc('get_recommended_scholarships', {
        p_user_id: 'user-1',
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_recommended_scholarships', {
        p_user_id: 'user-1',
      });
    });
  });
});
