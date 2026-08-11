function tratarErroAutenticacao(body) {
    try {
        alert(body?.erro || body?.mensagem || "Token inválido ou expirado.");
    } catch (e) {
        // ignore
    }
    sessionStorage.removeItem("tokenConnectaRO");
    window.location.assign("login.html");
}

function abrirEdicao(token, servico, elements) {
    elements.inputEditarId.value = servico.id || "";
    elements.inputNome.value = servico.nome || "";
    elements.inputTelefone.value = servico.telefone || "";
    elements.inputDescricao.value = servico.descricao || "";
    elements.inputDescricaoDetalhada.value = servico.descricaoDetalhada || "";

    limparFotosEdicao(elements.fotosPreview);
    mostrarModal(elements.modalEditar);

    // A listagem só traz a foto de capa; aqui buscamos o serviço completo pra
    // pré-carregar todas as fotos existentes no preview de edição.
    meusServicosApi.obterServicoPorId(token, servico.id)
        .then(({ status, body }) => {
            if (status === 200 && body) {
                carregarFotosExistentes(body.fotos, elements.fotosPreview);
            }
        })
        .catch((err) => console.error("Erro ao buscar fotos do serviço:", err));
}

function abrirExclusao(id, elements) {
    elements.excluirId.value = id;
    elements.inputEmailConfirm.value = "";
    mostrarModal(elements.modalExcluir);
}

function configurarListaServicos(token, elements) {
    function carregar() {
        meusServicosApi.carregarMeusServicos(token)
            .then(({ status, body }) => {
                if (status === 200) {
                    renderizarLista(elements.grid, body, {
                        onEditar: (servico) => abrirEdicao(token, servico, elements),
                        onExcluir: (id) => abrirExclusao(id, elements)
                    });
                    return;
                }

                if (status === 401 || status === 403) {
                    tratarErroAutenticacao(body);
                    return;
                }

                alert(body?.erro || "Erro ao carregar seus serviços.");
            })
            .catch((err) => console.error(err));
    }

    elements.recarregarLista = carregar;
    carregar();
}

function configurarEdicaoServico(token, elements) {
    elements.btnCancelarEdicao.addEventListener("click", () => esconderModal(elements.modalEditar));

    if (elements.inputFotosEdicao) {
        elements.inputFotosEdicao.addEventListener("change", () => {
            adicionarFotosSelecionadas(elements.inputFotosEdicao, elements.fotosPreview);
        });
    }

    elements.formEditar.addEventListener("submit", (ev) => {
        ev.preventDefault();

        const dados = {
            id: Number(elements.inputEditarId.value),
            nome: elements.inputNome.value.trim(),
            telefone: elements.inputTelefone.value.trim(),
            descricao: elements.inputDescricao.value || "",
            descricaoDetalhada: elements.inputDescricaoDetalhada.value || "",
            fotos: obterFotosEdicaoAtual()
        };

        if (!dados.nome || !dados.telefone) {
            alert("Nome e telefone são obrigatórios.");
            return;
        }

        meusServicosApi.atualizarServico(token, dados)
            .then(({ status, body }) => {
                if (status === 200) {
                    alert(body?.mensagem || "Serviço atualizado com sucesso.");
                    esconderModal(elements.modalEditar);
                    if (elements.recarregarLista) elements.recarregarLista();
                    return;
                }

                if (status === 401 || status === 403) {
                    tratarErroAutenticacao(body);
                    return;
                }

                alert(body?.erro || "Erro ao atualizar serviço.");
            })
            .catch((err) => console.error(err));
    });
}

function configurarExclusaoServico(token, elements) {
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
                    if (elements.recarregarLista) elements.recarregarLista();
                    return;
                }

                if (status === 401 || status === 403) {
                    tratarErroAutenticacao(body);
                    return;
                }

                alert(body?.erro || "Erro ao excluir serviço.");
            })
            .catch((err) => console.error(err));
    });
}