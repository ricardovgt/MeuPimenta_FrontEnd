const LIMITE_DESCRICAO = 255;
const LIMITE_DESCRICAO_DETALHADA = 2000;
const LIMITE_ANUNCIOS_POR_USUARIO = 5;
const MENSAGEM_LIMITE_ANUNCIOS = "Cada usuário pode ter no máximo 5 anúncios.";

function validarDescricoesAnuncio(descricao, descricaoDetalhada) {
    if (descricao.length > LIMITE_DESCRICAO) {
        return `A descrição deve ter no máximo ${LIMITE_DESCRICAO} caracteres.`;
    }
    if (descricaoDetalhada.length > LIMITE_DESCRICAO_DETALHADA) {
        return `A descrição detalhada deve ter no máximo ${LIMITE_DESCRICAO_DETALHADA} caracteres.`;
    }
    return null;
}

async function tratarErroAutenticacao(status, body) {
    const contaBanida = Connecta.auth.respostaContaBanida(status, body);
    const sessaoEncerrada = await Connecta.auth.respostaSessaoEncerrada(status, body);
    if (!sessaoEncerrada) return false;
    try {
        await Connecta.ui.alerta({
            titulo: contaBanida ? "Conta Banida" : "Sessão Expirada",
            mensagem: body?.erro || body?.mensagem || "Sua sessão expirou. Entre novamente para continuar.",
            kicker: "Atenção"
        });
    } catch (e) {
        // ignore
    }
    Connecta.auth.fazerLogout();
    return true;
}

function atualizarLimiteAnuncios(elements, lista) {
    const total = Array.isArray(lista) ? lista.length : 0;
    const limiteAtingido = total >= LIMITE_ANUNCIOS_POR_USUARIO;
    elements.totalAnuncios = total;

    elements.btnNovoAnuncio?.classList.toggle("btn-anunciar-anuncio--limite", limiteAtingido);
    if (elements.btnNovoAnuncio) {
        elements.btnNovoAnuncio.setAttribute("aria-describedby", "aviso-limite-anuncios");
        elements.btnNovoAnuncio.setAttribute(
            "aria-label",
            limiteAtingido ? "Limite de anúncios atingido" : "Criar anúncio"
        );
    }

    if (elements.avisoLimiteAnuncios) {
        elements.avisoLimiteAnuncios.textContent = limiteAtingido
            ? `${total} de ${LIMITE_ANUNCIOS_POR_USUARIO} anúncios utilizados. Limite atingido; anúncios banidos também contam.`
            : `${total} de ${LIMITE_ANUNCIOS_POR_USUARIO} anúncios utilizados. Anúncios banidos também contam.`;
        elements.avisoLimiteAnuncios.classList.toggle("aviso-limite-anuncios--atingido", limiteAtingido);
    }
}

function abrirCadastro(elements) {
    if (elements.totalAnuncios >= LIMITE_ANUNCIOS_POR_USUARIO) {
        Connecta.ui.alerta({
            titulo: "Limite de anúncios atingido",
            mensagem: `${MENSAGEM_LIMITE_ANUNCIOS} Anúncios banidos também contam para esse limite.`,
            kicker: "Limite"
        });
        return;
    }
    Connecta.ui.limparFeedback(elements.feedbackAnuncio);
    mostrarModal(elements.modalAnuncio);
}

function fecharCadastro(elements, limparFormulario = false) {
    esconderModal(elements.modalAnuncio);
    if (!limparFormulario) return;
    elements.formAnuncio?.reset();
    elements.formAnuncio?.querySelectorAll("[maxlength]").forEach((campo) => {
        campo.dispatchEvent(new Event("input"));
    });
    limparFotosCadastro(elements.fotosCadastroPreview);
    Connecta.ui.limparFeedback(elements.feedbackAnuncio);
}

