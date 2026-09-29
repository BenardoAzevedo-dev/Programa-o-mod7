document.addEventListener('DOMContentLoaded', function() {

  const workContainer = document.querySelector('#work-container');
  const workURL = `http://localhost:3000/work`;
  const workForm = document.querySelector('#work-form');
  let allwork = [];

  // --- TIPAGEM: opções clicáveis (máx. 2) ---
  const TIPOS = [
    'Normal', 'Fogo', 'Água', 'Elétrico', 'Planta', 'Gelo',
    'Lutador', 'Veneno', 'Terra', 'Voador', 'Psíquico', 'Inseto',
    'Pedra', 'Fantasma', 'Dragão', 'Sombrio', 'Aço', 'Fada'
  ];
  const MAX_TIPOS = 2;
  // Cor de cada tipo
  const CORES = {
    normal: '#A8A77A', fogo: '#EE8130', água: '#6390F0', elétrico: '#F7D02C',
    planta: '#7AC74C', gelo: '#96D9D6', lutador: '#C22E28', veneno: '#A33EA1',
    terra: '#E2BF65', voador: '#A98FF3', psíquico: '#F95587', inseto: '#A6B91A',
    pedra: '#B6A136', fantasma: '#735797', dragão: '#6F35FC', sombrio: '#705746',
    aço: '#B7B7CE', fada: '#D685AD'
  };

  function corDoTipo(tipo) {
    return CORES[tipo.toLowerCase()] || '#6c757d';
  }

  // Botão marcado = preenchido com a cor; desmarcado = só o contorno
  function estiloTipo(tipo, ativo) {
    const cor = corDoTipo(tipo);
    return ativo
      ? `background-color:${cor};border-color:${cor};color:#fff;`
      : `background-color:transparent;border-color:${cor};color:${cor};`;
  }
  // Gera os botões de tipo; "selecionados" é um array com os tipos já marcados
  function renderTypeChooser(selecionados = []) {
    return TIPOS.map(tipo => {
      const ativo = selecionados.includes(tipo);
      return `<button type="button" class="btn btn-sm mr-1 mb-1 type-btn ${ativo ? 'btn-primary active' : 'btn-outline-secondary'}" data-type="${tipo}">${tipo}</button>`;
    }).join('');
  }

  // Lê os tipos marcados de um chooser e devolve "Tipo1/Tipo2"
  function getSelectedTypes(chooser) {
    return Array.from(chooser.querySelectorAll('.type-btn.active'))
      .map(btn => btn.dataset.type)
      .join('/');
  }

  // Clique nos botões de tipo (vale para o formulário novo e para o de edição)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;

    const chooser = btn.closest('.type-chooser');
    const ativo = btn.classList.contains('active');

    if (!ativo && chooser.querySelectorAll('.type-btn.active').length >= MAX_TIPOS) {
      return; // já tem 2 marcados
    }
    btn.classList.toggle('active');
    btn.style.cssText = estiloTipo(btn.dataset.type, btn.classList.contains('active'));
  });

  // Preenche o chooser do formulário de criação e a data de hoje como padrão
  const createChooser = workForm.querySelector('#class');
  createChooser.innerHTML = renderTypeChooser();
  return `<button type="button" class="btn btn-sm mr-1 mb-1 type-btn ${ativo ? 'active' : ''}" style="${estiloTipo(tipo, ativo)}" data-type="${tipo}">${tipo}</button>`;
  function hoje() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
  workForm.querySelector('#date').value = hoje();

  // "2026-09-29" -> "29/09/2026"
  function formatDate(iso) {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Um badge por tipo (ex: "Lutador/Fada" -> 2 badges)
    function renderTypeBadges(classe) {
    return (classe || '').split('/').filter(Boolean)
      .map(t => `<span class="badge mr-1 mb-2" style="background-color:${corDoTipo(t)};color:#fff;">${t}</span>`)
      .join('');
  
  }

  function renderProjectCard(work) {
    return `
      <div class="col-sm-6 col-lg-4 mb-4" id="work-${work.id}">
        <div class="card h-100 shadow-sm">
          <img src="${work.coverImage}" class="card-img-top" alt="Foto do paciente" style="height: 160px; object-fit: cover;">
          <div class="card-body">
            <div>${renderTypeBadges(work.class)}</div>
            <h5 class="card-title font-weight-bold text-dark">${work.title}</h5>
            ${work.date ? `<p class="small text-secondary mb-2">📅 Internado em ${formatDate(work.date)}</p>` : ''}
            <p class="card-text text-muted small">${work.description}</p>
          </div>
          <div class="card-footer bg-transparent border-top-0 d-flex justify-content-end gap-2 pb-3">
            <button class="btn btn-sm btn-outline-secondary mr-2" data-id="${work.id}" id="edit-${work.id}" data-action="edit">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-id="${work.id}" id="delete-${work.id}" data-action="delete">Excluir</button>
          </div>
          <div id="edit-work-${work.id}" class="px-3 pb-3"></div>
        </div>
      </div>
    `;
  }

  // --- READ ---
  fetch(`${workURL}`)
    .then(response => response.json())
    .then(workData => {
      allwork = workData;
      workContainer.innerHTML = "";
      workData.forEach(function(work) {
        workContainer.innerHTML += renderProjectCard(work);
      });
    });

  // --- CREATE ---
  workForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const classInput = getSelectedTypes(createChooser);
    const errorMsg = workForm.querySelector('#class-error');

    if (!classInput) {
      errorMsg.classList.remove('d-none');
      return;
    }
    errorMsg.classList.add('d-none');

    const titleInput = workForm.querySelector('#title').value;
    const coverImageInput = workForm.querySelector('#coverImage').value;
    const descInput = workForm.querySelector('#description').value;
    const dateInput = workForm.querySelector('#date').value;

    fetch(`${workURL}`, {
      method: 'POST',
      body: JSON.stringify({
        title: titleInput,
        class: classInput,
        coverImage: coverImageInput,
        description: descInput,
        date: dateInput
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(work => {
      allwork.push(work);
      workContainer.innerHTML += renderProjectCard(work);
      workForm.reset();
      createChooser.innerHTML = renderTypeChooser(); // desmarca os tipos
      workForm.querySelector('#date').value = hoje();
    });
  });

  // --- UPDATE & DELETE ---
  workContainer.addEventListener('click', (e) => {

    if (e.target.dataset.action === 'edit') {
      const projectId = e.target.dataset.id;
      const editButton = document.querySelector(`#edit-${projectId}`);
      editButton.disabled = true;

      const workData = allwork.find(work => work.id == projectId);
      const editFormContainer = workContainer.querySelector(`#edit-work-${projectId}`);
      const tiposAtuais = (workData.class || '').split('/').filter(Boolean);

      editFormContainer.innerHTML = `
        <form id="form-edit-${projectId}" class="border-top pt-3 mt-2">
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-title" value="${workData.title}" placeholder="Nome">
          </div>
          <div class="form-group mb-2">
            <div class="type-chooser" id="edit-class">${renderTypeChooser(tiposAtuais)}</div>
            <small class="text-danger d-none" id="edit-class-error">Escolha pelo menos 1 tipo.</small>
          </div>
          <div class="form-group mb-2">
            <input type="date" required class="form-control form-control-sm" id="edit-date" value="${workData.date || ''}">
          </div>
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-coverImage" value="${workData.coverImage}" placeholder="URL da Imagem">
          </div>
          <div class="form-group mb-2">
            <textarea required class="form-control form-control-sm" id="edit-description" rows="2" placeholder="Estado">${workData.description}</textarea>
          </div>
          <button type="submit" class="btn btn-sm btn-success btn-block">Salvar Alterações</button>
        </form>
      `;

      const currentEditForm = document.querySelector(`#form-edit-${projectId}`);
      currentEditForm.addEventListener("submit", (eventSubmit) => {
        eventSubmit.preventDefault();

        const classInput = getSelectedTypes(currentEditForm.querySelector("#edit-class"));
        const editError = currentEditForm.querySelector("#edit-class-error");

        if (!classInput) {
          editError.classList.remove('d-none');
          return;
        }
        editError.classList.add('d-none');

        const titleInput = currentEditForm.querySelector("#edit-title").value;
        const dateInput = currentEditForm.querySelector("#edit-date").value;
        const coverImageInput = currentEditForm.querySelector("#edit-coverImage").value;
        const descInput = currentEditForm.querySelector("#edit-description").value;

        const oldCardColumn = document.querySelector(`#work-${projectId}`);

        fetch(`${workURL}/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: titleInput,
            class: classInput,
            coverImage: coverImageInput,
            description: descInput,
            date: dateInput
          }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(updatedwork => {
          const index = allwork.findIndex(b => b.id == projectId);
          allwork[index] = updatedwork;
          oldCardColumn.outerHTML = renderProjectCard(updatedwork);
        });
      });

    } else if (e.target.dataset.action === 'delete') {
      const projectId = e.target.dataset.id;
      document.querySelector(`#work-${projectId}`).remove();

      fetch(`${workURL}/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

});