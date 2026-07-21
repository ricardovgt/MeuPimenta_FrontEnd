function mostrarFeedback(elemento, mensagem, tipo = "error") {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.classList.remove("hidden");
    elemento.className = "feedback-msg";

    if (tipo === "success") {
        elemento.classList.add("success");
    } else {
        elemento.classList.add("error");
    }
}

function popularServico(servico, elements) {
    const foto = servico.fotoUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    const avaliacaoMedia = Number(servico.avaliacaoMedia || 0);
    const totalAvaliacoes = Number(servico.totalAvaliacoes || 0);

    if (elements.nome) {
        elements.nome.textContent = servico.nome || "Serviço";
    }

    if (elements.postador) {
        const nomePostador = servico.nomeUsuario;

        if (nomePostador) {
            elements.postador.textContent = nomePostador;
            elements.postador.classList.remove("hidden");
        } else {
            elements.postador.classList.add("hidden");
        }
    }

    if (elements.resumo) {
        elements.resumo.textContent = servico.descricao || "Sem descrição disponível.";
    }

    if (elements.descricao) {
        elements.descricao.textContent = servico.descricaoDetalhada || "Mais detalhes em breve.";
    }

    if (elements.foto) {
        elements.foto.src = foto;
        elements.foto.alt = servico.nome || "Serviço";
    }

    if (elements.badges) {
        elements.badges.innerHTML = "";
        const badges = [
            { label: `📍 ${servico.bairro || "Bairro não informado"}` },
            { label: `📞 ${servico.telefone || "Telefone não informado"}` },
            { label: `⭐ ${avaliacaoMedia.toFixed(1)} · ${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`, className: "avaliacao" }
        ];

        badges.forEach((badge) => {
            const el = document.createElement("span");
            el.className = `badge${badge.className ? ` ${badge.className}` : ""}`;
            el.textContent = badge.label;
            elements.badges.appendChild(el);
        });
    }

    if (elements.whatsapp) {
        elements.whatsapp.href = `https://wa.me/${(servico.telefone || "").replace(/\D/g, "")}`;
        elements.whatsapp.textContent = servico.telefone ? "Abrir WhatsApp" : "Telefone indisponível";
    }

    if (elements.bairro) {
        elements.bairro.textContent = servico.bairro ? `Bairro: ${servico.bairro}` : "Bairro não informado";
    }

    if (elements.avaliacaoTexto) {
        elements.avaliacaoTexto.textContent = `${avaliacaoMedia.toFixed(1)} de 5 · ${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`;
    }
}

function mostrarModalAvaliacao(token, idServico, elements) {
    const painel = document.createElement("div");
    painel.className = "avaliacao-panel avaliacao-form-panel";
    painel.innerHTML = `
        <h2 class="section-title">Avaliar este serviço</h2>
        <div class="estrelas-avaliacao" role="radiogroup" aria-label="Avaliação do serviço">
            <button type="button" class="estrela-btn" data-valor="1" aria-label="1 estrela">★</button>
            <button type="button" class="estrela-btn" data-valor="2" aria-label="2 estrelas">★</button>
            <button type="button" class="estrela-btn" data-valor="3" aria-label="3 estrelas">★</button>
            <button type="button" class="estrela-btn" data-valor="4" aria-label="4 estrelas">★</button>
            <button type="button" class="estrela-btn" data-valor="5" aria-label="5 estrelas">★</button>
        </div>
        <div id="feedback-avaliacao" class="feedback-msg hidden"></div>
        <button id="btn-enviar-avaliacao" type="button" class="btn btn-primary btn-sm">Enviar avaliação</button>
    `;

    const container = elements.btnAvaliar.closest(".content");
    if (container) {
        container.appendChild(painel);
    }

    const estrelas = painel.querySelectorAll(".estrela-btn");
    const btnEnviar = painel.querySelector("#btn-enviar-avaliacao");
    const feedback = painel.querySelector("#feedback-avaliacao");
    let notaSelecionada = 0;

    const atualizarEstrelas = () => {
        estrelas.forEach((estrela, index) => {
            estrela.classList.toggle("active", index < notaSelecionada);
        });
    };

    estrelas.forEach((estrela) => {
        estrela.addEventListener("click", () => {
            notaSelecionada = Number(estrela.dataset.valor || 0);
            atualizarEstrelas();
        });
    });

    if (btnEnviar) {
        btnEnviar.addEventListener("click", () => {
            if (!notaSelecionada) {
                mostrarFeedback(feedback, "Selecione uma nota antes de enviar.", "error");
                return;
            }

            mostrarFeedback(feedback, "Enviando avaliação...", "error");

            enviarAvaliacao(token, elements, idServico, notaSelecionada)
                .then(({ status, body }) => {
                    if (status === 201 || status === 200) {
                        mostrarFeedback(feedback, body.mensagem || "Avaliação enviada com sucesso!", "success");
                        return;
                    }
                    mostrarFeedback(feedback, body.erro || body.mensagem || "Não foi possível enviar a avaliação.", "error");
                })
                .catch(() => {
                    mostrarFeedback(feedback, "Erro de comunicação com o servidor.", "error");
                });
        });
    }
}