function abrirEdicao(token, anuncio, elements) {
    elements.inputEditarId.value = anuncio.id || "";
    elements.inputEditarTipo.value = anuncio.tipo || "";
    elements.inputNome.value = anuncio.nome || "";
    elements.inputTelefone.value = anuncio.telefone || "";
    elements.inputDescricao.value = anuncio.descricao || "";
    elements.inputDescricaoDetalhada.value = anuncio.descricaoDetalhada || "";
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
    obterAnuncioPorId(token, anuncio.id)
        .then(async ({ status, body }) => {
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
            if (await tratarErroAutenticacao(status, body)) return;
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

function configurarListaAnuncios(token, elements) {
    async function alterarStatus(anuncio, botao) {
        if (!botao || botao.disabled || !["ATIVO", "OCULTO"].includes(anuncio.status)) return;
        botao.disabled = true;
        const novoStatus = anuncio.status === "ATIVO" ? "OCULTO" : "ATIVO";
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

        const conteudoOriginal = botao.innerHTML;
        botao.textContent = novoStatus === "OCULTO" ? "Pausando..." : "Reativando...";
        try {
            const { status, body } = await atualizarStatusAnuncio(token, anuncio.id, novoStatus);
            if (status === 200) {
                await Connecta.ui.alerta({
                    titulo: novoStatus === "OCULTO" ? "Anúncio pausado" : "Anúncio reativado",
                    mensagem: body?.mensagem || `Anúncio ${acao === "pausar" ? "pausado" : "reativado"} com sucesso.`,
                    kicker: "Sucesso"
                });
                elements.recarregarLista?.();
                return;
            }
            if (await tratarErroAutenticacao(status, body)) return;
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
            botao.innerHTML = conteudoOriginal;
        }
    }

    function carregar() {
        carregarMeusAnuncios(token)
            .then(async ({ status, body }) => {
                if (status === 200) {
                    atualizarLimiteAnuncios(elements, body);
                    renderizarLista(elements.grid, body, {
                        onEditar: (anuncio) => abrirEdicao(token, anuncio, elements),
                        onExcluir: (id) => abrirExclusao(id, elements),
                        onAlterarStatus: alterarStatus,
                        onNovo: () => abrirCadastro(elements)
                    }, elements.resumo, elements.contagem);
                    if (elements.solicitarNovoAnuncio) {
                        elements.solicitarNovoAnuncio = false;
                        abrirCadastro(elements);
                    }
                    return;
                }

                if (await tratarErroAutenticacao(status, body)) return;

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

function configurarCadastroAnuncio(token, elements) {
    elements.btnNovoAnuncio?.addEventListener("click", () => abrirCadastro(elements));
    elements.btnCancelarAnuncio?.addEventListener("click", () => fecharCadastro(elements, true));
    elements.btnFecharCadastro?.addEventListener("click", () => fecharCadastro(elements, true));

    elements.inputFotosCadastro?.addEventListener("change", () => {
        processarFotosCadastro(
            elements.inputFotosCadastro,
            elements.fotosCadastroPreview,
            elements.feedbackAnuncio
        );
    });

    const fecharRegrasPublicacao = () => esconderModal(elements.modalRegrasPublicacao);
    let publicacaoEmAndamento = false;

    elements.btnVerRegrasPublicacao?.addEventListener("click", () => {
        mostrarModal(elements.modalRegrasPublicacao);
    });
    elements.btnFecharRegrasPublicacao?.addEventListener("click", fecharRegrasPublicacao);
    elements.btnRevisarAnuncio?.addEventListener("click", fecharRegrasPublicacao);
    elements.modalRegrasPublicacao?.addEventListener("click", (event) => {
        if (event.target === elements.modalRegrasPublicacao) fecharRegrasPublicacao();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !elements.modalRegrasPublicacao?.classList.contains("hidden")) {
            fecharRegrasPublicacao();
        }
    });

    function publicarAnuncioPreenchido() {
        if (publicacaoEmAndamento || !elements.formAnuncio?.checkValidity()) {
            fecharRegrasPublicacao();
            elements.formAnuncio?.reportValidity();
            return;
        }

        const formData = new FormData(elements.formAnuncio);
        const submitButton = elements.formAnuncio.querySelector('button[type="submit"]');
        const textoConfirmacaoOriginal = elements.btnConfirmarPublicacao?.textContent || "Concordo e publicar anúncio";
        const conteudoOriginal = submitButton?.innerHTML || "Publicar Anúncio";
        const dadosAnuncio = {
            nome: formData.get("nome") || "",
            descricao: formData.get("descricao") || "",
            descricaoDetalhada: formData.get("descricaoDetalhada") || "",
            telefone: formData.get("telefone") || "",
            tipo: formData.get("tipo") || "",
            fotos: obterFotosCadastroAtual()
        };

        const erroDescricoes = validarDescricoesAnuncio(
            dadosAnuncio.descricao,
            dadosAnuncio.descricaoDetalhada
        );
        if (erroDescricoes) {
            fecharRegrasPublicacao();
            Connecta.ui.mostrarFeedback(elements.feedbackAnuncio, erroDescricoes, "error");
            return;
        }

        if (dadosAnuncio.tipo !== "SERVICO" && dadosAnuncio.tipo !== "COMERCIO") {
            fecharRegrasPublicacao();
            Connecta.ui.mostrarFeedback(elements.feedbackAnuncio, "Selecione Serviço ou Comércio.", "error");
            return;
        }

        publicacaoEmAndamento = true;
        fecharRegrasPublicacao();
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Publicando...";
        }
        if (elements.btnConfirmarPublicacao) {
            elements.btnConfirmarPublicacao.disabled = true;
            elements.btnConfirmarPublicacao.textContent = "Publicando...";
        }
        Connecta.ui.mostrarFeedback(elements.feedbackAnuncio, "Salvando...", "error");

        criarAnuncio(token, dadosAnuncio)
            .then(async ({ status, body }) => {
                if (status === 201) {
                    Connecta.ui.mostrarFeedback(elements.feedbackAnuncio, "Anúncio publicado com sucesso!", "success");
                    elements.formAnuncio.reset();
                    elements.formAnuncio.querySelectorAll("[maxlength]").forEach((campo) => {
                        campo.dispatchEvent(new Event("input"));
                    });
                    limparFotosCadastro(elements.fotosCadastroPreview);
                    elements.recarregarLista?.();
                    setTimeout(() => fecharCadastro(elements), 1200);
                    return;
                }
                if (await tratarErroAutenticacao(status, body)) return;
                const mensagem = body?.erro || body?.mensagem || "Falha ao publicar anúncio.";
                Connecta.ui.mostrarFeedback(
                    elements.feedbackAnuncio,
                    mensagem,
                    "error"
                );
            })
            .catch(() => {
                Connecta.ui.mostrarFeedback(elements.feedbackAnuncio, "Erro de comunicação com o servidor.", "error");
            })
            .finally(() => {
                publicacaoEmAndamento = false;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = conteudoOriginal;
                }
                if (elements.btnConfirmarPublicacao) {
                    elements.btnConfirmarPublicacao.disabled = false;
                    elements.btnConfirmarPublicacao.textContent = textoConfirmacaoOriginal;
                }
            });
    }

    elements.formAnuncio?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!elements.aceiteRegrasAnuncio?.checked) {
            Connecta.ui.mostrarFeedback(
                elements.feedbackAnuncio,
                "Leia e aceite as regras para continuar com a publicação.",
                "error"
            );
            elements.aceiteRegrasAnuncio?.focus();
            return;
        }

        Connecta.ui.limparFeedback(elements.feedbackAnuncio);
        mostrarModal(elements.modalRegrasPublicacao);
    });

    elements.btnConfirmarPublicacao?.addEventListener("click", publicarAnuncioPreenchido);
}

function configurarEdicaoAnuncio(token, elements) {
    elements.btnCancelarEdicao.addEventListener("click", () => esconderModal(elements.modalEditar));

    if (elements.inputFotosEdicao) {
        elements.inputFotosEdicao.addEventListener("change", () => {
            adicionarFotosSelecionadas(elements.inputFotosEdicao, elements.fotosPreview);
        });
    }

    elements.formEditar.addEventListener("submit", (ev) => {
        ev.preventDefault();

        if (!elements.formEditar.reportValidity()) return;

        const dados = {
            id: Number(elements.inputEditarId.value),
            tipo: elements.inputEditarTipo.value,
            nome: elements.inputNome.value.trim(),
            telefone: elements.inputTelefone.value.trim(),
            descricao: elements.inputDescricao.value || "",
            descricaoDetalhada: elements.inputDescricaoDetalhada.value || "",
            fotos: obterFotosEdicaoAtual()
        };

        const erroDescricoes = validarDescricoesAnuncio(dados.descricao, dados.descricaoDetalhada);
        if (erroDescricoes) {
            Connecta.ui.alerta({
                titulo: "Descrição muito longa",
                mensagem: erroDescricoes,
                kicker: "Atenção"
            });
            return;
        }

        if (!dados.nome || !dados.telefone || !["SERVICO", "COMERCIO"].includes(dados.tipo)) {
            Connecta.ui.alerta({
                titulo: "Campos Obrigatórios",
                mensagem: "Tipo, nome e telefone são obrigatórios.",
                kicker: "Atenção"
            });
            return;
        }

        atualizarAnuncio(token, dados)
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

                if (await tratarErroAutenticacao(status, body)) return;

                Connecta.ui.alerta({
                    titulo: "Erro na Edição",
                    mensagem: body?.erro || "Erro ao atualizar anúncio.",
                    kicker: "Erro"
                });
            })
            .catch((err) => console.error(err));
    });
}

function configurarExclusaoAnuncio(token, elements) {
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

        excluirAnuncio(token, id, email)
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

                if (await tratarErroAutenticacao(status, body)) return;

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
