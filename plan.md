# Projeto "Big O" - Plataforma de Visualização de Algoritmos e Estruturas de Dados

## Objetivo

Criar uma plataforma educacional independente no formato sandbox exploratório, focada em auxiliar estudantes de programação no entendimento de algoritmos clássicos, estruturas de dados e execução passo a passo de código.

## Motivação

Aprender programação, especialmente conceitos abstratos como ordenação, busca, grafos, árvores e ponteiros, pode ser extremamente desafiador. Uma abordagem visual e interativa acelera a compreensão, permitindo que o aluno veja "por baixo dos panos" como a memória e a lógica operam.

## Escopo e Funcionalidades Principais

1. **Estruturas de Dados:** Visualizações interativas para Arrays, Listas Encadeadas, Pilhas, Filas, Árvores (Binárias, AVL) e Grafos.
2. **Algoritmos Clássicos:** Animações para algoritmos de ordenação (Bubble, Merge, Quick, etc.) e busca (Linear, Binária, Busca em Grafos BFS/DFS).
3. **Execução Passo a Passo (Sandbox):** Um editor de código onde o aluno pode colar/digitar um script, e a plataforma renderiza o estado da memória e das variáveis linha a linha (inspirado no Python Tutor).
4. **Suporte Multi-Linguagens:** Suporte inicial focado em Python, com expansão planejada para C/C++ e Java (amplamente usados no ambiente acadêmico).

## Proposta de Solução (Arquitetura)

Para suportar essas demandas com performance e segurança:

- **Frontend (Web):**
  - **Framework Sugerido:** React, Vue ou Angular.
  - **Bibliotecas de Visualização:** D3.js, Cytoscape.js ou bibliotecas Canvas/WebGL nativas para renderização fluida das estruturas de dados e animações.
  - **Editor de Código:** Monaco Editor (base do VSCode) para syntax highlighting rico.

- **Backend (Code Execution & Debugging):**
  - O desafio principal é a execução segura de código submetido pelo usuário e a extração do estado passo a passo.
  - **Opção A (Integração com Debuggers):** Um serviço backend rodando containers Docker/gVisor efêmeros. O código é executado conectando debuggers nativos (como `pdb` para Python e `gdb` para C/C++) via DAP (Debug Adapter Protocol) e enviando os trace events via WebSockets pro frontend.
  - **Opção B (Instrumentação de Código):** O código é parseado no backend (AST), instrumentado com `prints`/`logs` invisíveis antes de ser executado num sandbox, para cuspir o estado das variáveis, de forma similar a algumas plataformas existentes.

## Plano de Implementação (Fases)

### Fase 1: Fundação do Sandbox Visual (Frontend-Focused)

- Configuração do repositório frontend e arquitetura base do UI/UX.
- Criação do Canvas de renderização principal.
- Implementação visual de estruturas de dados estáticas (Arrays e Árvores).
- **Entregável:** Um painel onde o usuário pode criar e manipular blocos de dados através de cliques (sem código real ainda).

### Fase 2: Motor de Algoritmos Animados

- Implementação dos algoritmos clássicos de ordenação usando geradores JavaScript (`function*`) no frontend para pausar/retomar a execução do próprio frontend e animar as trocas de posição no array.
- Integração de controles de playback (Play, Pause, Step Forward, Step Back, Velocidade).
- **Entregável:** Módulo completo de visualização de algoritmos rodando 100% no browser.

### Fase 3: Prova de Conceito do Backend Sandbox (Python)

- Configuração da arquitetura de backend seguro (ex: Docker containers isolados).
- Integração do Monaco Editor no Frontend.
- Implementação do extrator de trace/estado para Python (Opção A ou B definidas na arquitetura).
- Comunicação assíncrona (WebSocket) entre Frontend e Backend para transmissão de estados.
- **Entregável:** O usuário escreve código Python simples (com variáveis, loops e funções) e vê o rastreamento em tempo real do estado da memória.

### Fase 4: Expansão para C/C++ e Java

- Extensão do container backend para suportar GCC/GDB para execução de C/C++.
- Extensão do suporte para JDB (Java Debugger) para visualização de instâncias e memória heap do Java.
- Mapeamento de estruturas de dados nativas dessas linguagens (como ponteiros em C/C++) para a renderização do frontend.
- **Entregável:** Plataforma unificada rodando perfeitamente Python, C/C++ e Java passo a passo.

## Estratégia de Validação

- **Testes Unitários:** Ampla cobertura nas funções de parsing de AST ou extração de eventos do debugger no backend para garantir que nenhum estado seja lido incorretamente.
- **Testes de Segurança (Sandbox):** Testes rigorosos tentando executar códigos maliciosos (como fork bombs, tentativas de acesso à rede/sistema de arquivos) no backend para validar o isolamento dos containers.
- **Performance (UI):** Garantir que a renderização não ultrapasse 60fps mesmo visualizando arrays de tamanho médio-grande (ex: 500 a 1000 elementos) na seção de ordenação.
  y
