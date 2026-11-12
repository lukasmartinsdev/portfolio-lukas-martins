import { classificarLocal } from "./assistente-modelo.mjs";

const painel = document.getElementById("assistente");
const abrir = document.getElementById("abrir-assistente");
const conversa = painel.querySelector(".assistente-conversa");
const formulario = painel.querySelector("form");
const campo = document.getElementById("pergunta-assistente");
const estado = painel.querySelector(".assistente-estado");
const contato = painel.querySelector(".assistente-whatsapp");
const numero = contato.querySelector(".assistente-numero").textContent;

const respostas = {
  projetos: {
    texto:
      "Nos projetos selecionados você encontra o portal das Filhas de Jó RJ, o fluxo de orçamento da Coton Sauvage e o Radar de Vendas.",
    link: ["Conhecer os projetos", "#projetos"],
  },
  bi: {
    texto:
      "O Radar de Vendas é um projeto de BI com dados simulados. Dá para filtrar por período e categoria e acompanhar receita, pedidos e metas.",
    link: ["Abrir o Radar de Vendas", "projeto-bi.html"],
  },
  tecnologias: {
    texto:
      "O Lukas trabalha com React, Next.js, Angular e TypeScript nas interfaces. Também usa Node.js, Python e PostgreSQL em APIs e sistemas, além de Docker e AWS.",
    link: ["Ver currículo e tecnologias", "#atuacao"],
  },
  design: {
    texto:
      "O trabalho de UI/UX passa por desenhar fluxos, esboçar telas e testar a navegação com protótipos no Figma. O case da Coton Sauvage mostra uma decisão de interface na prática.",
    link: ["Ver o case da Coton Sauvage", "#fluxo-coton"],
  },
  seguranca: {
    texto:
      "No portfólio, o Lukas destaca autenticação, controle de acesso e proteção de dados em aplicações web.",
    link: ["Ver cibersegurança no currículo", "#ciberseguranca"],
  },
  perfil: {
    texto:
      "Lukas Martins Oliveira é desenvolvedor full stack, atua no Rio de Janeiro e está à frente da LodgeDev.",
    link: ["Conhecer a LodgeDev", "#empresa"],
  },
  contato: {
    texto: `Você pode falar com o Lukas pelo WhatsApp no número ${numero}.`,
  },
  saudacao: {
    texto:
      "Oi! Posso te mostrar os projetos, explicar o painel de BI ou começar um quiz com você.",
  },
  outros: {
    texto:
      "Consigo ajudar com os projetos, as tecnologias, o painel de BI ou o quiz. Qual desses você quer explorar?",
  },
};

const perguntas = [
  {
    enunciado: "No UI/UX, o que ajuda a testar a navegação antes de programar?",
    opcoes: [
      "Um protótipo clicável",
      "Um backup do banco",
      "Um domínio próprio",
    ],
    certa: 0,
    explicacao:
      "Um protótipo clicável permite testar se as pessoas entendem o fluxo antes da implementação.",
  },
  {
    enunciado:
      "No Radar de Vendas, como você verifica se a meta do mês foi atingida?",
    opcoes: [
      "Conta as categorias",
      "Compara receita e meta",
      "Confere a cor do gráfico",
    ],
    certa: 1,
    explicacao:
      "Comparar a receita realizada com a meta mostra se as vendas chegaram ao valor planejado.",
  },
  {
    enunciado:
      "Onde uma aplicação deve validar permissões para acessar dados protegidos?",
    opcoes: ["No ícone do menu", "Só na interface", "No servidor"],
    certa: 2,
    explicacao:
      "O servidor valida a permissão antes de retornar os dados, mesmo quando a interface esconde o acesso.",
  },
];

let emResposta = false;
let etapa = 0;
let pontos = 0;
let escolhas;
const historico = [];

function rolarConversa() {
  conversa.scrollTop = conversa.scrollHeight;
}

function mensagem(texto, pessoa = false) {
  const balao = document.createElement("p");
  balao.className = pessoa
    ? "assistente-mensagem pessoa"
    : "assistente-mensagem";
  const autor = document.createElement("span");
  autor.className = "visually-hidden";
  autor.textContent = pessoa ? "Você: " : "Assistente: ";
  balao.append(autor, texto);
  conversa.append(balao);
  rolarConversa();
  return balao;
}

