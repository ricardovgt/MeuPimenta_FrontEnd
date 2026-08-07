function configurarFiltros(token, elements) {
    if (elements.formFiltros) {
        elements.formFiltros.addEventListener("submit", (event) => {
            event.preventDefault();
            const top = elements.filtroTop ? elements.filtroTop.checked : false;
            const busca = elements.filtroBusca ? elements.filtroBusca.value : "";
            carregarServicos(token, elements, top, busca);
        });
    }

    if (elements.btnLimparFiltros) {
        elements.btnLimparFiltros.addEventListener("click", () => {
            if (elements.filtroTop) {
                elements.filtroTop.checked = false;
            }

            if (elements.filtroBusca) {
                elements.filtroBusca.value = "";
            }

            carregarServicos(token, elements);
        });
    }

    carregarServicos(token, elements);
}

function configurarModais(token, estadoConta, elements) {
    if (elements.btnVoltarHome) {
        elements.btnVoltarHome.addEventListener("click", () => {
            window.location.assign("perfil.html");
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

    if (elements.btnMudarConta) {
        elements.btnMudarConta.addEventListener("click", () => {
            if (!elements.feedbackAviso) return;

            const botaoOriginal = elements.btnMudarConta.textContent;
            elements.btnMudarConta.disabled = true;
            elements.btnMudarConta.textContent = "Atualizando...";
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
                        mostrarFeedback(elements.feedbackAviso, body?.erro || "Erro ao atualizar conta.", "error");
                    }
                })
                .catch(() => {
                    mostrarFeedback(elements.feedbackAviso, "Erro de conexão com o servidor.", "error");
                })
                .finally(() => {
                    elements.btnMudarConta.disabled = false;
                    elements.btnMudarConta.textContent = botaoOriginal;
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
        const submitButton = form.querySelector('button[type="submit"]');
        const labelOriginal = submitButton ? submitButton.textContent : "Publicar Serviço";

        const setSubmitting = (isSubmitting) => {
            if (!submitButton) return;
            submitButton.disabled = isSubmitting;
            submitButton.textContent = isSubmitting ? "Publicando..." : labelOriginal;
        };

        mostrarFeedback(elements.feedbackServico, "Salvando...", "error");
        setSubmitting(true);

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
                    mostrarFeedback(elements.feedbackServico, body?.erro || "Falha ao publicar serviço.", "error");
                }
            })
            .catch(() => {
                mostrarFeedback(elements.feedbackServico, "Erro de comunicação com o servidor.", "error");
            })
            .finally(() => {
                setSubmitting(false);
            });
    });
}