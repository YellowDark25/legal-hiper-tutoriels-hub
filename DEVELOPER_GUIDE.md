# 🚀 Guia do Desenvolvedor - NexHub

## 📖 Índice
- [Configuração Inicial](#configuração-inicial)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Padrões e Convenções](#padrões-e-convenções)
- [Banco de Dados](#banco-de-dados)
- [Componentes](#componentes)
- [Testes](#testes)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## 🛠️ Configuração Inicial

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git
- Conta no Supabase

### Instalação
```bash
# Clone o repositório
git clone <url-do-repo>
cd nexhub

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# Execute o projeto
npm run dev
```

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_APP_ENV=development
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── admin/          # Componentes administrativos
│   ├── auth/           # Componentes de autenticação
│   └── [feature]/      # Componentes por funcionalidade
├── pages/              # Páginas da aplicação
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── services/           # Camada de serviços (API)
├── lib/                # Utilitários e configurações
├── types/              # Tipos TypeScript
├── templates/          # Templates para novos componentes
└── integrations/       # Integrações externas
```

## 🔄 Fluxo de Desenvolvimento

### 1. Criando uma Nova Feature

```bash
# Crie uma branch para a feature
git checkout -b feature/nome-da-feature

# Desenvolva seguindo os padrões
# Teste localmente
# Faça commit com mensagens descritivas
git commit -m "feat: adiciona nova funcionalidade X"

# Push e abra um PR
git push origin feature/nome-da-feature
```

### 2. Criando um Novo Componente

```bash
# Use o template como base
cp src/templates/Component.template.tsx src/components/MeuComponente.tsx

# Substitua 'ComponentName' por 'MeuComponente'
# Implemente a lógica necessária
# Adicione tipos no global.ts se necessário
# Teste o componente
```

### 3. Adicionando uma Nova Página

```typescript
// src/pages/MinhaPage.tsx
import React from 'react';

const MinhaPage: React.FC = () => {
  return (
    <div>
      <h1>Minha Página</h1>
    </div>
  );
};

export default MinhaPage;
```

```typescript
// Adicione a rota em App.tsx
<Route path="/minha-page" element={<MinhaPage />} />
```

## 📋 Padrões e Convenções

### Nomenclatura
- **Componentes**: `PascalCase` (ex: `VideoCard`)
- **Arquivos**: `PascalCase` para componentes, `camelCase` para utilitários
- **Variáveis**: `camelCase` (ex: `isLoading`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)
- **Interfaces**: `PascalCase` (ex: `Video`)

### Estrutura de Componente
```typescript
import React, { useState, useEffect } from 'react';
import { MinhaInterface } from '@/types/global';
import { CONSTANTE } from '@/lib/constants';

interface MeuComponenteProps {
  prop1: string;
  prop2?: number;
}

const MeuComponente: React.FC<MeuComponenteProps> = ({ prop1, prop2 }) => {
  // 1. Estados
  const [estado, setEstado] = useState('');
  
  // 2. Hooks
  const { toast } = useToast();
  
  // 3. Efeitos
  useEffect(() => {
    // lógica
  }, []);
  
  // 4. Funções auxiliares
  const handleAction = () => {
    // lógica
  };
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MeuComponente;
```

### Tratamento de Erros
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const data = await meuService.getData();
    setData(data);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os dados',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};
```

## 🗄️ Banco de Dados

### Usando Serviços
```typescript
// ❌ INCORRETO - Não importe supabase diretamente
import { supabase } from '@/integrations/supabase/client';

// ✅ CORRETO - Use os serviços
import { videoService } from '@/services/supabaseService';

const videos = await videoService.getVideos();
```

### Criando Novas Políticas RLS
```sql
-- Template para política RLS
CREATE POLICY "nome_da_politica" ON tabela
FOR operacao  -- SELECT, INSERT, UPDATE, DELETE
TO role       -- authenticated, anon, etc.
USING (condicao_where)
WITH CHECK (condicao_insert_update);
```

### Migrações
```bash
# Use o Supabase MCP para aplicar migrações
# Exemplo de migração:
```

```sql
-- Nome: add_new_table
-- Descrição: Adiciona nova tabela para funcionalidade X

CREATE TABLE nova_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON nova_tabela
FOR SELECT USING (auth.uid() = user_id);
```

## 🧩 Componentes

### Componentes UI (shadcn/ui)
```bash
# Adicionar novo componente UI
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

### Componentes Customizados
```typescript
// Use o template base
// Implemente props tipadas
// Adicione tratamento de loading/error
// Torne responsivo
// Adicione testes se necessário
```

### Hooks Customizados
```typescript
// src/hooks/useMeuHook.ts
import { useState, useEffect } from 'react';

export const useMeuHook = (parametro: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // lógica
  }, [parametro]);
  
  return { data, loading };
};
```

## 🧪 Testes

### Testes de Componente
```typescript
// src/components/__tests__/MeuComponente.test.tsx
import { render, screen } from '@testing-library/react';
import MeuComponente from '../MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente prop1="teste" />);
    expect(screen.getByText('teste')).toBeInTheDocument();
  });
});
```

### Executar Testes
```bash
npm run test          # Executar todos os testes
npm run test:watch    # Executar em modo watch
npm run test:coverage # Executar com coverage
```

## 🚀 Deploy

### Build de Produção
```bash
npm run build         # Gerar build
npm run preview       # Testar build localmente
```

### Variáveis de Produção
```env
VITE_APP_ENV=production
VITE_SUPABASE_URL=url_producao
VITE_SUPABASE_ANON_KEY=chave_producao
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Importação de Tipos
```typescript
// Problema: Cannot find module '@/types/global'
// Solução: Verifique se o arquivo existe e o path mapping está correto
```

#### 2. Erro de Política RLS
```sql
-- Problema: "insufficient_privilege" ou "row-level security policy"
-- Solução: Verifique se a política permite a operação para o usuário atual
```

#### 3. Componente não Renderiza
```typescript
// Problema: Componente não aparece na tela
// Soluções:
// 1. Verifique se está sendo importado corretamente
// 2. Verifique se há erros no console
// 3. Verifique se as props estão sendo passadas
// 4. Verifique se há condicionais que impedem a renderização
```

#### 4. Estado não Atualiza
```typescript
// Problema: useState não atualiza o componente
// Soluções:
// 1. Verifique se está usando o setter corretamente
// 2. Para objetos/arrays, crie uma nova referência
setData([...data, newItem]); // ✅ Correto
setData(data.push(newItem)); // ❌ Incorreto
```

### Debug

#### Console do Navegador
```typescript
// Use console.log para debug (remova antes do commit)
console.log('Debug:', { variable });

// Use o React DevTools
// Use o Supabase Dashboard para verificar dados
```

#### Network Tab
```
// Verifique as requisições HTTP
// Verifique se as APIs estão respondendo
// Verifique se os headers estão corretos
```

### Comandos Úteis

```bash
# Verificar erros de lint
npm run lint

# Corrigir erros de lint automaticamente
npm run lint:fix

# Verificar tipos TypeScript
npm run type-check

# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Resetar banco local (se usando Supabase local)
supabase db reset
```

## 📚 Recursos Adicionais

- [Documentação React](https://react.dev/)
- [Documentação TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- Documentação: `CODING_STANDARDS.md`
- Issues: GitHub Issues
- Chat: Slack/Discord do time

---

*Mantenha este guia atualizado conforme o projeto evolui!* 