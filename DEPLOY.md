# Guia de Deploy no Vercel

## Problema Resolvido: Erro 404 em Rotas React

Este projeto agora inclui as configurações necessárias para funcionar corretamente no Vercel:

### Arquivos de Configuração

1. **vercel.json** - Configuração principal do Vercel
   - Redireciona todas as rotas para `/index.html`
   - Permite que o React Router funcione corretamente

2. **public/_redirects** - Arquivo de fallback
   - Configuração adicional para garantir o roteamento

### Configurações no Vercel Dashboard

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`

### Variáveis de Ambiente (se necessário)

Se você quiser usar variáveis de ambiente no futuro:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Como Resolver o Erro 404

O erro 404 que você estava vendo acontece porque:

1. **Problema**: Quando você recarrega uma página como `/auth`, o Vercel tenta encontrar um arquivo físico nesse caminho
2. **Solução**: O `vercel.json` redireciona todas as rotas para `/index.html`, permitindo que o React Router assuma o controle

### Próximos Passos

1. Faça commit das mudanças:
   ```bash
   git add .
   git commit -m "fix: adicionar configuração Vercel para resolver erro 404"
   git push
   ```

2. O Vercel irá automaticamente fazer o redeploy

3. Teste acessando `/auth` diretamente e recarregando a página

### Verificação

Após o deploy, teste:
- ✅ Página inicial: `https://seu-projeto.vercel.app/`
- ✅ Página de login: `https://seu-projeto.vercel.app/auth`
- ✅ Recarregar página de login (F5)
- ✅ Acessar URL diretamente no navegador 