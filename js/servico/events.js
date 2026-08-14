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
            window.location.assign("servicos.html");
        });
    }

    if (elements.btnHome) {
        elements.btnHome.addEventListener("click", () => {
            window.location.assign("perfil.html");
        });
    }
}

function configurarAvaliacoes(token, idServico, elements) {
    if (!elements.btnAvaliar) return;

    elements.btnAvaliar.addEventListener("click", () => {
        const painelExistente = document.querySelector(".avaliacao-form-panel");

        if (painelExistente) {
            painelExistente.remove();
            return;
        }

        mostrarModalAvaliacao(token, idServico, elements, {
            aoEnviar: () => {
                elements.carregarAvaliacoesPagina?.(1);
                carregarServicoCompleto(token, idServico, elements);
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
                        text: "Confira este serviço no MeuPimenta",
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

function carregarServicoCompleto(token, idServico, elements) {
    return obterServicoCompleto(token, idServico)
        .then(({ status, body }) => {
            if (status === 200) {
                popularServico(body, elements);
                return;
            }
            Connecta.ui.mostrarFeedback(
                elements.feedback,
                body?.erro || body?.mensagem || "Não foi possível carregar este serviço.",
                "error"
            );
        })
        .catch((erro) => {
            console.error("Erro ao carregar serviço:", erro);
            Connecta.ui.mostrarFeedback(elements.feedback, "Erro de conexão com o servidor.", "error");
        });
}

function configurarListaAvaliacoes(token, idServico, elements) {
    const state = { paginaAtual: 1, totalPaginas: 1, limite: 10, idUsuarioAutenticado: null };

    function carregarPagina(pagina = 1) {
        const paginaRequisitada = Number(pagina);
        listarAvaliacoes(idServico, paginaRequisitada, state.limite)
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
                        carregarServicoCompleto(token, idServico, elements);
                    }
                });
                atualizarBotaoCarregarMais(state.paginaAtual, state.totalPaginas);
            })
            .catch(() => mostrarErroAvaliacoes("Erro de comunicação com o servidor."));
    }

    obterUsuarioAutenticado(token)
        .then(({ status, body }) => {
            state.idUsuarioAutenticado = status === 200
                ? Number(body?.idUsuario ?? body?.id) || obterIdUsuarioDoToken(token)
                : obterIdUsuarioDoToken(token);
        })
        .catch(() => {
            state.idUsuarioAutenticado = obterIdUsuarioDoToken(token);
        })
        .finally(() => carregarPagina(1));

    elements.btnCarregarMais?.addEventListener("click", () => {
        if (state.paginaAtual < state.totalPaginas) carregarPagina(state.paginaAtual + 1);
    });

    elements.carregarAvaliacoesPagina = carregarPagina;
}
