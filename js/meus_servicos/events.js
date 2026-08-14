function tratarErroAutenticacao(body) {
    try {
        alert(body?.erro || body?.mensagem || "Token inválido ou expirado.");
    } catch (e) {
        // ignore
    }
    Connecta.auth.fazerLogout();
}

function abrirCadastro(elements) {
    Connecta.ui.limparFeedback(elements.feedbackServico);
    mostrarModal(elements.modalServico);
}

function fecharCadastro(elements, limparFormulario = false) {
    esconderModal(elements.modalServico);
    if (!limparFormulario) return;
    elements.formServico?.reset();
    elements.formServico?.querySelectorAll("[maxlength]").forEach((campo) => {
        campo.dispatchEvent(new Event("input"));
    });
    limparFotosCadastro(elements.fotosCadastroPreview);
    Connecta.ui.limparFeedback(elements.feedbackServico);
}

function abrirEdicao(token, servico, elements) {
    elements.inputEditarId.value = servico.id || "";
    elements.inputNome.value = servico.nome || "";
    elements.inputTelefone.value = servico.telefone || "";
    elements.inputDescricao.value = servico.descricao || "";
    elements.inputDescricaoDetalhada.value = servico.descricaoDetalhada || "";
    [elements.inputDescricao, elements.inputDescricaoDetalhada].forEach((input) => {
        input?.dispatchEvent(new Event("input"));
    });

    limparFotosEdicao(elements.fotosPreview);
    mostrarModal(elements.modalEditar);

    // A listagem só traz a foto de capa; aqui buscamos o serviço completo pra
    // pré-carregar todas as fotos existentes no preview de edição.
    obterServicoPorId(token, servico.id)
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
        carregarMeusServicos(token)
            .then(({ status, body }) => {
                if (status === 200) {
                    renderizarLista(elements.grid, body, {
                        onEditar: (servico) => abrirEdicao(token, servico, elements),
                        onExcluir: (id) => abrirExclusao(id, elements),
                        onNovo: () => abrirCadastro(elements)
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

function configurarCadastroServico(token, elements) {
    elements.btnNovoServico?.addEventListener("click", () => abrirCadastro(elements));
    elements.btnCancelarServico?.addEventListener("click", () => fecharCadastro(elements, true));
    elements.btnFecharCadastro?.addEventListener("click", () => fecharCadastro(elements, true));

    elements.inputFotosCadastro?.addEventListener("change", () => {
        processarFotosCadastro(
            elements.inputFotosCadastro,
            elements.fotosCadastroPreview,
            elements.feedbackServico
        );
    });

    elements.formServico?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(elements.formServico);
        const submitButton = elements.formServico.querySelector('button[type="submit"]');
        const conteudoOriginal = submitButton?.innerHTML || "Publicar Serviço";
        const dadosServico = {
            nome: formData.get("nome") || "",
            descricao: formData.get("descricao") || "",
            descricaoDetalhada: formData.get("descricaoDetalhada") || "",
            telefone: formData.get("telefone") || "",
            fotos: obterFotosCadastroAtual()
        };

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Publicando...";
        }
        Connecta.ui.mostrarFeedback(elements.feedbackServico, "Salvando...", "error");

        criarServico(token, dadosServico)
            .then(({ status, body }) => {
                if (status === 201) {
                    Connecta.ui.mostrarFeedback(elements.feedbackServico, "Serviço publicado com sucesso!", "success");
                    elements.formServico.reset();
                    elements.formServico.querySelectorAll("[maxlength]").forEach((campo) => {
                        campo.dispatchEvent(new Event("input"));
                    });
                    limparFotosCadastro(elements.fotosCadastroPreview);
                    elements.recarregarLista?.();
                    setTimeout(() => fecharCadastro(elements), 1200);
                    return;
                }
                if (status === 401 || status === 403) {
                    tratarErroAutenticacao(body);
                    return;
                }
                Connecta.ui.mostrarFeedback(elements.feedbackServico, body?.erro || "Falha ao publicar serviço.", "error");
            })
            .catch(() => {
                Connecta.ui.mostrarFeedback(elements.feedbackServico, "Erro de comunicação com o servidor.", "error");
            })
            .finally(() => {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = conteudoOriginal;
                }
            });
    });
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

        atualizarServico(token, dados)
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

        excluirServico(token, id, email)
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

function configurarFechamentoEdicao(elements) {
    elements.btnFecharEdicao?.addEventListener("click", () => esconderModal(elements.modalEditar));
}
