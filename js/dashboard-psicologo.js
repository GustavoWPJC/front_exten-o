const psicologoId = 1;
let supervisores = [];
let solicitacoes = [];
let conversas = {};
let contatoAtivo = null;

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
  const container = document.getElementById("listaSolicitacoes");
  container.innerHTML = "<p>Carregando solicitações...</p>";

  fetch(`https://apimensagemlogin-production.up.railway.app/solicitacoes/psicologo/${psicologoId}`)
    .then(res => res.json())
    .then(data => {
      solicitacoes = data;
      renderizarSolicitacoes(solicitacoes);
      renderizarListaContatos();

      // Recuperar contato ativo salvo no localStorage
      const salvo = localStorage.getItem('contatoAtivo');
      if (salvo) {
        const idSalvo = parseInt(salvo, 10);
        const supervisor = supervisores.find(s => s.id === idSalvo);
        if (supervisor) {
          abrirConversa(idSalvo, supervisor.nome);
          return;
        }
      }

      // Se não tiver contato ativo salvo, abre a primeira conversa aceita
      const primeiraAceita = solicitacoes.find(s => s.status === "ACEITA");
      if (primeiraAceita) {
        const sup = supervisores.find(s => s.id === primeiraAceita.supervisorId);
        abrirConversa(primeiraAceita.supervisorId, sup ? sup.nome : `Supervisor #${primeiraAceita.supervisorId}`);
      } else {
        // Nenhuma conversa aceita
        contatoAtivo = null;
        document.getElementById("chatHeader").textContent = "";
        document.getElementById("chatInputArea").style.display = "none";
        document.getElementById("chatMensagens").innerHTML = "<p>Selecione uma solicitação aceita para conversar.</p>";
      }
    })
    .catch(() => {
      container.innerHTML = "<p>Erro ao carregar solicitações.</p>";
    });
}

function renderizarSolicitacoes(lista) {
  const container = document.getElementById("listaSolicitacoes");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhuma solicitação encontrada.</p>";
    return;
  }

  lista.forEach(s => {
    const supervisor = supervisores.find(sup => sup.id === s.supervisorId);
    const nomeSupervisor = supervisor ? supervisor.nome : `Supervisor #${s.supervisorId}`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nomeSupervisor}</h3>
      <p><strong>Status:</strong> ${s.status}</p>
      ${s.status === "ACEITA" ? `<button onclick="iniciarConversa(${s.supervisorId}, '${nomeSupervisor}')">Iniciar Conversa</button>` : ""}
    `;
    container.appendChild(card);
  });
}

function iniciarConversa(supervisorId, nomeSupervisor) {
  contatoAtivo = supervisorId;
  mostrarSecao('conversas');
  renderizarListaContatos();
  abrirConversa(supervisorId, nomeSupervisor);
}

function renderizarListaContatos() {
  const listaContatos = document.getElementById("listaContatos");
  listaContatos.innerHTML = "";

  const contatosAtivos = solicitacoes
    .filter(s => s.status === "ACEITA")
    .map(s => {
      const sup = supervisores.find(sup => sup.id === s.supervisorId);
      return { id: s.supervisorId, nome: sup ? sup.nome : `Supervisor #${s.supervisorId}` };
    });

  contatosAtivos.forEach(contato => {
    const div = document.createElement("div");
    div.textContent = contato.nome;
    div.className = "contato";
    div.onclick = () => abrirConversa(contato.id, contato.nome);
    if (contato.id === contatoAtivo) div.classList.add("selecionado");
    listaContatos.appendChild(div);
  });

  // Se não houver contato ativo, abrir o primeiro da lista
  if (contatoAtivo === null && contatosAtivos.length > 0) {
    abrirConversa(contatosAtivos[0].id, contatosAtivos[0].nome);
  }
}

function abrirConversa(supervisorId, nomeSupervisor) {
  contatoAtivo = supervisorId;
  localStorage.setItem('contatoAtivo', supervisorId);

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

  // Marcar contato ativo na lista
  Array.from(document.getElementById("listaContatos").children).forEach(div => {
    div.classList.toggle("selecionado", div.textContent === nomeSupervisor);
  });
}

function renderizarMensagens(supervisorId) {
  const chatMensagens = document.getElementById("chatMensagens");
  chatMensagens.innerHTML = "";

  const msgs = conversas[supervisorId] || [];

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "mensagem " + (m.remetenteId === psicologoId ? "remetente" : "destinatario");
    div.innerHTML = `
      <p>${m.conteudo}</p>
      <small>${new Date(m.dataEnvio).toLocaleString()}</small>
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
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(mensagemSalva => {
      conversas[contatoAtivo] = conversas[contatoAtivo] || [];
      conversas[contatoAtivo].push(mensagemSalva);
      renderizarMensagens(contatoAtivo);
      input.value = "";
    })
    .catch(() => alert("Erro ao enviar mensagem."));
}

// Inicializa o app
document.addEventListener("DOMContentLoaded", () => {
  buscarSupervisores();
  carregarSolicitacoes();
});