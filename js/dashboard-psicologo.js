function mostrarSecao(id) {
  const secoes = document.querySelectorAll('.secao');
  secoes.forEach(secao => secao.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
}

const supervisores = [
  { nome: "Dra. Maria Silva", area: "Terapia Cognitivo-Comportamental", descricao: "10 anos de experiência com adultos e adolescentes." },
  { nome: "Dr. João Almeida", area: "Psicanálise", descricao: "Especialista em supervisão clínica para iniciantes." },
  { nome: "Dra. Ana Beatriz", area: "Terapia Sistêmica", descricao: "Experiência com famílias e casais." },
  { nome: "Dr. Rafael Costa", area: "Terapia Comportamental", descricao: "Atua na área acadêmica e clínica." }
];

function renderizarSupervisores(lista) {
  const container = document.getElementById("listaSupervisores");
  container.innerHTML = "";
  lista.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${s.nome}</h3>
      <p><strong>Área:</strong> ${s.area}</p>
      <p>${s.descricao}</p>
      <button onclick="solicitar('${s.nome}')">Solicitar Supervisão</button>
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

function solicitar(nome) {
  alert(`Solicitação enviada para ${nome}`);
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarSupervisores(supervisores);
});
