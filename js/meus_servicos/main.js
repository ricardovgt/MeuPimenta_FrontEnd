document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("tokenConnectaRO");

    if (!token) {
        window.location.assign("login.html");
        return;
    }

    const elements = {
        grid: document.getElementById("grid-meus-servicos"),
        modalEditar: document.getElementById("modal-editar-servico"),
        formEditar: document.getElementById("form-editar-servico"),
        inputEditarId: document.getElementById("editar-id"),
        inputNome: document.getElementById("editar-nome"),
        inputTelefone: document.getElementById("editar-telefone"),
        inputBairro: document.getElementById("editar-bairro"),
        inputFoto: document.getElementById("editar-fotoUrl"),
        inputDescricao: document.getElementById("editar-descricao"),
        inputDescricaoDetalhada: document.getElementById("editar-descricaoDetalhada"),
        btnCancelarEdicao: document.getElementById("btn-cancelar-edicao"),

        modalExcluir: document.getElementById("modal-excluir-servico"),
        excluirId: document.getElementById("excluir-id"),
        inputEmailConfirm: document.getElementById("input-email-confirmacao"),
        btnCancelarExcluir: document.getElementById("btn-cancelar-excluir"),
        btnConfirmarExcluir: document.getElementById("btn-confirmar-excluir")
    };

    function mostrarModal(modal) {
        modal.classList.remove("hidden");
    }

    function esconderModal(modal) {
        modal.classList.add("hidden");
    }

    function criarCard(servico) {
        const card = document.createElement("div");
        card.className = "card-servico";

        const thumb = document.createElement("img");
        thumb.className = "thumb";
        thumb.src = servico.fotoUrl || "../css/img/placeholder.png";
        thumb.alt = servico.nome || "servico";
        card.appendChild(thumb);

        const info = document.createElement("div");
        info.className = "info";

        const titulo = document.createElement("h3");
        titulo.textContent = servico.nome || "(Sem título)";
        info.appendChild(titulo);

        const linha = document.createElement("p");
        linha.textContent = `${servico.bairro || ""}${servico.bairro && servico.nomeUsuario ? ", " : ""}${servico.nomeUsuario || ""}`;
        info.appendChild(linha);

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar Serviço";
        btnEditar.addEventListener("click", () => abrirEdicao(servico));
        acoes.appendChild(btnEditar);

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => abrirExclusao(servico.id));
        acoes.appendChild(btnExcluir);

        info.appendChild(acoes);
        card.appendChild(info);

        return card;
    }

    function renderizarLista(lista) {
        elements.grid.innerHTML = "";

        if (!Array.isArray(lista) || lista.length === 0) {
            const p = document.createElement("p");
            p.textContent = "Você ainda não possui serviços cadastrados.";
            elements.grid.appendChild(p);
            return;
        }

        lista.forEach((s) => {
            const card = criarCard(s);
            elements.grid.appendChild(card);
        });
    }

    function carregar() {
        meusServicosApi.carregarMeusServicos(token)
            .then(({ status, body }) => {
                if (status === 200) {
                    renderizarLista(body);
                    return;
                }

                if (status === 401 || status === 403) {
                    // token inválido ou expirado — mostra mensagem retornada pela API quando disponível
                    try {
                        alert(body?.erro || body?.mensagem || "Token inválido ou expirado.");
                    } catch (e) {
                        // ignore
                    }
                    sessionStorage.removeItem("tokenConnectaRO");
                    window.location.assign("login.html");
                    return;
                }

                alert(body?.erro || "Erro ao carregar seus serviços.");
            })
            .catch((err) => console.error(err));
    }

    function abrirEdicao(servico) {
        // preencher campos
        elements.inputEditarId.value = servico.id || "";
        elements.inputNome.value = servico.nome || "";
        elements.inputTelefone.value = servico.telefone || "";
        elements.inputBairro.value = servico.bairro || "";
        elements.inputFoto.value = servico.fotoUrl || "";
        elements.inputDescricao.value = servico.descricao || "";
        elements.inputDescricaoDetalhada.value = servico.descricaoDetalhada || "";

        mostrarModal(elements.modalEditar);
    }

    function abrirExclusao(id) {
        elements.excluirId.value = id;
        elements.inputEmailConfirm.value = "";
        mostrarModal(elements.modalExcluir);
    }

    elements.btnCancelarEdicao.addEventListener("click", () => esconderModal(elements.modalEditar));

    elements.formEditar.addEventListener("submit", (ev) => {
        ev.preventDefault();

        const dados = {
            id: Number(elements.inputEditarId.value),
            nome: elements.inputNome.value.trim(),
            telefone: elements.inputTelefone.value.trim(),
            bairro: elements.inputBairro.value.trim(),
            descricao: elements.inputDescricao.value || "",
            fotoUrl: elements.inputFoto.value || "",
            descricaoDetalhada: elements.inputDescricaoDetalhada.value || ""
        };

        // validações básicas
        if (!dados.nome || !dados.telefone || !dados.bairro) {
            alert("Nome, telefone e bairro são obrigatórios.");
            return;
        }

        meusServicosApi.atualizarServico(token, dados)
            .then(({ status, body }) => {
                if (status === 200) {
                    alert(body?.mensagem || "Serviço atualizado com sucesso.");
                    esconderModal(elements.modalEditar);
                    carregar();
                    return;
                }

                if (status === 401 || status === 403) {
                    try {
                        alert(body?.erro || body?.mensagem || "Token inválido ou expirado.");
                    } catch (e) {}
                    sessionStorage.removeItem("tokenConnectaRO");
                    window.location.assign("login.html");
                    return;
                }

                alert(body?.erro || "Erro ao atualizar serviço.");
            })
            .catch((err) => console.error(err));
    });

    elements.btnCancelarExcluir.addEventListener("click", () => esconderModal(elements.modalExcluir));

    elements.btnConfirmarExcluir.addEventListener("click", () => {
        const id = elements.excluirId.value;
        const email = elements.inputEmailConfirm.value.trim();

        if (!email) {
            alert("Digite seu e-mail para confirmar a exclusão.");
            return;
        }

        meusServicosApi.excluirServico(token, id, email)
            .then(({ status, body }) => {
                if (status === 200) {
                    alert(body?.mensagem || "Serviço excluído com sucesso.");
                    esconderModal(elements.modalExcluir);
                    carregar();
                    return;
                }

                if (status === 401 || status === 403) {
                    try {
                        alert(body?.erro || body?.mensagem || "Token inválido ou expirado.");
                    } catch (e) {}
                    sessionStorage.removeItem("tokenConnectaRO");
                    window.location.assign("login.html");
                    return;
                }

                alert(body?.erro || "Erro ao excluir serviço.");
            })
            .catch((err) => console.error(err));
    });

    // inicializa
    carregar();
});
