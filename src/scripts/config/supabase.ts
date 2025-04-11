import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? '';
export const supabase = createClient(supabaseUrl, supabaseKey);


export const uploadSupabaseFile = async (bucket: string, file: File | null, name: string, options?: any) => {
  if (!file) {
    console.error('No file data');
    return;
  }
  const { error } = await supabase.storage.from(bucket).upload(name, file, options || {});
  if (error) console.error(error);
};

export const getSupabaseFile = async (bucket: string, path: string): Promise<string> => {
  return `${supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl}?t=${new Date().getTime()}`;
};

export const deleteSupabaseFile = async (bucket: string, path: string) => {
  await supabase.storage.from(bucket).remove(path.split('/'));
};
