import { supabase } from './src/integrations/supabase/client.js';

async function checkDatabase() {
  console.log('🔍 Verificando dados no banco de dados...\n');
  
  try {
    // Verificar vídeos
    console.log('📹 Verificando vídeos:');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, titulo, miniatura, sistema, status')
      .limit(5);
    
    if (videosError) {
      console.log('❌ Erro ao buscar vídeos:', videosError.message);
    } else {
      console.log(`✅ Total de vídeos encontrados: ${videos.length}`);
      videos.forEach(video => {
        console.log(`   - ${video.titulo} (${video.sistema}) - Miniatura: ${video.miniatura ? 'SIM' : 'NÃO'}`);
      });
    }
    
    console.log('\n📂 Verificando categorias:');
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('id, nome')
      .limit(5);
    
    if (categoriasError) {
      console.log('❌ Erro ao buscar categorias:', categoriasError.message);
    } else {
      console.log(`✅ Total de categorias encontradas: ${categorias.length}`);
      categorias.forEach(cat => {
        console.log(`   - ${cat.nome}`);
      });
    }
    
    console.log('\n🏷️ Verificando tags:');
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, nome')
      .limit(5);
    
    if (tagsError) {
      console.log('❌ Erro ao buscar tags:', tagsError.message);
    } else {
      console.log(`✅ Total de tags encontradas: ${tags.length}`);
      tags.forEach(tag => {
        console.log(`   - ${tag.nome}`);
      });
    }
    
    // Verificar relações video_tags
    console.log('\n🔗 Verificando relações video_tags:');
    const { data: videoTags, error: videoTagsError } = await supabase
      .from('video_tags')
      .select('*')
      .limit(5);
    
    if (videoTagsError) {
      console.log('❌ Erro ao buscar video_tags:', videoTagsError.message);
    } else {
      console.log(`✅ Total de relações video_tags encontradas: ${videoTags.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkDatabase(); 