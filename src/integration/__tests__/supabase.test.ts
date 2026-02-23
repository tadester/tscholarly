describe('supabase client initialization', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('throws error if environment variables are missing', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = '';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';

    expect(() => {
      require('../supabase');
    }).toThrow('Supabase environment variables are missing');
  });

  it('creates supabase client when env variables exist', () => {
    const mockCreateClient = jest.fn().mockReturnValue('mock-client');

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: mockCreateClient,
    }));

    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { supabase } = require('../supabase');

    expect(mockCreateClient).toHaveBeenCalledWith('https://test.supabase.co', 'anon-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });

    expect(supabase).toBe('mock-client');
  });
});
