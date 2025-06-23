// Dados simulados
const solicitacoes = [
  {
    id: 1,
    psicologoNome: "João Silva",
    area: "Psicologia Clínica",
    status: "PENDENTE",
    dataSolicitacao: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    psicologoNome: "Maria Santos",
    area: "Psicologia Organizacional",
    status: "PENDENTE",
    dataSolicitacao: "2024-01-14T14:20:00Z",
  },
]

const conversas = [
  {
    id: 1,
    psicologoNome: "Ana Costa",
    ultimaMensagem: "Obrigada pela orientação sobre o caso...",
    timestamp: "2024-01-15T09:30:00Z",
    naoLida: true,
  },
  {
    id: 2,
    psicologoNome: "Pedro Lima",
    ultimaMensagem: "Podemos agendar uma supervisão?",
    timestamp: "2024-01-14T16:45:00Z",
    naoLida: false,
  },
]

const compromissos = [
  {
    id: 1,
    titulo: "Supervisão - Ana Costa",
    data: "2024-01-16",
    hora: "10:00",
    tipo: "supervisao",
  },
  {
    id: 2,
    titulo: "Reunião de Equipe",
    data: "2024-01-17",
    hora: "14:30",
    tipo: "reuniao",
  },
  {
    id: 3,
    titulo: "Supervisão - Pedro Lima",
    data: "2024-01-18",
    hora: "15:00",
    tipo: "supervisao",
  },
]

// Elementos DOM
const navButtons = document.querySelectorAll(".nav-button[data-tab]")
const tabContents = document.querySelectorAll(".tab-content")
const sidebarToggle = document.getElementById("sidebar-toggle")
const sidebar = document.getElementById("sidebar")
const logoutBtn = document.getElementById("logout-btn")

// Navegação entre abas
function switchTab(tabId) {
  navButtons.forEach((btn) => btn.classList.remove("active"))
  tabContents.forEach((content) => content.classList.remove("active"))

  const activeButton = document.querySelector(`[data-tab="${tabId}"]`)
  const activeContent = document.getElementById(`${tabId}-tab`)

  if (activeButton && activeContent) {
    activeButton.classList.add("active")
    activeContent.classList.add("active")

    // Carregar dados específicos da aba
    if (tabId === "agenda") {
      renderAgenda()
    } else if (tabId === "solicitacoes") {
      renderSolicitacoes()
    } else if (tabId === "conversas") {
      renderConversas()
    }
  }
}

// Renderizar agenda
function renderAgenda() {
  renderProximosCompromissos()
  renderCalendar()
  updateSummary()
}

function renderProximosCompromissos() {
  const container = document.getElementById("proximos-compromissos")
  container.innerHTML = ""

  compromissos.slice(0, 3).forEach((compromisso) => {
    const div = document.createElement("div")
    div.className = "compromisso-item"
    div.innerHTML = `
            <div class="compromisso-info">
                <h4>${compromisso.titulo}</h4>
                <p>${formatDate(compromisso.data)} às ${compromisso.hora}</p>
            </div>
            <span class="compromisso-badge ${compromisso.tipo === "supervisao" ? "badge-supervisao" : "badge-reuniao"}">
                ${compromisso.tipo === "supervisao" ? "Supervisão" : "Reunião"}
            </span>
        `
    container.appendChild(div)
  })
}

function updateSummary() {
  document.getElementById("supervisoes-count").textContent = compromissos.filter((c) => c.tipo === "supervisao").length
  document.getElementById("solicitacoes-count").textContent = solicitacoes.filter((s) => s.status === "PENDENTE").length
  document.getElementById("conversas-count").textContent = conversas.filter((c) => c.naoLida).length
}

// Renderizar calendário
const currentDate = new Date()

function renderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid")
  const currentMonthElement = document.getElementById("current-month")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  currentMonthElement.textContent = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  calendarGrid.innerHTML = ""

  // Dias da semana
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  diasSemana.forEach((dia) => {
    const dayHeader = document.createElement("div")
    dayHeader.className = "calendar-day"
    dayHeader.style.fontWeight = "600"
    dayHeader.style.background = "#f1f5f9"
    dayHeader.textContent = dia
    calendarGrid.appendChild(dayHeader)
  })

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"
    dayElement.textContent = date.getDate()

    if (date.getMonth() !== month) {
      dayElement.classList.add("other-month")
    }

    if (date.toDateString() === new Date().toDateString()) {
      dayElement.classList.add("today")
    }

    // Verificar se há compromissos neste dia
    const dateString = date.toISOString().split("T")[0]
    if (compromissos.some((c) => c.data === dateString)) {
      dayElement.classList.add("has-event")
    }

    calendarGrid.appendChild(dayElement)
  }
}

