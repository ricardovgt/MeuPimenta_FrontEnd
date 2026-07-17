function configurarFiltros(token, elements) {
    if (elements.formFiltros) {
        elements.formFiltros.addEventListener("submit", (event) => {
            event.preventDefault();
            const bairro = elements.filtroBairro ? elements.filtroBairro.value : "";
            const top = elements.filtroTop ? elements.filtroTop.checked : false;
            carregarServicos(token, elements, bairro, top);
        });
    }

    if (elements.btnLimparFiltros) {
        elements.btnLimparFiltros.addEventListener("click", () => {
            if (elements.filtroBairro) {
                elements.filtroBairro.value = "";
            }

            if (elements.filtroTop) {
                elements.filtroTop.checked = false;
            }

            carregarServicos(token, elements);
        });
    }

    carregarServicos(token, elements);
}

function configurarModais(token, estadoConta, elements) {
    if (elements.btnVoltarHome) {
        elements.btnVoltarHome.addEventListener("click", () => {
            window.location.href = "perfil.html";
        });
    }

    if (elements.btnNovoServico) {
        elements.btnNovoServico.addEventListener("click", () => {
            if (estadoConta.isContaComercial) {
                if (elements.modalServico) {
                    elements.modalServico.classList.remove("hidden");
                }
            } else if (elements.modalAviso) {
                elements.modalAviso.classList.remove("hidden");
            }
        });
    }

    if (elements.btnCancelarAviso) {
        elements.btnCancelarAviso.addEventListener("click", () => {
            if (elements.modalAviso) {
                elements.modalAviso.classList.add("hidden");
            }
        });
    }

    if (elements.btnCancelarServico) {
        elements.btnCancelarServico.addEventListener("click", () => {
            if (elements.modalServico) {
                elements.modalServico.classList.add("hidden");
            }
        });
    }

    if (elements.btnFecharDetalhes) {
        elements.btnFecharDetalhes.addEventListener("click", () => {
            if (elements.modalDetalhesServico) {
                elements.modalDetalhesServico.classList.add("hidden");
            }
        });
    }

    if (elements.btnFecharAvaliacao) {
        elements.btnFecharAvaliacao.addEventListener("click", () => {
            if (elements.modalAvaliacao) {
                elements.modalAvaliacao.classList.add("hidden");
            }
        });
    }

    if (elements.modalDetalhesServico) {
        elements.modalDetalhesServico.addEventListener("click", (event) => {
            if (event.target === elements.modalDetalhesServico) {
                elements.modalDetalhesServico.classList.add("hidden");
            }
        });
    }

    if (elements.modalAvaliacao) {
        elements.modalAvaliacao.addEventListener("click", (event) => {
            if (event.target === elements.modalAvaliacao) {
                elements.modalAvaliacao.classList.add("hidden");
            }
        });
    }

    if (elements.btnMudarConta) {
        elements.btnMudarConta.addEventListener("click", () => {
            if (!elements.feedbackAviso) return;

            mostrarFeedback(elements.feedbackAviso, "Processando...", "error");

            mudarContaParaComercial(token)
                .then(({ status, body }) => {
                    if (status === 200) {
                        estadoConta.isContaComercial = true;
                        mostrarFeedback(elements.feedbackAviso, "Sucesso! Pode cadastrar seu serviço.", "success");

                        setTimeout(() => {
                            if (elements.modalAviso) {
                                elements.modalAviso.classList.add("hidden");
                            }
                            if (elements.modalServico) {
                                elements.modalServico.classList.remove("hidden");
                            }
                            if (elements.feedbackAviso) {
                                elements.feedbackAviso.classList.add("hidden");
                            }
                        }, 1500);
                    } else {
                        mostrarFeedback(elements.feedbackAviso, body.erro || "Erro ao atualizar conta.", "error");
                    }
                })
                .catch(() => {
                    mostrarFeedback(elements.feedbackAviso, "Erro de conexão com o servidor.", "error");
                });
        });
    }
}

function configurarCadastroServico(token, elements) {
    if (!elements.formServico) return;

    elements.formServico.addEventListener("submit", (event) => {
        event.preventDefault();

        const form = elements.formServico;
        const formData = new FormData(form);

        mostrarFeedback(elements.feedbackServico, "Salvando...", "error");

        criarServico(token, elements, formData)
            .then(({ status, body }) => {
                if (status === 201) {
                    mostrarFeedback(elements.feedbackServico, "Serviço publicado com sucesso!", "success");
                    form.reset();
                    carregarServicos(token, elements);

                    setTimeout(() => {
                        if (elements.modalServico) {
                            elements.modalServico.classList.add("hidden");
                        }
                        if (elements.feedbackServico) {
                            elements.feedbackServico.classList.add("hidden");
                        }
                    }, 2000);
                } else {
                    mostrarFeedback(elements.feedbackServico, body.erro || "Falha ao publicar serviço.", "error");
                }
            })
            .catch(() => {
                mostrarFeedback(elements.feedbackServico, "Erro de comunicação com o servidor.", "error");
            });
    });
}