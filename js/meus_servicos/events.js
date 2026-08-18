async function tratarErroAutenticacao(body) {
    const contaBanida = body?.erro === "Sua conta foi banida por violação das regras de conduta."
        || body?.mensagem === "Sua conta foi banida por violação das regras de conduta.";
    try {
        await Connecta.ui.alerta({
            titulo: contaBanida ? "Conta Banida" : "Autenticação Expirada",
            mensagem: body?.erro || body?.mensagem || "Token inválido ou expirado.",
            kicker: "Atenção"
        });
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
    elements.inputEditarTipo.value = servico.tipo || "";
    elements.inputNome.value = servico.nome || "";
    elements.inputTelefone.value = servico.telefone || "";
    elements.inputDescricao.value = servico.descricao || "";
    elements.inputDescricaoDetalhada.value = servico.descricaoDetalhada || "";
    [elements.inputDescricao, elements.inputDescricaoDetalhada].forEach((input) => {
        input?.dispatchEvent(new Event("input"));
    });

    limparFotosEdicao(elements.fotosPreview);
    mostrarModal(elements.modalEditar);
    if (elements.btnSalvarEdicao) {
        elements.btnSalvarEdicao.disabled = true;
        if (!elements.btnSalvarEdicao.dataset.textoOriginal) {
            elements.btnSalvarEdicao.dataset.textoOriginal = elements.btnSalvarEdicao.innerHTML;
        }
        elements.btnSalvarEdicao.textContent = "Carregando fotos...";
    }

    // A listagem só traz a foto de capa; aqui buscamos o anúncio completo para
    // pré-carregar todas as fotos existentes no preview de edição.
    obterServicoPorId(token, servico.id)
        .then(({ status, body }) => {
            if (status === 200 && body) {
                if (body.status === "BANIDO") {
                    esconderModal(elements.modalEditar);
                    Connecta.ui.alerta({
                        titulo: "Anúncio banido",
                        mensagem: "Este anúncio está disponível somente para visualização.",
                        kicker: "Somente leitura"
                    });
                    elements.recarregarLista?.();
                    return;
                }
                elements.inputEditarTipo.value = body.tipo || "";
                elements.inputNome.value = body.nome || "";
                elements.inputTelefone.value = body.telefone || "";
                elements.inputDescricao.value = body.descricao || "";
                elements.inputDescricaoDetalhada.value = body.descricaoDetalhada || "";
                [elements.inputDescricao, elements.inputDescricaoDetalhada].forEach((input) => {
                    input?.dispatchEvent(new Event("input"));
                });
                carregarFotosExistentes(body.fotos, elements.fotosPreview);
                if (elements.btnSalvarEdicao) {
                    elements.btnSalvarEdicao.disabled = false;
                    elements.btnSalvarEdicao.innerHTML = elements.btnSalvarEdicao.dataset.textoOriginal;
                }
                return;
            }
            if (status === 401 || Connecta.auth.respostaContaBanida(status, body)) {
                tratarErroAutenticacao(body);
                return;
            }
            Connecta.ui.alerta({
                titulo: "Edição indisponível",
                mensagem: body?.erro || body?.mensagem || "Não foi possível carregar as fotos atuais do anúncio.",
                kicker: "Erro"
            });
        })
        .catch((err) => console.error("Erro ao buscar fotos do anúncio:", err));
}

function abrirExclusao(id, elements) {
    elements.excluirId.value = id;
    elements.inputEmailConfirm.value = "";
    mostrarModal(elements.modalExcluir);
}

function configurarListaServicos(token, elements) {
    async function alterarStatus(servico, botao) {
        if (!botao || botao.disabled || !["ATIVO", "OCULTO"].includes(servico.status)) return;
        botao.disabled = true;
        const novoStatus = servico.status === "ATIVO" ? "OCULTO" : "ATIVO";
        const acao = novoStatus === "OCULTO" ? "pausar" : "reativar";
        const confirmado = await Connecta.ui.confirmar({
            titulo: novoStatus === "OCULTO" ? "Pausar anúncio" : "Reativar anúncio",
            mensagem: novoStatus === "OCULTO"
                ? "O anúncio deixará de aparecer na busca pública. Deseja continuar?"
                : "O anúncio voltará a aparecer na busca pública. Deseja continuar?",
            textoConfirmar: novoStatus === "OCULTO" ? "Pausar" : "Reativar",
            textoCancelar: "Cancelar",
            kicker: "Visibilidade"
        });
        if (!confirmado) {
            botao.disabled = false;
            return;
        }

        const textoOriginal = botao.textContent;
        botao.textContent = novoStatus === "OCULTO" ? "Pausando..." : "Reativando...";
        try {
            const { status, body } = await atualizarStatusAnuncio(token, servico.id, novoStatus);
            if (status === 200) {
                await Connecta.ui.alerta({
                    titulo: novoStatus === "OCULTO" ? "Anúncio pausado" : "Anúncio reativado",
                    mensagem: body?.mensagem || `Anúncio ${acao === "pausar" ? "pausado" : "reativado"} com sucesso.`,
                    kicker: "Sucesso"
                });
                elements.recarregarLista?.();
                return;
            }
            if (status === 401 || Connecta.auth.respostaContaBanida(status, body)) {
                tratarErroAutenticacao(body);
                return;
            }
            await Connecta.ui.alerta({
                titulo: `Não foi possível ${acao}`,
                mensagem: body?.erro || body?.mensagem || `O anúncio não pôde ser ${acao === "pausar" ? "pausado" : "reativado"}.`,
                kicker: "Aviso"
            });
            elements.recarregarLista?.();
        } catch (erro) {
            console.error(`Erro ao ${acao} anúncio:`, erro);
            await Connecta.ui.alerta({
                titulo: "Erro de conexão",
                mensagem: "Não foi possível se comunicar com o servidor.",
                kicker: "Erro"
            });
        } finally {
            botao.disabled = false;
            botao.textContent = textoOriginal;
        }
    }

    function carregar() {
        carregarMeusServicos(token)
            .then(({ status, body }) => {
                if (status === 200) {
                    renderizarLista(elements.grid, body, {
                        onEditar: (servico) => abrirEdicao(token, servico, elements),
                        onExcluir: (id) => abrirExclusao(id, elements),
                        onAlterarStatus: alterarStatus,
                        onNovo: () => abrirCadastro(elements)
                    });
                    return;
                }

                if (status === 401 || Connecta.auth.respostaContaBanida(status, body)) {
                    tratarErroAutenticacao(body);
                    return;
                }

                Connecta.ui.alerta({
                    titulo: "Erro de Carregamento",
                    mensagem: body?.erro || "Erro ao carregar seus anúncios.",
                    kicker: "Erro"
                });
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
        const conteudoOriginal = submitButton?.innerHTML || "Publicar Anúncio";
        const dadosServico = {
            nome: formData.get("nome") || "",
            descricao: formData.get("descricao") || "",
            descricaoDetalhada: formData.get("descricaoDetalhada") || "",
            telefone: formData.get("telefone") || "",
            tipo: formData.get("tipo") || "",
            fotos: obterFotosCadastroAtual()
        };

        if (dadosServico.tipo !== "SERVICO" && dadosServico.tipo !== "COMERCIO") {
            Connecta.ui.mostrarFeedback(elements.feedbackServico, "Selecione Serviço ou Comércio.", "error");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Publicando...";
        }
        Connecta.ui.mostrarFeedback(elements.feedbackServico, "Salvando...", "error");

        criarServico(token, dadosServico)
            .then(({ status, body }) => {
                if (status === 201) {
                    Connecta.ui.mostrarFeedback(elements.feedbackServico, "Anúncio publicado com sucesso!", "success");
                    elements.formServico.reset();
                    elements.formServico.querySelectorAll("[maxlength]").forEach((campo) => {
                        campo.dispatchEvent(new Event("input"));
                    });
                    limparFotosCadastro(elements.fotosCadastroPreview);
                    elements.recarregarLista?.();
                    setTimeout(() => fecharCadastro(elements), 1200);
                    return;
                }
                if (status === 401 || Connecta.auth.respostaContaBanida(status, body)) {
                    tratarErroAutenticacao(body);
                    return;
                }
                Connecta.ui.mostrarFeedback(elements.feedbackServico, body?.erro || "Falha ao publicar anúncio.", "error");
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
            tipo: elements.inputEditarTipo.value,
            nome: elements.inputNome.value.trim(),
            telefone: elements.inputTelefone.value.trim(),
            descricao: elements.inputDescricao.value || "",
            descricaoDetalhada: elements.inputDescricaoDetalhada.value || "",
            fotos: obterFotosEdicaoAtual()
        };

        if (!dados.nome || !dados.telefone || !["SERVICO", "COMERCIO"].includes(dados.tipo)) {
            Connecta.ui.alerta({
                titulo: "Campos Obrigatórios",
                mensagem: "Tipo, nome e telefone são obrigatórios.",
                kicker: "Atenção"
            });
            return;
        }

        atualizarServico(token, dados)
            .then(async ({ status, body }) => {
                if (status === 200) {
                    await Connecta.ui.alerta({
                        titulo: "Anúncio Atualizado",
                        mensagem: body?.mensagem || "Anúncio atualizado com sucesso.",
                        kicker: "Sucesso"
                    });
                    esconderModal(elements.modalEditar);
                    if (elements.recarregarLista) elements.recarregarLista();
                    return;
                }

                if (status === 401 || Connecta.auth.respostaContaBanida(status, body)) {
                    tratarErroAutenticacao(body);
                    return;
                }

                Connecta.ui.alerta({
                    titulo: "Erro na Edição",
                    mensagem: body?.erro || "Erro ao atualizar anúncio.",
                    kicker: "Erro"
                });
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
            Connecta.ui.alerta({
                titulo: "Confirmação Obrigatória",
                mensagem: "Digite seu e-mail para confirmar a exclusão.",
                kicker: "Atenção"
            });
            return;
        }

        excluirServico(token, id, email)
            .then(async ({ status, body }) => {
                if (status === 200) {
                    await Connecta.ui.alerta({
                        titulo: "Anúncio Excluído",
                        mensagem: body?.mensagem || "Anúncio excluído com sucesso!",
                        kicker: "Sucesso"
                    });
                    esconderModal(elements.modalExcluir);
                    if (elements.recarregarLista) elements.recarregarLista();
                    return;
                }

                if (status === 401 || Connecta.auth.respostaContaBanida(status, body)) {
                    tratarErroAutenticacao(body);
                    return;
                }

                Connecta.ui.alerta({
                    titulo: "Erro na Exclusão",
                    mensagem: body?.erro || "Erro ao excluir anúncio.",
                    kicker: "Erro"
                });
            })
            .catch((err) => console.error(err));
    });
}

function configurarFechamentoEdicao(elements) {
    elements.btnFecharEdicao?.addEventListener("click", () => esconderModal(elements.modalEditar));
}