// Renderizar solicitações
function renderSolicitacoes() {
  const container = document.getElementById("solicitacoes-list")
  const emptyState = document.getElementById("solicitacoes-empty-state")

  container.innerHTML = ""

  if (solicitacoes.length === 0) {
    emptyState.style.display = "block"
    return
  }

  emptyState.style.display = "none"

  solicitacoes.forEach((solicitacao) => {
    const card = document.createElement("div")
    card.className = "solicitacao-card"
    card.innerHTML = `
            <div class="solicitacao-header">
                <div class="solicitacao-info">
                    <div class="solicitacao-avatar">
                        ${solicitacao.psicologoNome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                    </div>
                    <div class="solicitacao-details">
                        <h3>${solicitacao.psicologoNome}</h3>
                        <p>${solicitacao.area}</p>
                        <p>Solicitado em ${formatDate(solicitacao.dataSolicitacao)}</p>
                    </div>
                </div>
                <div class="solicitacao-actions">
                    <span class="status-badge status-${solicitacao.status.toLowerCase()}">
                        ${solicitacao.status}
                    </span>
                    ${
                      solicitacao.status === "PENDENTE"
                        ? `
                        <button class="btn-primary" onclick="responderSolicitacao(${solicitacao.id}, 'ACEITA')">
                            Aceitar
                        </button>
                        <button class="btn-outline" onclick="responderSolicitacao(${solicitacao.id}, 'RECUSADA')">
                            Recusar
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `
    container.appendChild(card)
  })
}

// Renderizar conversas
function renderConversas() {
  const emptyState = document.getElementById("conversas-empty-state")
  const chatContainer = document.getElementById("chat-container")
  const contactList = document.getElementById("contact-list")

  if (conversas.length === 0) {
    emptyState.style.display = "block"
    chatContainer.style.display = "none"
    return
  }

  emptyState.style.display = "none"
  chatContainer.style.display = "block"

  contactList.innerHTML = ""

  conversas.forEach((conversa) => {
    const div = document.createElement("div")
    div.className = "contato"
    div.innerHTML = `
            <div class="contato-info">
                <h5>${conversa.psicologoNome}</h5>
                <p>${conversa.ultimaMensagem}</p>
                <span class="timestamp">${formatDate(conversa.timestamp)}</span>
            </div>
            ${conversa.naoLida ? '<div class="unread-indicator"></div>' : ""}
        `
    div.onclick = () => abrirConversa(conversa)
    contactList.appendChild(div)
  })
}

// Funções de interação
function responderSolicitacao(id, novoStatus) {
  const solicitacao = solicitacoes.find((s) => s.id === id)
  if (solicitacao) {
    solicitacao.status = novoStatus
    renderSolicitacoes()
    updateSummary()

    if (novoStatus === "ACEITA") {
      // Adicionar à lista de conversas
      conversas.push({
        id: Date.now(),
        psicologoNome: solicitacao.psicologoNome,
        ultimaMensagem: "Conversa iniciada",
        timestamp: new Date().toISOString(),
        naoLida: false,
      })
    }
  }
}

function abrirConversa(conversa) {
  document.getElementById("chat-header").textContent = conversa.psicologoNome
  document.getElementById("chat-input-area").style.display = "flex"
  document.getElementById("chat-messages").innerHTML = `
        <div style="text-align: center; padding: 20px; color: #64748b;">
            Conversa com ${conversa.psicologoNome}
        </div>
    `

  // Marcar como lida
  conversa.naoLida = false
  renderConversas()
  updateSummary()
}

function enviarMensagem() {
  const input = document.getElementById("inputMensagem")
  const texto = input.value.trim()

  if (texto) {
    const messagesContainer = document.getElementById("chat-messages")
    const messageDiv = document.createElement("div")
    messageDiv.style.cssText =
      "text-align: right; margin: 10px 0; padding: 10px; background: #2563eb; color: white; border-radius: 18px; max-width: 70%; margin-left: auto;"
    messageDiv.textContent = texto
    messagesContainer.appendChild(messageDiv)

    input.value = ""
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}

// Utilitários
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Event Listeners
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabId = button.getAttribute("data-tab")
    switchTab(tabId)

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("open")
    }
  })
})

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open")
})

document.addEventListener("click", (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove("open")
    }
  }
})

logoutBtn.addEventListener("click", () => {
  alert("Logout realizado com sucesso!")
  window.location.href = "index.html"
})

// Navegação do calendário
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1)
  renderCalendar()
})

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1)
  renderCalendar()
})

// Enter para enviar mensagem
document.getElementById("inputMensagem").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    enviarMensagem()
  }
})

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open")
  }
})

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  switchTab("agenda")
})
