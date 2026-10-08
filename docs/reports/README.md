# Relatórios técnicos — Big O

Índice dos relatórios em `docs/reports/`. Todos foram escritos **antes** da
implementação (Modo A — análise/proposta) e nenhum item deles foi executado.

## Reescrita da plataforma

| Relatório | Modo | Escopo | Esforço [modelado] |
|---|---|---|---|
| [MODELO-ANIMACAO-DIDATICA](MODELO-ANIMACAO-DIDATICA.md) | A | Contrato de eventos, motor de reprodução, checkpoints, layout e relógio de animação | 9,5–13,5 d |
| [FUNDACAO-APP-RESPONSIVA](FUNDACAO-APP-RESPONSIVA.md) | A | Responsividade em 360 px, rotas indexáveis, prerender, tokens de tema e acessibilidade | 8,5–11,5 d |
| [MIGRACAO-LEGADO-E-FASES](MIGRACAO-LEGADO-E-FASES.md) | A | O que é descartado, em que ordem, e as três camadas que protegem o modelo novo | 18,5–26 d no total combinado |

## Ordem de leitura

`MIGRACAO-LEGADO-E-FASES` traz o sequenciamento combinado das três frentes e é o
ponto de entrada para executar. Os outros dois carregam os contratos que ele
sequencia.

A primeira etapa executável é **M0** em `MIGRACAO-LEGADO-E-FASES`, seção 3:
extrair os textos didáticos para fora de `core/algorithms/algorithms-list.ts`
antes de qualquer exclusão. O projeto não é um repositório git, por decisão
explícita — não há como desfazer.
