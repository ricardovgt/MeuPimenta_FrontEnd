function limparFeedback(elemento) {
    if (!elemento) return;

    elemento.className = "feedback-msg";
    elemento.classList.add("hidden");
    elemento.textContent = "";
}

function mostrarFeedback(elemento, mensagem, tipo = "error") {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.classList.remove("hidden");
    elemento.className = "feedback-msg";

    if (tipo === "success") {
        elemento.classList.add("success");
    } else if (tipo === "error") {
        elemento.classList.add("error");
    }
}

function criarCardServico(servico, token, elements) {
    const card = document.createElement("div");
    card.className = "servico-card clickable";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const imgSource = servico.fotoUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    card.innerHTML = `
        <img src="${imgSource}" alt="${servico.nome}" class="servico-foto" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
        <div class="servico-info">
            <h4>${servico.nome}</h4>
            <p>${servico.descricao || "Sem descrição disponível."}</p>
            <div class="servico-meta">
                <span class="badge-link">Clique para ver mais</span>
            </div>
        </div>
    `;

    card.addEventListener("click", () => {
        if (servico.id) {
            carregarServico(token, elements, servico.id);
        }
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            card.click();
        }
    });

    return card;
}

function mostrarDetalhesServico(token, elements, servico) {
    if (!elements.modalDetalhesServico || !elements.conteudoDetalhesServico) return;

    limparFeedback(elements.feedbackDetalhesServico);

    const imgSource = servico.fotoUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    const avaliacaoMedia = Number(servico.avaliacaoMedia || 0);
    const totalAvaliacoes = Number(servico.totalAvaliacoes || 0);
    const textoAvaliacao = `${avaliacaoMedia.toFixed(1)} · ${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`;

    elements.conteudoDetalhesServico.innerHTML = `
        <div class="servico-detalhe-card">
            <div class="servico-detalhe-image">
                <img src="${imgSource}" alt="${servico.nome}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
            </div>
            <div class="servico-detalhe-content">
                <p class="servico-detalhe-resumo">${servico.descricao || "Sem descrição disponível."}</p>
                <p class="servico-detalhe-descricao">${servico.descricaoDetalhada || "Mais detalhes em breve."}</p>
                <div class="servico-detalhe-info">
                    <div class="servico-detalhe-pill">📍 ${servico.bairro || "Bairro não informado"}</div>
                    <div class="servico-detalhe-pill">📞 ${servico.telefone || "Telefone não informado"}</div>
                    <div class="servico-detalhe-pill avaliacao">⭐ ${textoAvaliacao}</div>
                </div>
                <button type="button" class="btn btn-primary btn-avaliar">Avaliar</button>
            </div>
        </div>
    `;

    const btnAvaliar = elements.conteudoDetalhesServico.querySelector(".btn-avaliar");
    if (btnAvaliar && elements.feedbackDetalhesServico) {
        btnAvaliar.addEventListener("click", () => {
            mostrar_modal_avaliar(token, elements, servico.id);
        });
    }

    elements.modalDetalhesServico.classList.remove("hidden");
}

function configurarMascaraTelefone(inputTelefone) {
    if (!inputTelefone) return;

    inputTelefone.addEventListener("input", (event) => {
        let value = event.target.value.replace(/\D/g, "");

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length > 6) {
            event.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            event.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            event.target.value = `(${value}`;
        }
    });
}

function mostrar_modal_avaliar(token, elements, idServico) {
    if (!elements.modalAvaliacao) return;

    const estrelas = elements.modalAvaliacao.querySelectorAll(".estrela-btn");
    const btnEnviar = elements.modalAvaliacao.querySelector("#btn-enviar-avaliacao");
    const feedback = elements.feedbackAvaliacao;
    const textoNota = elements.modalAvaliacao.querySelector("#texto-nota");
    const formAvaliacao = elements.modalAvaliacao.querySelector("#form-avaliacao");

    if (!estrelas.length || !btnEnviar || !feedback || !formAvaliacao) return;

    let notaSelecionada = 0;

    feedback.className = "feedback-msg hidden";
    feedback.textContent = "";
    btnEnviar.classList.add("hidden");

    if (textoNota) {
        textoNota.textContent = "Clique em uma estrela para avaliar";
    }

    const atualizarEstrelas = () => {
        estrelas.forEach((estrela, index) => {
            estrela.classList.toggle("active", index < notaSelecionada);
        });

        btnEnviar.classList.toggle("hidden", notaSelecionada === 0);

        if (textoNota) {
            textoNota.textContent = notaSelecionada > 0 ? `${notaSelecionada} estrela${notaSelecionada > 1 ? "s" : ""} selecionada${notaSelecionada > 1 ? "s" : ""}` : "Clique em uma estrela para avaliar";
        }
    };

    estrelas.forEach((estrela) => {
        estrela.onclick = () => {
            notaSelecionada = Number(estrela.dataset.valor || 0);
            atualizarEstrelas();
        };
    });

    formAvaliacao.onsubmit = (event) => {
        event.preventDefault();

        if (!notaSelecionada) {
            mostrarFeedback(feedback, "Selecione uma nota antes de enviar.", "error");
            return;
        }

        mostrarFeedback(feedback, "Enviando avaliação...", "error");

        enviarAvaliacao(token, elements, idServico, notaSelecionada)
            .then(({ status, body }) => {
                if (status === 201 || status === 200) {
                    mostrarFeedback(feedback, body.mensagem || "Avaliação enviada com sucesso!", "success");
                    setTimeout(() => {
                        if (elements.modalAvaliacao) {
                            elements.modalAvaliacao.classList.add("hidden");
                        }
                    }, 1200);
                    return;
                }

                mostrarFeedback(feedback, body.erro || body.mensagem || "Não foi possível enviar a avaliação.", "error");
            })
            .catch(() => {
                mostrarFeedback(feedback, "Erro de comunicação com o servidor.", "error");
            });
    };

    elements.modalAvaliacao.classList.remove("hidden");
}