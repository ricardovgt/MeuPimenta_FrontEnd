function configurarGaleriaFotos(elements) {
    if (elements.btnFotoAnterior) {
        elements.btnFotoAnterior.addEventListener("click", () => mostrarFotoAnterior(elements));
    }

    if (elements.btnFotoProxima) {
        elements.btnFotoProxima.addEventListener("click", () => mostrarFotoProxima(elements));
    }
}

function configurarNavegacao(elements) {
    if (elements.btnVoltar) {
        elements.btnVoltar.addEventListener("click", () => {
            window.location.assign("anuncios.html");
        });
    }

    if (elements.btnHome) {
        elements.btnHome.addEventListener("click", () => {
            window.location.assign("perfil.html");
        });
    }

    elements.btnTentarNovamente?.addEventListener("click", () => {
        window.location.reload();
    });
}

function configurarAvaliacoes(token, idAnuncio, elements) {
    if (!elements.btnAvaliar) return;

    elements.btnAvaliar.addEventListener("click", () => {
        if (!token) {
            window.location.assign("login.html");
            return;
        }
        const painelExistente = document.querySelector(".avaliacao-form-panel");

        if (painelExistente) {
            painelExistente.remove();
            return;
        }

        mostrarModalAvaliacao(token, idAnuncio, elements, {
            aoEnviar: () => {
                elements.carregarAvaliacoesPagina?.(1);
                carregarAnuncioCompleto(token, idAnuncio, elements);
            }
        });
    });

    if (elements.btnCompartilhar) {
        elements.btnCompartilhar.addEventListener("click", async () => {
            const url = window.location.href;
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: document.title,
                        text: "Confira este anúncio no MeuPimenta",
                        url
                    });
                    return;
                }

                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(url);
                    Connecta.ui.mostrarFeedback(elements.feedback, "Link copiado para a área de transferência.", "success");
                    return;
                }

                throw new Error("Compartilhamento indisponível");
            } catch {
                Connecta.ui.mostrarFeedback(elements.feedback, "Não foi possível compartilhar o link automaticamente.", "error");
            }
        });
    }
}

function configurarDenuncia(token, idAnuncio, elements) {
    if (!elements.btnDenunciar) return;

    elements.btnDenunciar.addEventListener("click", async () => {
        if (!token) {
            window.location.assign("login.html");
            return;
        }
        if (elements.btnDenunciar.disabled) return;

        const confirmado = await Connecta.ui.confirmar({
            titulo: "Denunciar Anúncio",
            mensagem: "Essa ação registrará uma denúncia para este anúncio. Confirme se deseja continuar.",
            textoConfirmacao: "Denunciar",
            textoConfirmar: "Enviar denúncia",
            textoCancelar: "Cancelar",
            kicker: "Confirmação Obrigatória"
        });
        if (!confirmado) return;

        elements.btnDenunciar.disabled = true;
        const htmlOriginal = elements.btnDenunciar.innerHTML;
        elements.btnDenunciar.textContent = "Enviando denúncia...";
        Connecta.ui.limparFeedback(elements.feedback);

        try {
            const { status, body } = await denunciarAnuncio(token, idAnuncio);
            if (status === 200) {
                Connecta.ui.mostrarFeedback(
                    elements.feedback,
                    body?.mensagem || "Denúncia registrada com sucesso.",
                    "success"
                );
                return;
            }
            Connecta.ui.mostrarFeedback(
                elements.feedback,
                body?.erro || body?.mensagem || "Não foi possível registrar a denúncia.",
                "error"
            );
        } catch (erro) {
            console.error("Erro ao denunciar anúncio:", erro);
            Connecta.ui.mostrarFeedback(elements.feedback, "Erro de conexão com o servidor.", "error");
        } finally {
            elements.btnDenunciar.disabled = false;
            elements.btnDenunciar.innerHTML = htmlOriginal;
        }
    });
}

function carregarAnuncioCompleto(token, idAnuncio, elements) {
    return obterAnuncioCompleto(token, idAnuncio)
        .then(({ status, body }) => {
            if (status === 200) {
                return popularAnuncio(body, elements);
            }
            mostrarAnuncioIndisponivel(elements);
            return false;
        })
        .catch((erro) => {
            console.error("Erro ao carregar anúncio:", erro);
            mostrarAnuncioIndisponivel(elements);
            return false;
        });
}

function configurarListaAvaliacoes(token, idAnuncio, elements, usuarioAutenticado) {
    const state = {
        paginaAtual: 1,
        totalPaginas: 1,
        limite: 10,
        idUsuarioAutenticado: Number(usuarioAutenticado?.idUsuario ?? usuarioAutenticado?.id) || null
    };

    function carregarPagina(pagina = 1) {
        const paginaRequisitada = Number(pagina);
        listarAvaliacoes(idAnuncio, paginaRequisitada, state.limite)
            .then(({ status, body }) => {
                if (status !== 200) {
                    mostrarErroAvaliacoes(body?.erro || body?.mensagem || "Não foi possível carregar avaliações.");
                    return;
                }

                state.paginaAtual = Number(body?.paginaAtual || paginaRequisitada);
                state.totalPaginas = Number(body?.totalPaginas || 1);
                if (paginaRequisitada === 1) limparAvaliacoes();

                appendAvaliacoes(body?.avaliacoes || [], {
                    token,
                    idUsuarioAutenticado: state.idUsuarioAutenticado,
                    aoExcluir: () => {
                        carregarPagina(1);
                        carregarAnuncioCompleto(token, idAnuncio, elements);
                    }
                });
                atualizarBotaoCarregarMais(state.paginaAtual, state.totalPaginas);
            })
            .catch(() => mostrarErroAvaliacoes("Erro de comunicação com o servidor."));
    }

    if (!state.idUsuarioAutenticado) {
        state.idUsuarioAutenticado = obterIdUsuarioDoToken(token);
    }
    carregarPagina(1);

    elements.btnCarregarMais?.addEventListener("click", () => {
        if (state.paginaAtual < state.totalPaginas) carregarPagina(state.paginaAtual + 1);
    });

    elements.carregarAvaliacoesPagina = carregarPagina;
}