function mostrarResposta(assunto, respostaIA) {
  if (assunto === "quiz") {
    escolhas?.remove();
    etapa = 0;
    pontos = 0;
    mostrarPergunta();
    return;
  }
  const { texto, link } = respostas[assunto] ?? respostas.outros;
  const balao = mensagem(respostaIA ?? texto);
  if (respostaIA) balao.dataset.origem = "gemini";
  if (link) {
    const ancora = document.createElement("a");
    const [titulo, destino] = link;
    ancora.textContent = titulo;
    ancora.href =
      destino === "projeto-bi.html"
        ? `${destino}?tema=${document.documentElement.dataset.theme}`
        : destino;
    if (destino.startsWith("#")) {
      ancora.addEventListener("click", () => painel.close());
    }
    balao.append(ancora);
  }
  rolarConversa();
}

function atualizarEstado(texto) {
  estado.hidden = !texto;
  estado.textContent = texto;
}

async function consultarGemini(pergunta) {
  const resposta = await fetch("/api/assistente", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pergunta, historico }),
    signal: AbortSignal.timeout(12000),
  });
  if (!resposta.ok) throw new Error("Gemini indisponível");
  const { assunto, texto, modelo } = await resposta.json();
  if (
    !modelo?.startsWith("google/gemini") ||
    typeof texto !== "string" ||
    !texto
  ) {
    throw new Error("Resposta incompleta");
  }
  historico.push({ pergunta, resposta: texto });
  if (historico.length > 3) historico.shift();
  mostrarResposta(assunto, texto);
}

function mostrarPergunta() {
  const pergunta = perguntas[etapa];
  const numeroQuestao = etapa + 1;
  mensagem(
    `Pergunta ${numeroQuestao} de ${perguntas.length}. ${pergunta.enunciado}`,
  );
  escolhas = document.createElement("div");
  escolhas.className = "assistente-escolhas";
  escolhas.setAttribute("role", "group");
  escolhas.setAttribute("aria-label", `Respostas da pergunta ${numeroQuestao}`);

  for (const [indice, texto] of pergunta.opcoes.entries()) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.addEventListener("click", (evento) => {
      escolhas.remove();
      mensagem(texto, true);
      const acertou = indice === pergunta.certa;
      pontos += Number(acertou);
      mensagem(
        `${acertou ? "Acertou!" : "A resposta certa é “" + pergunta.opcoes[pergunta.certa] + "”."} ${pergunta.explicacao}`,
      );
      etapa += 1;
      if (etapa < perguntas.length) {
        mostrarPergunta();
        if (evento.detail === 0) escolhas.firstElementChild.focus();
      } else {
        mensagem(
          `Você acertou ${pontos} de ${perguntas.length}. Quer tentar de novo? Use o botão Jogar quiz.`,
        );
        if (evento.detail === 0)
          painel.querySelector('[data-assunto="quiz"]').focus();
      }
    });
    escolhas.append(botao);
  }
  conversa.append(escolhas);
  rolarConversa();
}

abrir.addEventListener("click", () => {
  painel.showModal();
  rolarConversa();
});
painel
  .querySelector(".assistente-fechar")
  .addEventListener("click", () => painel.close());
painel.addEventListener("close", () => abrir.focus({ preventScroll: true }));

for (const botao of painel.querySelectorAll("[data-assunto]")) {
  botao.addEventListener("click", () => {
    if (emResposta) return;
    mensagem(botao.textContent.trim(), true);
    mostrarResposta(botao.dataset.assunto);
  });
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const pergunta = campo.value.trim();
  if (!pergunta || emResposta) return;
  campo.value = "";
  emResposta = true;
  formulario.setAttribute("aria-busy", "true");
  mensagem(pergunta, true);
  atualizarEstado("Gemini está preparando a resposta…");
  try {
    await consultarGemini(pergunta);
    atualizarEstado("");
  } catch {
    atualizarEstado(
      "Gemini está indisponível agora. Veja a resposta do guia do portfólio.",
    );
    mostrarResposta(classificarLocal(pergunta));
  } finally {
    emResposta = false;
    formulario.removeAttribute("aria-busy");
  }
});

if (typeof painel.showModal === "function") abrir.hidden = false;
