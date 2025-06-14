const SUPERVISOR_ID = 3; // Ajuste para supervisor logado
let psicologos = [];
let solicitacoes = [];
let conversas = [];
let conversaAtualId = null;

function mostrarSecao(id) {
  document.querySelectorAll(".secao").forEach(secao => secao.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");

  if (id === "solicitacoes") {
    carregarSolicitacoes();
  } else if (id === "conversas") {
    carregarConversas();
  }
}

async function gerarCalendario() {
  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "";
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diasDoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const diasAgendados = [3, 10, 15, 22];
  for (let i = 0; i < primeiroDiaSemana; i++) {
    calendario.appendChild(document.createElement("div"));
  }

  for (let dia = 1; dia <= diasDoMes; dia++) {
    const div = document.createElement("div");
    div.classList.add("dia");
    if (diasAgendados.includes(dia)) div.classList.add("agendado");
    div.textContent = dia;
    calendario.appendChild(div);
  }
}

async function carregarSolicitacoes() {
  try {
    const resSolic = await fetch(`https://apimensagemlogin-production.up.railway.app/solicitacoes/supervisor/${SUPERVISOR_ID}`);
    solicitacoes = await resSolic.json();

    const resPsicos = await fetch(`https://apimensagemlogin-production.up.railway.app/usuarios/tipo/psicologo`);
    psicologos = await resPsicos.json();

    renderizarSolicitacoes();
  } catch (erro) {
    console.error("Erro ao carregar solicitações:", erro);
    document.getElementById("listaSolicitacoes").innerText = "Erro ao carregar solicitações.";
  }
}

function renderizarSolicitacoes() {
  const container = document.getElementById("listaSolicitacoes");
  container.innerHTML = "";

  if (solicitacoes.length === 0) {
    container.innerHTML = "<p>Nenhuma solicitação encontrada.</p>";
    return;
  }

  solicitacoes.forEach(s => {
    const psicologo = psicologos.find(p => p.id === s.psicologoId);
    const nome = psicologo ? psicologo.nome : `Psicólogo ID ${s.psicologoId}`;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${nome}</h3>
      <p>Status: ${s.status}</p>
      <p>Data: ${new Date(s.dataSolicitacao).toLocaleString("pt-BR")}</p>
      ${s.status === "PENDENTE" ? `
        <button onclick="responder(${s.id}, 'aceitar')">Aceitar</button>
        <button onclick="responder(${s.id}, 'recusar')">Recusar</button>
      ` : ""}
      ${s.status === "ACEITA" ? `
        <button onclick="iniciarConversa(${s.psicologoId})">Iniciar Conversa</button>
      ` : ""}
    `;
    container.appendChild(div);
  });
}

async function responder(id, acao) {
  try {
    await fetch(`https://apimensagemlogin-production.up.railway.app/solicitacoes/${id}/${acao}`, { method: "POST" });
    await carregarSolicitacoes();
  } catch {
    alert("Erro ao responder solicitação.");
  }
}

// Carrega conversas reais do backend
async function carregarConversas() {
  if (psicologos.length === 0) {
    // Carrega psicólogos se não tiver
    const resPsicos = await fetch(`https://apimensagemlogin-production.up.railway.app/usuarios/tipo/psicologo`);
    psicologos = await resPsicos.json();
  }

  // Filtra psicólogos com solicitações ACEITAS para montar conversas
  const aceitas = solicitacoes.filter(s => s.status === "ACEITA");

  conversas = [];
  for (const s of aceitas) {
    const mensagens = await fetchMensagensEntre(SUPERVISOR_ID, s.psicologoId);
    conversas.push({ psicologoId: s.psicologoId, mensagens });
  }

  renderListaContatos();

  if (conversas.length > 0) {
    selecionarConversa(conversas[0].psicologoId);
  } else {
    limparChat();
  }
}

async function fetchMensagensEntre(usuario1Id, usuario2Id) {
  try {
    const res = await fetch(`https://apimensagemlogin-production.up.railway.app/mensagens/${usuario1Id}/${usuario2Id}`);
    if (!res.ok) throw new Error("Erro ao buscar mensagens");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderListaContatos() {
  const listaContatos = document.getElementById("listaContatos");
  listaContatos.innerHTML = "";

  conversas.forEach(c => {
    const psicologo = psicologos.find(p => p.id === c.psicologoId);
    const nome = psicologo ? psicologo.nome : `Psicólogo #${c.psicologoId}`;

    const div = document.createElement("div");
    div.className = "contato";
    div.textContent = nome;
    div.onclick = () => selecionarConversa(c.psicologoId);

    if (c.psicologoId === conversaAtualId) {
      div.classList.add("selecionado");
    }

    listaContatos.appendChild(div);
  });
}

function selecionarConversa(psicologoId) {
  conversaAtualId = psicologoId;
  const chatHeader = document.getElementById("chatHeader");
  const chatMensagens = document.getElementById("chatMensagens");
  const inputMensagem = document.getElementById("inputMensagem");
  const btnEnviar = document.getElementById("btnEnviar");

  const psicologo = psicologos.find(p => p.id === psicologoId);
  chatHeader.textContent = psicologo ? psicologo.nome : `Psicólogo #${psicologoId}`;

  const conversa = conversas.find(c => c.psicologoId === psicologoId);
  chatMensagens.innerHTML = "";

  if (!conversa) {
    chatMensagens.innerHTML = "<p>Nenhuma conversa iniciada.</p>";
    inputMensagem.disabled = true;
    btnEnviar.disabled = true;
    return;
  }

  conversa.mensagens.forEach(msg => {
    const div = document.createElement("div");
    div.className = "msg " + (msg.remetenteId === SUPERVISOR_ID ? "supervisor" : "psicologo");
    div.textContent = msg.conteudo;
    chatMensagens.appendChild(div);
  });

  inputMensagem.disabled = false;
  btnEnviar.disabled = false;
  inputMensagem.value = "";
  inputMensagem.focus();
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

document.getElementById("btnEnviar")?.addEventListener("click", enviarMensagem);
document.getElementById("inputMensagem")?.addEventListener("keypress", e => {
  if (e.key === "Enter") enviarMensagem();
});

async function enviarMensagem() {
  const inputMensagem = document.getElementById("inputMensagem");
  const texto = inputMensagem.value.trim();
  if (!texto || conversaAtualId === null) return;

  const novaMsg = {
    remetenteId: SUPERVISOR_ID,
    destinatarioId: conversaAtualId,
    conteudo: texto,
    dataEnvio: new Date().toISOString()
  };

  try {
    // Envia para o backend
    const res = await fetch(`https://apimensagemlogin-production.up.railway.app/mensagens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaMsg)
    });
    if (!res.ok) throw new Error("Falha ao enviar mensagem");

    // Atualiza localmente as mensagens
    const conversa = conversas.find(c => c.psicologoId === conversaAtualId);
    conversa.mensagens.push(novaMsg);

    // Atualiza UI
    selecionarConversa(conversaAtualId);
  } catch (err) {
    alert("Erro ao enviar mensagem.");
    console.error(err);
  }
}

function limparChat() {
  conversaAtualId = null;
  document.getElementById("chatHeader").textContent = "Selecione um contato";
  document.getElementById("chatMensagens").innerHTML = "";
  document.getElementById("inputMensagem").disabled = true;
  document.getElementById("btnEnviar").disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
  gerarCalendario();
  carregarSolicitacoes();
});