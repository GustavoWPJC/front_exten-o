const psicologoLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
const psicologoId = psicologoLogado?.id || 1;

let supervisores = [];
let solicitacoes = [];
let conversas = {};
let contatoAtivo = null;

document.addEventListener("DOMContentLoaded", () => {
  buscarSupervisores();
  carregarSolicitacoes();

  document.getElementById("btnEnviar").addEventListener("click", enviarMensagem);
  document.getElementById("inputMensagem").addEventListener("keypress", e => {
    if (e.key === "Enter") enviarMensagem();
  });
});

function mostrarSecao(id) {
  document.querySelectorAll('.secao').forEach(secao => secao.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
  document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('ativo'));
  document.getElementById(`menu-${id}`).classList.add('ativo');

  if (id === 'solicitacoes') carregarSolicitacoes();
  if (id === 'conversas') renderizarListaContatos();
}

function buscarSupervisores() {
  fetch("https://apimensagemlogin-production.up.railway.app/usuarios/tipo/supervisor")
    .then(res => res.json())
    .then(data => {
      supervisores = data;
      renderizarSupervisores(supervisores);
    })
    .catch(() => {
      document.getElementById("listaSupervisores").innerHTML = "<p>Erro ao carregar supervisores.</p>";
    });
}

function renderizarSupervisores(lista) {
  const container = document.getElementById("listaSupervisores");
  container.innerHTML = lista.length === 0
    ? "<p>Nenhum supervisor encontrado.</p>"
    : "";

  lista.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${s.nome}</h3>
      <p><strong>Área:</strong> ${s.area}</p>
      <p>${s.descricao}</p>
      <button onclick="solicitar(${s.id}, '${s.nome}')">Solicitar Supervisão</button>
    `;
    container.appendChild(card);
  });
}

function filtrarSupervisores() {
  const termo = document.getElementById("filtroSupervisor").value.toLowerCase();
  const filtrados = supervisores.filter(s =>
    s.nome.toLowerCase().includes(termo) || s.area.toLowerCase().includes(termo)
  );
  renderizarSupervisores(filtrados);
}

function solicitar(supervisorId, nomeSupervisor) {
  fetch("https://apimensagemlogin-production.up.railway.app/solicitacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ psicologoId, supervisorId, status: "PENDENTE" })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      alert(`Solicitação enviada para ${nomeSupervisor}`);
      carregarSolicitacoes();
    })
    .catch(() => alert("Erro ao enviar solicitação."));
}

function carregarSolicitacoes() {
  fetch(`https://apimensagemlogin-production.up.railway.app/solicitacoes/psicologo/${psicologoId}`)
    .then(res => res.json())
    .then(data => {
      solicitacoes = data;
      renderizarSolicitacoes();
      renderizarListaContatos();

      const salvo = localStorage.getItem("contatoAtivo");
      if (salvo) {
        const supervisorId = parseInt(salvo);
        const supervisor = supervisores.find(s => s.id === supervisorId);
        if (supervisor) {
          abrirConversa(supervisorId, supervisor.nome);
        }
      } else {
        const aceita = solicitacoes.find(s => s.status === "ACEITA");
        if (aceita) {
          const supervisor = supervisores.find(s => s.id === aceita.supervisorId);
          abrirConversa(aceita.supervisorId, supervisor?.nome || `Supervisor #${aceita.supervisorId}`);
        } else {
          limparChat();
        }
      }
    })
    .catch(() => {
      document.getElementById("listaSolicitacoes").innerHTML = "<p>Erro ao carregar solicitações.</p>";
    });
}

function renderizarSolicitacoes() {
  const container = document.getElementById("listaSolicitacoes");
  container.innerHTML = "";

  if (solicitacoes.length === 0) {
    container.innerHTML = "<p>Nenhuma solicitação encontrada.</p>";
    return;
  }

  solicitacoes.forEach(s => {
    const supervisor = supervisores.find(sup => sup.id === s.supervisorId);
    const nome = supervisor ? supervisor.nome : `Supervisor #${s.supervisorId}`;
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${nome}</h3>
      <p>Status: ${s.status}</p>
      ${s.status === "ACEITA" ? `<button onclick="iniciarConversa(${s.supervisorId}, '${nome}')">Iniciar Conversa</button>` : ""}
    `;
    container.appendChild(div);
  });
}

function iniciarConversa(supervisorId, nomeSupervisor) {
  contatoAtivo = supervisorId;
  mostrarSecao("conversas");
  renderizarListaContatos();
  abrirConversa(supervisorId, nomeSupervisor);
}

function renderizarListaContatos() {
  const listaContatos = document.getElementById("listaContatos");
  listaContatos.innerHTML = "";

  const contatos = solicitacoes
    .filter(s => s.status === "ACEITA")
    .map(s => {
      const sup = supervisores.find(p => p.id === s.supervisorId);
      return { id: s.supervisorId, nome: sup?.nome || `Supervisor #${s.supervisorId}` };
    });

  contatos.forEach(contato => {
    const div = document.createElement("div");
    div.className = "contato";
    div.textContent = contato.nome;
    div.onclick = () => abrirConversa(contato.id, contato.nome);
    if (contato.id === contatoAtivo) div.classList.add("selecionado");
    listaContatos.appendChild(div);
  });
}

function abrirConversa(supervisorId, nomeSupervisor) {
  contatoAtivo = supervisorId;
  localStorage.setItem("contatoAtivo", supervisorId);

  document.getElementById("chatHeader").textContent = `Conversa com ${nomeSupervisor}`;
  document.getElementById("chatInputArea").style.display = "flex";

  fetch(`https://apimensagemlogin-production.up.railway.app/mensagens/${psicologoId}/${supervisorId}`)
    .then(res => res.json())
    .then(mensagens => {
      conversas[supervisorId] = mensagens;
      renderizarMensagens(supervisorId);
    })
    .catch(() => {
      conversas[supervisorId] = [];
      renderizarMensagens(supervisorId);
    });
}

function renderizarMensagens(supervisorId) {
  const chatMensagens = document.getElementById("chatMensagens");
  chatMensagens.innerHTML = "";

  const mensagens = conversas[supervisorId] || [];
  mensagens.forEach(msg => {
    const div = document.createElement("div");
    div.className = "mensagem " + (msg.remetenteId === psicologoId ? "remetente" : "destinatario");
    div.innerHTML = `
      <p>${msg.conteudo}</p>
      <small>${new Date(msg.dataEnvio).toLocaleString()}</small>
    `;
    chatMensagens.appendChild(div);
  });

  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function enviarMensagem() {
  const input = document.getElementById("inputMensagem");
  const texto = input.value.trim();
  if (!texto || contatoAtivo === null) return;

  const novaMensagem = {
    remetenteId: psicologoId,
    destinatarioId: contatoAtivo,
    conteudo: texto
  };

  fetch("https://apimensagemlogin-production.up.railway.app/mensagens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novaMensagem)
  })
    .then(res => res.json())
    .then(mensagemSalva => {
      conversas[contatoAtivo] = conversas[contatoAtivo] || [];
      conversas[contatoAtivo].push(mensagemSalva);
      renderizarMensagens(contatoAtivo);
      input.value = "";
    })
    .catch(() => alert("Erro ao enviar mensagem."));
}

function limparChat() {
  contatoAtivo = null;
  localStorage.removeItem("contatoAtivo");
  document.getElementById("chatHeader").textContent = "";
  document.getElementById("chatMensagens").innerHTML = "<p>Selecione um contato para iniciar a conversa.</p>";
  document.getElementById("chatInputArea").style.display = "none";
}
