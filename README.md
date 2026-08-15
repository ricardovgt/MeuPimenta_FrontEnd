# 🚀 Branch: `produção` (Front-end)

Esta é a **branch de desenvolvimento ativo** do front-end do projeto **MeuPimenta / ConnectaRO**. Aqui são centralizadas todas as implementações de interface, integração com a API, novos componentes e correções antes de irem para a versão estável final.

---

## 📌 Propósito desta Branch

Nesta branch são realizadas:
* 🛠️ **Correções de bugs (*Bug Fixes*):** Ajustes de layout, responsividade, máscaras de input e manipulação do DOM.
* 🌐 **Consumo de API & Integrações:** Implementação de requisições (`fetch`), tratamento de respostas/erros do servidor, manipulação de tokens e DTOs recebidos do back-end.
* ✨ **Novas Funcionalidades (*Features*):** Criação de novas telas, modais, filtros dinâmicos e fluxos de interação do usuário.
* 🎨 **UI/UX & Refatorações:** Organização de estilos CSS, melhorias de acessibilidade e otimização do fluxo de scripts JS.

---

## 🔄 Fluxo de Trabalho e Sincronização

Para manter a aplicação estável e alinhada com as APIs do back-end, seguimos a seguinte rotina de *merges*:

1. **Desenvolvimento:** Todas as alterações diárias de interface e consumo de API são testadas e validadas nesta branch.
2. **Merge Semanal:** A cada **semana**, o código acumulado e testado na branch `produção` passa por um *Merge* para a branch principal (`master`).

```text
[Interface & Consumo de API] ──> produção (Branch Atual)
                                       │
                                       ▼ (Merge Semanal)
                                 master / main (Versão Estável)
