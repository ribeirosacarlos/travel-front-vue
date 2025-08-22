# Front-end da Gestão de Pedidos de Viagem Corporativa

Este projeto é o **front-end** de uma aplicação Full Stack para gerenciar pedidos de viagem corporativa, desenvolvido em **Vue.js 3** com **Vite**, consumindo a API do back-end Laravel.

---

## Funcionalidades

- Dashboard com tabela de pedidos e filtros por status.
- Formulário/modal para criação de novos pedidos de viagem.
- Atualização de status de pedidos diretamente na tabela.
- Feedback visual ao usuário com mensagens de sucesso/erro e loading spinner.
- Autenticação via JWT para proteger rotas.

---

## Estrutura do Projeto

- **src/components** - Componentes Vue reutilizáveis.
- **src/views** - Páginas principais da aplicação.
- **src/router** - Configuração das rotas.
- **src/services** - Chamadas à API e gerenciamento de tokens.
- **src/store** - Gerenciamento de estado (se estiver usando Pinia ou Vuex).

---

## Instalação e Execução

### 1. **Configurar variáveis de ambiente**  
   Copie o arquivo `.env.example` para `.env` e configure a URL da API do back-end:

```bash
   cp .env.example .env
```

### 2.Buildar e iniciar os containers Docker
```bash
docker-compose up -d --build
```

Aguarde até que o container esteja totalmente iniciado.

### 3.Instalar dependências do front-end
```bash
npm install
```

### 4.Rodar o servidor de desenvolvimento
```bash
npm run dev
```