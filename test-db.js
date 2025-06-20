import { createClient } from '@supabase/supabase-js';

// Verificar se há variáveis de ambiente
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'não definida');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'definida' : 'não definida');

// Tentar criar cliente
try {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Testar conexão
  console.log('Testando conexão...');
  
  const testVideos = await supabase.from('videos').select('*').limit(3);
  console.log('Videos encontrados:', testVideos.data?.length || 0);
  if (testVideos.error) console.log('Erro videos:', testVideos.error.message);
  
  const testCategorias = await supabase.from('categorias').select('*').limit(3);
  console.log('Categorias encontradas:', testCategorias.data?.length || 0);
  if (testCategorias.error) console.log('Erro categorias:', testCategorias.error.message);
  
  const testTags = await supabase.from('tags').select('*').limit(3);
  console.log('Tags encontradas:', testTags.data?.length || 0);
  if (testTags.error) console.log('Erro tags:', testTags.error.message);
  
} catch (error) {
  console.error('Erro ao conectar:', error.message);
} 