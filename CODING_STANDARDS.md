# 📋 Padrões de Codificação - NexHub Tutoriais

## 🎯 Regras Gerais

### 1. Estrutura de Arquivos
```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes de interface (shadcn/ui)
│   ├── admin/          # Componentes específicos da área administrativa
│   ├── auth/           # Componentes de autenticação
│   └── [feature]/      # Componentes organizados por funcionalidade
├── pages/              # Páginas da aplicação
├── contexts/           # Contextos React (AuthContext, ThemeContext)
├── hooks/              # Hooks customizados
├── services/           # Camada de serviços (Supabase, APIs)
├── lib/                # Utilitários e configurações
├── types/              # Definições de tipos TypeScript
├── templates/          # Templates para novos componentes
└── integrations/       # Integrações externas (Supabase)
```

### 2. Nomenclatura
- **Componentes**: PascalCase (`VideoCard`, `UserProfile`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários
- **Variáveis/Funções**: camelCase (`fetchVideos`, `isLoading`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces TypeScript**: PascalCase (`Video`, `UserProfile`)

### 3. Componentes React

#### ✅ Estrutura Padrão
```typescript
import React from 'react';
import { ComponentProps } from './types'; // Se necessário

interface ComponentNameProps {
  // Props tipadas
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Hooks no topo
  const [state, setState] = useState();
  
  // Funções auxiliares
  const handleAction = () => {
    // lógica
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## 🗄️ Banco de Dados (Supabase)

### 1. Camada de Serviços
- **TODA** interação com Supabase deve passar por `src/services/`
- Nunca importar `supabase` diretamente nos componentes

#### ✅ Correto
```typescript
// src/services/videoService.ts
export const videoService = {
  async getVideos() {
    const { data, error } = await supabase.from('videos').select('*');
    if (error) throw error;
    return data;
  }
};

// Componente
import { videoService } from '@/services/videoService';
const videos = await videoService.getVideos();
```

#### ❌ Incorreto
```typescript
// Componente
import { supabase } from '@/integrations/supabase/client';
const { data } = await supabase.from('videos').select('*');
```

### 2. Políticas RLS (Row Level Security)
- Sempre usar RLS em tabelas sensíveis
- Evitar políticas que causem recursão infinita
- Documentar políticas complexas

#### ✅ Exemplo de Política Segura
```sql
-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Admins podem ver todos os dados (sem recursão)
CREATE POLICY "Admins can view all data" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);
```

## 🎨 Interface e Styling

### 1. Componentes UI
- Usar shadcn/ui como base
- Customizações em `src/components/ui/`
- Manter consistência visual

### 2. Tailwind CSS
- Usar classes utilitárias
- Criar classes customizadas em `src/index.css` quando necessário
- Seguir o design system definido

### 3. Responsividade
- Mobile-first approach
- Testar em diferentes tamanhos de tela
- Usar breakpoints do Tailwind (`sm:`, `md:`, `lg:`, `xl:`)

## 🔐 Autenticação e Autorização

### 1. Contexto de Autenticação
- Usar `AuthContext` para gerenciar estado de autenticação
- Verificar permissões no frontend E backend

### 2. Proteção de Rotas
```typescript
// Exemplo de proteção de rota
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return <Navigate to="/auth" />;
  
  return children;
};
```

## 🧪 Tratamento de Erros

### 1. Padrão de Error Handling
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const data = await service.getData();
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

### 2. Validação de Dados
- Validar dados no frontend antes de enviar
- Sempre validar no backend também
- Usar TypeScript para tipagem forte

## 📝 Comentários e Documentação

### 1. Comentários Úteis
```typescript
// ✅ Bom: Explica o "porquê"
// Precisamos verificar se o usuário é admin antes de mostrar o botão
// porque a política RLS pode não ser suficiente para alguns casos edge
if (isAdmin) {
  // ...
}

// ❌ Ruim: Explica o "o quê" (óbvio)
// Incrementa o contador
counter++;
```

### 2. JSDoc para Funções Complexas
```typescript
/**
 * Busca vídeos filtrados por categoria e sistema
 * @param categoria - ID da categoria ou 'all' para todas
 * @param sistema - 'pdvlegal' ou 'hiper'
 * @returns Promise com array de vídeos
 */
export const getVideosByCategory = async (categoria: string, sistema: string) => {
  // implementação
};
```

## 🚀 Performance

### 1. Lazy Loading
- Usar `React.lazy()` para páginas
- Carregar componentes pesados sob demanda

### 2. Memoização
```typescript
// Para componentes que re-renderizam frequentemente
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* renderização pesada */}</div>;
});

// Para cálculos pesados
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

## 🔧 Ferramentas e Configuração

### 1. ESLint
- Seguir as regras configuradas
- Não desabilitar regras sem justificativa
- Usar `// eslint-disable-next-line` com parcimônia

### 2. TypeScript
- Evitar `any` - usar tipos específicos
- Criar interfaces para objetos complexos
- Usar union types quando apropriado

### 3. Git
- Commits descritivos em português
- Usar conventional commits quando possível
- Branches por feature (`feature/nova-funcionalidade`)

## 📋 Checklist de Code Review

Antes de fazer commit, verificar:

- [ ] Código segue os padrões de nomenclatura
- [ ] Componentes estão na pasta correta
- [ ] Interações com Supabase passam pela camada de serviços
- [ ] Tratamento de erros implementado
- [ ] Componente é responsivo
- [ ] TypeScript sem erros
- [ ] Sem `console.log` em produção
- [ ] Políticas RLS testadas
- [ ] Comentários úteis adicionados

## 🎯 Objetivos

Seguindo essas regras, conseguimos:
- **Código mais legível** e fácil de entender
- **Manutenção simplificada** com estrutura organizada
- **Menos bugs** com tipagem forte e validações
- **Performance melhor** com boas práticas
- **Colaboração eficiente** com padrões claros
- **Segurança** com políticas RLS bem definidas

---

*Este documento deve ser atualizado conforme o projeto evolui.* 