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




  function enviarMensagem() {
    const input = document.getElementById("mensagemInput");
    const texto = input.value.trim();
    if (texto) {
      const div = document.createElement("div");
      div.className = "mensagem enviada";
      div.innerText = texto;
      document.getElementById("mensagens").appendChild(div);
      input.value = "";
    }
  }

  function abrirConversa(nome) {
    const contatos = document.querySelectorAll(".contato");
    contatos.forEach(c => c.classList.remove("ativo"));
    event.target.classList.add("ativo");

    // Aqui você poderia carregar a conversa do contato selecionado (futuramente com banco de dados)
    const mensagens = document.getElementById("mensagens");
    mensagens.innerHTML = `
      <div class="mensagem recebida">Olá, você está falando com ${nome}.</div>
      <div class="mensagem enviada">Olá, tudo bem?</div>
    `;
  }








  async function carregarPerfil() {
    const perfilDiv = document.getElementById('perfilConteudo');

    const usuarioJson = localStorage.getItem('usuarioLogado');
    if (!usuarioJson) {
      perfilDiv.innerHTML = "<p>Usuário não está logado.</p>";
      return;
    }

    const usuario = JSON.parse(usuarioJson);
    const tipo = usuario.tipoUsuario; // 'supervisor' ou 'psicologo'
    const email = usuario.email;

    try {
      const resposta = await fetch(`https://apimensagemlogin-production.up.railway.app/usuarios/tipo/${tipo}`);
      
      if (!resposta.ok) {
        throw new Error("Erro ao buscar usuários do tipo " + tipo);
      }

      const listaUsuarios = await resposta.json();

      // Filtra o usuário logado pelo e-mail
      const dadosUsuario = listaUsuarios.find(u => u.email === email);

      if (!dadosUsuario) {
        perfilDiv.innerHTML = "<p>Usuário não encontrado na base de dados.</p>";
        return;
      }

      perfilDiv.innerHTML = `
        <p><strong>Nome:</strong> ${dadosUsuario.nome}</p>
        <p><strong>Email:</strong> ${dadosUsuario.email}</p>
        <p><strong>CRP:</strong> ${dadosUsuario.crp}</p>
        <p><strong>Tipo de usuário:</strong> ${dadosUsuario.tipoUsuario}</p>
      `;
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
      perfilDiv.innerHTML = "<p>Erro ao carregar as informações do perfil.</p>";
    }
  }

  window.addEventListener('DOMContentLoaded', carregarPerfil);
