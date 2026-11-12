// Exemplos rotulados para reconhecer perguntas em português, inclusive com erros de digitação.
const exemplos = {
  projetos: [
    "quero ver os projetos que você fez",
    "quais sites o Lukas desenvolveu",
    "tem algum trabalho publicado ou case",
    "mostra o portfólio da LodgeDev",
    "o que é o site das filhas de jó rj",
    "como funciona o projeto da coton sauvage",
    "que sistemas e lojas você já construiu",
    "ver exemplos de trabalhos e sites",
    "quais coisas você criou",
    "projetos e cases",
  ],
  bi: [
    "vocês trabalham com power bi",
    "como funciona o radar de vendas",
    "quero ver um painel de business intelligence",
    "tem um dashboard com gráficos e indicadores",
    "como a loja acompanha receita e metas",
    "você faz análise de dados",
    "tem exemplo de projeto de bi",
    "quero ver os filtros do painel",
    "dashboard",
    "radar de vendas",
  ],
  tecnologias: [
    "qual é a sua stack de programação",
    "que linguagens e tecnologias você usa",
    "você trabalha com react next angular e typescript",
    "o que você usa no backend node python e postgresql",
    "você conhece docker aws java e csharp",
    "quais ferramentas você usa no front end",
    "você programa em javascript css e html",
    "desenvolve em wordpress",
  ],
  design: [
    "como você trabalha com ui ux design",
    "como são feitos os protótipos no figma",
    "faz wireframe e desenha fluxos",
    "como vocês validam a experiência do usuário",
    "você cuida da acessibilidade e da navegação no celular",
    "como você desenha as interfaces",
    "figma",
  ],
  seguranca: [
    "você trabalha com cibersegurança",
    "como protege os dados da aplicação",
    "como faz segurança de sites",
    "você entende de autenticação e controle de acesso",
    "como é a proteção de sistemas e contas",
    "proteção de dados",
  ],
  perfil: [
    "quem é lukas",
    "quem é lukas martins oliveira",
    "o que é a empresa lodgedev",
    "onde vejo seu currículo profissional",
    "qual é a sua experiência",
    "em qual cidade o lukas atua",
    "o que o lukas faz",
  ],
  contato: [
    "qual seu número de whatsapp",
    "como posso falar com o lukas",
    "quero o telefone para entrar em contato",
    "pode me passar seu zap",
    "quero conversar com uma pessoa",
    "me manda o número de celular",
    "como faço para chamar você no whatsapp",
  ],
  quiz: [
    "quero jogar o quiz",
    "tem algum jogo",
    "começar o desafio",
    "vamos jogar de novo",
    "quero testar meus conhecimentos",
    "quero responder perguntas do jogo",
  ],
  saudacao: [
    "oi",
    "olá",
    "boa noite",
    "bom dia",
    "boa tarde",
    "tudo bem",
    "obrigado",
  ],
};

const palavrasComuns = new Set(
  "a as o os de do da dos das e em com um uma uns umas no na nos nas por pra para que se me meu minha tem quero pode faz qual quais como posso seu seus sua suas voce voces ele onde ver vejo trabalha funciona".split(
    " ",
  ),
);

function atributos(texto) {
  const palavras = texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g);
  const valores = new Map();
  for (const palavra of palavras ?? []) {
    if (palavrasComuns.has(palavra)) continue;
    valores.set(`p:${palavra}`, 2);
    const termo = `^${palavra}$`;
    for (let i = 0; i <= termo.length - 3; i++) {
      valores.set(`t:${termo.slice(i, i + 3)}`, 0.65);
    }
  }
  return valores;
}

const amostras = Object.entries(exemplos)
  .flatMap(([assunto, frases]) =>
    frases.map((frase) => ({ assunto, atributos: atributos(frase) })),
  )
  .filter((amostra) => amostra.atributos.size > 0);
const frequencia = new Map();
for (const amostra of amostras) {
  for (const atributo of amostra.atributos.keys()) {
    frequencia.set(atributo, (frequencia.get(atributo) ?? 0) + 1);
  }
}

function vetor(valores) {
  const pesos = new Map();
  let quadrado = 0;
  for (const [atributo, peso] of valores) {
    const ocorrencias = frequencia.get(atributo);
    if (!ocorrencias) {
      quadrado += (peso * 1.5) ** 2;
      continue;
    }
    const valor =
      peso * (1 + Math.log((amostras.length + 1) / (ocorrencias + 1)));
    pesos.set(atributo, valor);
    quadrado += valor ** 2;
  }
  return { pesos, norma: Math.sqrt(quadrado) };
}

for (const amostra of amostras) {
  amostra.vetor = vetor(amostra.atributos);
}

export function classificarLocal(pergunta) {
  const consulta = vetor(atributos(pergunta));
  if (!consulta.norma) return "outros";
  const porAssunto = new Map();
  for (const { assunto, vetor: exemplo } of amostras) {
    let soma = 0;
    for (const [atributo, peso] of consulta.pesos) {
      soma += peso * (exemplo.pesos.get(atributo) ?? 0);
    }
    const similaridade = soma / (consulta.norma * exemplo.norma);
    porAssunto.set(
      assunto,
      Math.max(similaridade, porAssunto.get(assunto) ?? 0),
    );
  }
  const [[assunto, melhor], [, segundo]] = [...porAssunto.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  return melhor >= 0.23 && (melhor >= 0.5 || melhor - segundo >= 0.055)
    ? assunto
    : "outros";
}
