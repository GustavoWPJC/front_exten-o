let supervisors = [];

// Elementos DOM
const navButtons = document.querySelectorAll('.nav-button[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');
const searchInput = document.getElementById('search-input');
const supervisorsGrid = document.getElementById('supervisors-grid');
const noResults = document.getElementById('no-results');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logout-btn');

// Navegação entre abas
function switchTab(tabId) {
  navButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));

  const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
  const activeContent = document.getElementById(`${tabId}-tab`);

  if (activeButton && activeContent) {
    activeButton.classList.add('active');
    activeContent.classList.add('active');

    // 👇 Aqui você chama a busca de solicitações
    if (tabId === 'requests') {
      fetchSolicitacoes();
    }

    if (tabId === 'conversations') {
  fetchConversas();
    }
  }
}


// Renderizar supervisores
function renderSupervisors(supervisorsToRender) {
    supervisorsGrid.innerHTML = '';

    if (supervisorsToRender.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    supervisorsToRender.forEach(supervisor => {
        const card = document.createElement('div');
        card.className = 'supervisor-card';
        card.innerHTML = `
            <div class="supervisor-header">
                <h3 class="supervisor-name">${supervisor.name}</h3>
                <span class="supervisor-area">${supervisor.area}</span>
            </div>
            <p class="supervisor-description">${supervisor.description}</p>
            <button class="btn-primary" onclick="requestSupervision(${supervisor.id}, '${supervisor.name}')">
                Solicitar Supervisão
            </button>
        `;
        supervisorsGrid.appendChild(card);
    });
}

// Filtro de busca
function filterSupervisors(searchTerm) {
    const filtered = supervisors.filter(supervisor =>
        supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderSupervisors(filtered);
}

// Buscar supervisores da API
async function fetchSupervisors() {
    const psicologoLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const token = psicologoLogado?.token || "";

    try {
        const response = await fetch('https://apimensagemlogin-production.up.railway.app/usuarios/tipo/supervisor', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`);

        const data = await response.json();
        supervisors = data.map(s => ({
            id: s.id,
            name: s.nome || "Sem nome",
            area: s.area || "Área não informada",
            description: s.descricao || "Descrição não disponível"
        }));

        renderSupervisors(supervisors);
    } catch (error) {
        console.error('Erro ao carregar supervisores:', error);
        supervisorsGrid.innerHTML = '<p class="error">Erro ao carregar supervisores. Verifique o token ou a conexão.</p>';
    }
}

async function fetchSolicitacoes() {
  const psicologo = JSON.parse(localStorage.getItem("usuarioLogado"));
  const token = psicologo?.token || "";
  const psicologoId = psicologo?.id;

  try {
    const response = await fetch(`https://apimensagemlogin-production.up.railway.app/solicitacoes/psicologo/${psicologoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Erro ao buscar solicitações");

    const solicitacoes = await response.json();
    renderSolicitacoes(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    document.getElementById("requests-list").innerHTML = "<p>Erro ao carregar solicitações.</p>";
  }
}

function renderSolicitacoes(lista) {
  const container = document.getElementById("requests-list");
  const emptyState = document.getElementById("requests-empty-state");

  if (!container || !emptyState) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  lista.forEach(solicitacao => {
    const card = document.createElement("div");
    card.className = "supervisor-cardi"; // ou outro estilo que você tiver
    card.innerHTML = `
      <h3>Supervisor ID: ${solicitacao.supervisorId}</h3>
      <p>Status: ${solicitacao.status}</p>
    `;
    container.appendChild(card);
  });
}



let contatoSelecionado = null;

async function fetchConversas() {
  const psicologo = JSON.parse(localStorage.getItem("usuarioLogado"));
  const token = psicologo?.token || "";
  const psicologoId = psicologo?.id;

  try {
    const res = await fetch(`https://apimensagemlogin-production.up.railway.app/solicitacoes/psicologo/${psicologoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const solicitacoes = await res.json();

    const aceitas = solicitacoes.filter(s => s.status === "ACEITA");

    const emptyState = document.getElementById("conversations-empty-state");
    const container = document.getElementById("chat-container");
    const lista = document.getElementById("contact-list");

    if (aceitas.length === 0) {
      container.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    // Mostrar lista
    emptyState.style.display = "none";
    container.style.display = "flex";
    lista.innerHTML = "";

    aceitas.forEach(s => {
      const div = document.createElement("div");
      div.className = "contato";
      div.innerText = s.supervisor?.nome || `Supervisor ${s.supervisor} `;
      div.onclick = () => abrirConversa(s.supervisorId, div.innerText);
      lista.appendChild(div);
    });

    // Abre a primeira conversa automaticamente
    abrirConversa(aceitas[0].supervisorId, aceitas[0].supervisor?.nome);
  } catch (err) {
    console.error("Erro ao carregar conversas:", err);
  }
}

async function abrirConversa(supervisorId, nome) {
  contatoSelecionado = supervisorId;
  document.getElementById("chat-header").innerText = nome;
  document.getElementById("chat-input-area").style.display = "flex";

  const psicologo = JSON.parse(localStorage.getItem("usuarioLogado"));
  const token = psicologo?.token || "";
  const psicologoId = psicologo?.id;

  try {
    const res = await fetch(`https://apimensagemlogin-production.up.railway.app/mensagens/${psicologoId}/${supervisorId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const mensagens = await res.json();
    const box = document.getElementById("chat-messages");
    box.innerHTML = "";

    mensagens.forEach(m => {
      const div = document.createElement("div");
      div.className = "mensagem " + (m.remetenteId === psicologoId ? "enviada" : "recebida");
      div.textContent = m.conteudo;
      box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
  } catch (err) {
    console.error("Erro ao carregar mensagens:", err);
  }
}

async function enviarMensagem() {
  const input = document.getElementById("inputMensagem");
  const texto = input.value.trim();
  if (!texto || !contatoSelecionado) return;

  const psicologo = JSON.parse(localStorage.getItem("usuarioLogado"));
  const token = psicologo?.token || "";
  const psicologoId = psicologo?.id;

  try {
    await fetch(`https://apimensagemlogin-production.up.railway.app/mensagens`, {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        remetenteId: psicologoId,
        destinatarioId: contatoSelecionado,
        conteudo: texto
      })
    });

    input.value = "";
    abrirConversa(contatoSelecionado, document.getElementById("chat-header").innerText);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
}











// Solicitação de supervisão (simulada)
function requestSupervision(supervisorId, supervisorName) {
    alert(`Solicitação enviada para ${supervisorName} (ID ${supervisorId})`);
}



// Event Listeners
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        switchTab(tabId);

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    });
});

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    filterSupervisors(searchTerm);
});

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("usuarioLogado");
    alert('Logout realizado com sucesso!');
    window.location.href = 'index.html'; // ajuste se necessário
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
    }
});



document.addEventListener('DOMContentLoaded', async () => {
    await fetchSupervisors();
    switchTab('search');

    // 👇 Atualiza o nome do psicólogo logado
    const userSpan = document.getElementById('user-welcome');
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (usuario?.nome && userSpan) {
        userSpan.textContent = `Bem-vindo, ${usuario.nome}`;
    }
});
