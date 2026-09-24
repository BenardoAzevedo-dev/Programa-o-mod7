document.addEventListener('DOMContentLoaded', function() {

  // Seletores atualizados mantendo os IDs originais
  const workContainer = document.querySelector('#work-container');
  const workURL = `http://localhost:3000/work`; // Altere para a rota correta se mudar no json-server (ex: /projects)
  const workForm = document.querySelector('#work-form');
  let allwork = [];

  // Função utilitária para gerar o HTML do Card no padrão Bootstrap 4 (3 colunas responsivas)
  function renderProjectCard(work) {
    return `
      <div class="col-sm-6 col-lg-4 mb-4" id="work-${work.id}">
        <div class="card h-100 shadow-sm">
          <img src="${work.coverImage}" class="card-img-top" alt="Capa do Projeto" style="height: 160px; object-fit: cover;">
          <div class="card-body">
            <span class="badge badge-primary mb-2">${work.class}</span>
            <h5 class="card-title font-weight-bold text-dark">${work.title}</h5>
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

  // --- READ: Buscar e listar os projetos ---
  fetch(`${workURL}`)
    .then(response => response.json())
    .then(workData => {
      allwork = workData;
      workContainer.innerHTML = ""; // Limpa o container
      workData.forEach(function(work) {
        workContainer.innerHTML += renderProjectCard(work);
      });
    });

  // --- CREATE: Adicionar novo projeto ---
  workForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Corrigido de event.preventDefault() para e.preventDefault()

    const titleInput = workForm.querySelector('#title').value;
    const classInput = workForm.querySelector('#class').value;
    const coverImageInput = workForm.querySelector('#coverImage').value;
    const descInput = workForm.querySelector('#description').value;

    fetch(`${workURL}`, {
      method: 'POST',
      body: JSON.stringify({
        title: titleInput,
        class: classInput, // Aqui representa a disciplina/categoria
        coverImage: coverImageInput,
        description: descInput
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(work => {
      allwork.push(work);
      workContainer.innerHTML += renderProjectCard(work);
      workForm.reset(); // Limpa os campos do formulário após o envio
    });
  });

  // --- UPDATE & DELETE: Delegação de eventos no container ---
  workContainer.addEventListener('click', (e) => {
    
    // Ação: Editar
    if (e.target.dataset.action === 'edit') {
      const projectId = e.target.dataset.id;
      const editButton = document.querySelector(`#edit-${projectId}`);
      editButton.disabled = true;

      const workData = allwork.find(work => work.id == projectId);
      const editFormContainer = workContainer.querySelector(`#edit-work-${projectId}`);
      
      // Injeta o formulário de edição estilizado com Bootstrap dentro do próprio card
      editFormContainer.innerHTML = `
        <form id="form-edit-${projectId}" class="border-top pt-3 mt-2">
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-title" value="${workData.title}" placeholder="Título">
          </div>
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-class" value="${workData.class}" placeholder="Disciplina">
          </div>
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-coverImage" value="${workData.coverImage}" placeholder="URL da Imagem">
          </div>
          <div class="form-group mb-2">
            <textarea required class="form-control form-control-sm" id="edit-description" rows="2" placeholder="Descrição">${workData.description}</textarea>
          </div>
          <button type="submit" class="btn btn-sm btn-success btn-block">Salvar Alterações</button>
        </form>
      `;

      // Evento de submit do formulário de edição criado dinamicamente
      const currentEditForm = document.querySelector(`#form-edit-${projectId}`);
      currentEditForm.addEventListener("submit", (eventSubmit) => {
        eventSubmit.preventDefault();

        const titleInput = currentEditForm.querySelector("#edit-title").value;
        const classInput = currentEditForm.querySelector("#edit-class").value;
        const coverImageInput = currentEditForm.querySelector("#edit-coverImage").value;
        const descInput = currentEditForm.querySelector("#edit-description").value;
        
        // Elemento da coluna inteira que será substituído
        const oldCardColumn = document.querySelector(`#work-${projectId}`);

        fetch(`${workURL}/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: titleInput,
            class: classInput,
            coverImage: coverImageInput,
            description: descInput
          }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(updatedwork => {
          // Atualiza o objeto no array local de controle
          const index = allwork.findIndex(b => b.id == projectId);
          allwork[index] = updatedwork;

          // Substitui a coluna inteira antiga pelo novo template atualizado estruturalmente
          oldCardColumn.outerHTML = renderProjectCard(updatedwork);
        });
      });

    // Ação: Excluir
    } else if (e.target.dataset.action === 'delete') {
      const projectId = e.target.dataset.id;
      
      // Remove visualmente a coluna que envelopa o card correspondente
      document.querySelector(`#work-${projectId}`).remove();
      
      fetch(`${workURL}/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

});