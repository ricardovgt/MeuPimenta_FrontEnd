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
        <textarea id="comentario-avaliacao" class="comentario-input" placeholder="Deixe um comentário (opcional)"></textarea>
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

            const comentario = painel.querySelector("#comentario-avaliacao").value.trim();

            mostrarFeedback(feedback, "Enviando avaliação...", "error");

            enviarAvaliacao(token, feedback, idServico, notaSelecionada, comentario)
                .then(({ status, body }) => {
                    if (status === 201 || status === 200) {
                        mostrarFeedback(feedback, body?.mensagem || "Avaliação enviada com sucesso!", "success");

                        // Refresh avaliações list (reload first page) and serviço resumo
                        if (typeof window.carregarAvaliacoesPagina === "function") {
                            window.carregarAvaliacoesPagina(1);
                        }

                        if (typeof carregarServicoCompleto === "function") {
                            // attempt to refresh service summary; elements must be available in scope where this function was called
                            carregarServicoCompleto(token, idServico, elements);
                        }

                        return;
                    }
                    mostrarFeedback(feedback, body?.erro || body?.mensagem || "Não foi possível enviar a avaliação.", "error");
                })
                .catch(() => {
                    mostrarFeedback(feedback, "Erro de comunicação com o servidor.", "error");
                });
        });
    }
}

function criarAvaliacaoElemento(avaliacao) {
    const container = document.createElement("div");
    container.className = "avaliacao-item card";

    const cabecalho = document.createElement("div");
    cabecalho.className = "avaliacao-cabecalho";
    cabecalho.textContent = `${avaliacao.nomeUsuario || 'Usuário'} · ${avaliacao.dataAvaliacao || ''}`;

    const nota = document.createElement("div");
    nota.className = "avaliacao-nota";
    nota.textContent = `Nota: ${Number(avaliacao.nota || 0).toFixed(1)}/5`;

    container.appendChild(cabecalho);
    container.appendChild(nota);

    if (avaliacao.comentario) {
        const texto = document.createElement("p");
        texto.className = "avaliacao-texto";
        texto.textContent = avaliacao.comentario;
        container.appendChild(texto);
    }

    return container;
}

function limparAvaliacoes() {
    const list = document.getElementById("avaliacoes-list");
    if (list) list.innerHTML = "";
}

function appendAvaliacoes(avaliacoes) {
    const list = document.getElementById("avaliacoes-list");
    if (!list) return;

    if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) return;

    avaliacoes.forEach((av) => {
        const el = criarAvaliacaoElemento(av);
        list.appendChild(el);
    });
}

function atualizarBotaoCarregarMais(paginaAtual, totalPaginas) {
    const btn = document.getElementById("btn-carregar-mais");
    if (!btn) return;

    if (paginaAtual < totalPaginas) {
        btn.classList.remove("hidden");
    } else {
        btn.classList.add("hidden");
    }
}

function mostrarErroAvaliacoes(mensagem) {
    const feedback = document.getElementById("feedback-avaliacoes");
    if (feedback) mostrarFeedback(feedback, mensagem, "error");
}