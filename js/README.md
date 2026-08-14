# Organização dos scripts

As páginas com scripts separados devem carregar os arquivos nesta ordem:

1. `global.js`
2. scripts compartilhados, como `nav-conta.js`
3. `utils.js`, quando a página tiver utilidades próprias
4. `api.js`
5. `ui.js`
6. `events.js`
7. `main.js`

## Responsabilidade de cada camada

- `global.js`: configurações e funções reutilizadas por mais de uma página, como URL-base, autenticação, requisições, feedback, compressão de imagens e contadores.
- `api.js`: endpoints, parâmetros e corpos das requisições. Não manipula DOM, não exibe mensagens e não redireciona.
- `ui.js`: renderização, componentes, modais e estados visuais. Não faz requisições diretamente.
- `events.js`: listeners e coordenação entre API e UI.
- `main.js`: valida a sessão, captura elementos e inicializa a página.
- `utils.js`: somente funções específicas da página que não pertencem às demais camadas.
