# SpeedMed Care Hub

## Sobre o Projeto

O **SpeedMed Care Hub** é uma plataforma completa para a gestão de saúde e atendimento médico. O sistema foi desenvolvido para facilitar a interação e o acompanhamento clínico, conectando pacientes, médicos e administradores em um único portal integrado. 

A aplicação possui painéis dedicados com funcionalidades específicas para diferentes tipos de usuários:

- **Administradores:** Visão geral do sistema e gerenciamento de usuários.
- **Médicos (Doctor Portal):** Acompanhamento de pacientes, registro de consultas, geração de relatórios de saúde e agendamento.
- **Pacientes:** Acesso a registros médicos, agendamento de consultas e acompanhamento de saúde.

## Funcionalidades Principais

- **Autenticação Baseada em Regras:** Login seguro e direcionamento para painéis específicos de acordo com o papel do usuário (Admin, Médico, Paciente).
- **Cadastro e Gestão de Pacientes:** Interface otimizada para médicos e administradores registrarem e atualizarem o histórico dos pacientes.
- **Geração de Relatórios:** Criação de relatórios detalhados para acompanhamento médico, com possibilidade de gerar PDFs do quadro de saúde e exames.
- **Interface Intuitiva:** Design moderno, dinâmico e focado na melhor experiência do usuário (UX).

## Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

- **React:** Biblioteca principal para renderização de interface de usuário focada em componentes.
- **Vite:** Ferramenta de build extremamente rápida com Hot Module Replacement (HMR).
- **TypeScript:** Tipagem estática para JavaScript que aumenta a previsibilidade e a robustez do código.
- **shadcn-ui & Radix UI:** Componentes de interface modulares, sem estilo pré-definido, altamente acessíveis.
- **Tailwind CSS:** Framework utilitário de CSS para estilizar layouts complexos rapidamente.
- **React Router Dom:** Gerenciamento seguro de rotas do lado do cliente.

## Como Executar o Projeto Localmente

**Pré-requisitos:** É necessário ter o **Node.js** e o **npm** instalados na sua máquina.

Siga os passos abaixo:

```bash
# Passo 1: Clone o repositório utilizando a sua URL do Git
git clone <SUA_URL_DO_GIT>

# Passo 2: Acesse o diretório principal do projeto
cd speedmed-care-hub

# Passo 3: Instale as dependências necessárias
npm install

# Passo 4: Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível no seu navegador local, geralmente no endereço `http://localhost:5173/`.

