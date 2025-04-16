# Processador de Páginas PDF - Frontend

Este é o frontend de uma aplicação web desenvolvida para permitir o upload, visualização, seleção e processamento de páginas específicas de arquivos PDF.

## Funcionalidades Principais

- **Upload de PDF:** Permite ao usuário carregar um arquivo PDF do seu dispositivo.
- **Visualização de Páginas:** Exibe as páginas do PDF carregado uma por uma, com navegação entre elas.
- **Seleção de Páginas:** O usuário pode selecionar páginas individuais do PDF que deseja processar.
- **Processamento:** Envia o PDF original e a lista de páginas selecionadas para um backend (não incluído neste repositório, mas esperado em `http://localhost:3001/process-pdf`) para processamento posterior (por exemplo, extrair ou criar um novo PDF com apenas as páginas selecionadas).

## Tecnologias Utilizadas

- **React:** Biblioteca JavaScript para construção de interfaces de usuário.
- **Vite:** Ferramenta de build e servidor de desenvolvimento rápido para aplicações web modernas.
- **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
- **pdfjs-dist:** Biblioteca para renderizar arquivos PDF no navegador.
- **CSS:** Para estilização básica.

## Configuração e Execução Local

Siga os passos abaixo para configurar e executar a aplicação frontend localmente:

1.  **Clone o repositório (se aplicável):**
    ```bash
    git clone <url-do-repositorio>
    cd frontend
    ```

2.  **Instale as dependências:**
    Certifique-se de ter o Node.js e o npm (ou yarn) instalados.
    ```bash
    npm install
    ```
    ou
    ```bash
    yarn install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    ou
    ```bash
    yarn dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver ocupada).

4.  **Execute o Backend:**
    Esta aplicação frontend depende de um serviço de backend para processar os PDFs. Certifique-se de que o backend esteja rodando e acessível na URL configurada no `src/App.tsx` (atualmente `http://localhost:3001/process-pdf`).

## Estrutura do Projeto

```
frontend/
├── public/             # Arquivos estáticos
├── src/
│   ├── assets/         # Imagens e outros assets
│   ├── App.css         # Estilos para App.tsx
│   ├── App.tsx         # Componente principal da aplicação
│   ├── index.css       # Estilos globais
│   ├── main.tsx        # Ponto de entrada da aplicação React
│   └── vite-env.d.ts   # Tipos de ambiente Vite
├── .gitignore          # Arquivos ignorados pelo Git
├── eslint.config.js    # Configuração do ESLint
├── index.html          # Template HTML principal
├── package.json        # Dependências e scripts do projeto
├── README.md           # Este arquivo
├── tsconfig.app.json   # Configuração TypeScript para a aplicação
├── tsconfig.json       # Configuração TypeScript base
├── tsconfig.node.json  # Configuração TypeScript para o ambiente Node (Vite)
└── vite.config.ts      # Configuração do Vite
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
