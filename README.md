# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/cddcd886-4da4-460f-befa-9834bd1dae50

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cddcd886-4da4-460f-befa-9834bd1dae50) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cddcd886-4da4-460f-befa-9834bd1dae50) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🎯 Sistema de Tracking de Progresso de Vídeos

O sistema agora possui um tracking completo de progresso dos vídeos assistidos:

### ✨ Funcionalidades Implementadas

1. **Marcação Automática de Vídeos Assistidos**
   - Vídeos são marcados como assistidos automaticamente ao atingir 85% da duração
   - Também marcados como assistidos quando o vídeo termina completamente
   - Feedback visual com toast notifications

2. **Dashboard de Progresso Atualizado em Tempo Real**
   - Gráficos de progresso geral e por módulo
   - Estatísticas de vídeos assistidos vs restantes
   - Atividade recente dos últimos vídeos assistidos

3. **Indicadores Visuais**
   - Ícone verde de "check" nos cards de vídeos assistidos
   - Badges de progresso nos módulos do Hiper
   - Barras de progresso com percentuais

4. **Organização por Módulos (Sistema Hiper)**
   - Hiper Gestão
   - Hiper Loja  
   - Hiper Caixa
   - Progresso individual por módulo

### 🔧 Como Funciona

1. **Ao Assistir um Vídeo:**
   - Sistema salva progresso na tabela `video_history`
   - Quando atinge 85% → marca como assistido
   - Quando termina → confirma como assistido
   - Dashboard é atualizado automaticamente

2. **Na Tela Inicial:**
   - Mostra estatísticas gerais de progresso
   - Gráficos de pizza e barras
   - Cards coloridos com métricas

3. **Na Tela do Hiper:**
   - Módulos mostram progresso individual
   - Vídeos assistidos ficam marcados com ✅
   - Contador de vídeos por módulo

### 🧪 Como Testar

1. Acesse a página do Hiper
2. Clique em qualquer vídeo dos módulos
3. Assista até 85% ou deixe terminar
4. Veja o vídeo ser marcado como assistido
5. Volte para o dashboard e veja as estatísticas atualizadas
6. Observe os gráficos e contadores atualizados

### 📊 Tabelas do Banco

- `video_history`: Armazena histórico completo de visualizações
  - `user_id`: ID do usuário
  - `video_id`: ID do vídeo
  - `completed`: Se foi assistido completamente
  - `watch_duration`: Duração assistida em segundos
  - `watched_at`: Data/hora que foi assistido

O sistema substitui a antiga tabela `progresso_videos` por uma mais completa.
