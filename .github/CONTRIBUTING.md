# Contribuindo com o Big O Viz

Obrigado pelo interesse em contribuir! Este guia explica como propor mudanças.

## Reportando bugs e sugerindo melhorias

- Procure nas [issues](https://github.com/BGLuis/big-o/issues) se o assunto já foi aberto.
- Se não foi, abra uma issue usando o modelo adequado (bug ou sugestão).

## Preparando o ambiente

Siga a seção "Como iniciar" do [README](../README.md) para instalar e rodar o projeto.

## Fluxo de contribuição

1. Faça um fork do repositório e crie uma branch a partir de `main`.
2. Faça as mudanças em commits pequenos e com mensagens claras.
3. Rode as verificações abaixo antes de abrir o Pull Request.
4. Abra o Pull Request para `main` preenchendo o modelo.

## Padrão de commits

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Verificações

```sh
npm test
npm run build
```
