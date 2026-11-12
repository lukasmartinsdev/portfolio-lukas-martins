# Portfólio de Lukas Martins Oliveira

Portfólio profissional com projetos web, currículo, um painel demonstrativo de
BI e um assistente com quiz. [Visitar o portfólio](https://portfolio-lukas-martins.vercel.app/).

## Estrutura

- `index.html` apresenta o perfil, a LodgeDev e os projetos selecionados.
- `projeto-bi.html` abre o Radar de Vendas, com dados simulados e filtros de período e categoria.
- `api/assistente.js` recebe perguntas e chama o Google Gemini no servidor.

## Executar e publicar

Para conferir as páginas localmente, execute `python -m http.server 8000`
na raiz e abra `http://localhost:8000`. O quiz e as respostas do guia funcionam
nessa prévia estática.

Para habilitar respostas do Gemini, configure a variável secreta
`GEMINI_API_KEY` na Vercel usando uma chave do Google AI Studio e faça o
deploy. Em projetos com o Vercel AI Gateway ativo, a função também aceita o
OIDC do projeto. O navegador envia a pergunta e até três turnos da conversa
ao endpoint da aplicação. A função mantém a credencial no servidor.
[Chaves do Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key) ·
[Autenticação OIDC na Vercel](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc).
