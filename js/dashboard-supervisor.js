function mostrarSecao(id) {
  const secoes = document.querySelectorAll('.secao');
  secoes.forEach(secao => secao.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
}

function gerarCalendario() {
  const calendario = document.getElementById('calendario');
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diasDoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const diasAgendados = [3, 10, 15, 22];

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const vazio = document.createElement('div');
    calendario.appendChild(vazio);
  }

  for (let dia = 1; dia <= diasDoMes; dia++) {
    const div = document.createElement('div');
    div.classList.add('dia');
    if (diasAgendados.includes(dia)) {
      div.classList.add('agendado');
    }
    div.textContent = dia;
    calendario.appendChild(div);
  }
}

document.addEventListener("DOMContentLoaded", gerarCalendario);
