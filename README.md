# Portfólio de Lukas Martins Oliveira

Portfólio profissional com projetos web, currículo, um painel demonstrativo de
BI e um assistente com quiz. [Visitar o portfólio](https://portfolio-lukas-martins.vercel.app/).

## Estrutura

- `index.html` apresenta o perfil, a LodgeDev e os projetos selecionados.
- `projeto-bi.html` abre o Radar de Vendas, com dados simulados e filtros de período e categoria.
- `api/assistente.js` recebe perguntas e usa o Gemini pelo Vercel AI Gateway.

## Executar e publicar

Para conferir as páginas localmente, execute `python -m http.server 8000`
na raiz e abra `http://localhost:8000`. O quiz e as respostas do guia funcionam
nessa prévia estática.

Para habilitar respostas do Gemini, faça o deploy na Vercel com o AI Gateway
disponível no projeto. A função autentica pelo OIDC do projeto. O navegador envia
apenas a pergunta e até três turnos da conversa ao endpoint da aplicação.
[Autenticação OIDC na Vercel](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc).
