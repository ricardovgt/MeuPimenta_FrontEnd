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

function configurarModais(estadoConta, elements) {
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

    if (elements.btnIrConfiguracoes) {
        elements.btnIrConfiguracoes.addEventListener("click", () => {
            window.location.assign("perfil.html");
        });
    }
}

function configurarCadastroServico(token, elements) {
    if (!elements.formServico) return;

    if (elements.inputFotos) {
        elements.inputFotos.addEventListener("change", () => {
            processarFotosSelecionadas(elements.inputFotos, elements.fotosPreview, elements.feedbackServico);
        });
    }

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

        const dadosServico = {
            nome: formData.get("nome") || "",
            descricao: formData.get("descricao") || "",
            descricaoDetalhada: formData.get("descricaoDetalhada") || "",
            telefone: formData.get("telefone") || "",
            fotos: fotosSelecionadas
        };

        mostrarFeedback(elements.feedbackServico, "Salvando...", "error");
        setSubmitting(true);

        criarServico(token, elements, dadosServico)
            .then(({ status, body }) => {
                if (status === 201) {
                    mostrarFeedback(elements.feedbackServico, "Serviço publicado com sucesso!", "success");
                    form.reset();
                    limparFotosSelecionadas(elements.fotosPreview);
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
