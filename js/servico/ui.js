// Estado do carrossel de fotos do serviço (trocar de foto só troca o src, sem recarregar nada)
let fotosServicoAtual = [];
let indiceFotoAtual = 0;

function renderizarFotoAtual(elements) {
    const temFoto = fotosServicoAtual.length > 0;

    if (elements.hero) {
        elements.hero.classList.toggle("hidden", !temFoto);
    }

    if (elements.foto) {
        const fotoAtual = fotosServicoAtual[indiceFotoAtual];
        if (temFoto) {
            elements.foto.onerror = () => {
                elements.foto.onerror = null;
                fotosServicoAtual.splice(indiceFotoAtual, 1);
                indiceFotoAtual = Math.max(0, Math.min(indiceFotoAtual, fotosServicoAtual.length - 1));
                renderizarFotoAtual(elements);
            };
            elements.foto.src = fotoAtual.fotoBase64;
        } else {
            elements.foto.onerror = null;
            elements.foto.removeAttribute("src");
        }
    }

    const temVariasFotos = fotosServicoAtual.length > 1;

    if (elements.btnFotoAnterior) {
        elements.btnFotoAnterior.classList.toggle("hidden", !temVariasFotos);
    }

    if (elements.btnFotoProxima) {
        elements.btnFotoProxima.classList.toggle("hidden", !temVariasFotos);
    }

    if (elements.fotoContador) {
        if (temVariasFotos) {
            elements.fotoContador.textContent = `${indiceFotoAtual + 1} / ${fotosServicoAtual.length}`;
            elements.fotoContador.classList.remove("hidden");
        } else {
            elements.fotoContador.classList.add("hidden");
        }
    }

    renderizarThumbs(elements);
}

function renderizarThumbs(elements) {
    if (!elements.fotoThumbs) return;

    elements.fotoThumbs.innerHTML = "";

    if (fotosServicoAtual.length <= 1) {
        elements.fotoThumbs.classList.add("hidden");
        return;
    }

    elements.fotoThumbs.classList.remove("hidden");

    fotosServicoAtual.forEach((foto, index) => {
        const thumb = document.createElement("img");
        thumb.className = `foto-thumb${index === indiceFotoAtual ? " ativa" : ""}`;
        thumb.src = foto.fotoBase64 || "";
        thumb.alt = `Foto ${index + 1}`;
        thumb.addEventListener("click", () => {
            indiceFotoAtual = index;
            renderizarFotoAtual(elements);
        });
        elements.fotoThumbs.appendChild(thumb);
    });
}

function mostrarFotoAnterior(elements) {
    if (fotosServicoAtual.length === 0) return;
    indiceFotoAtual = (indiceFotoAtual - 1 + fotosServicoAtual.length) % fotosServicoAtual.length;
    renderizarFotoAtual(elements);
}

function mostrarFotoProxima(elements) {
    if (fotosServicoAtual.length === 0) return;
    indiceFotoAtual = (indiceFotoAtual + 1) % fotosServicoAtual.length;
    renderizarFotoAtual(elements);
}

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

function resumirNome(nomeCompleto) {
    if (typeof nomeCompleto !== "string") return "";
    return nomeCompleto.trim().split(/\s+/).filter(Boolean).slice(0, 3).join(" ");
}

function exibirFotoDono(fotoPerfilUsuario, elementoFoto) {
    if (!elementoFoto) return;

    const fotoPadrao = "../img/default-profile.png";
    const fotoPerfil = typeof fotoPerfilUsuario === "string" ? fotoPerfilUsuario.trim() : "";
    elementoFoto.src = fotoPerfil && fotoPerfil.toLowerCase() !== "null" ? fotoPerfil : fotoPadrao;
    elementoFoto.onerror = () => {
        elementoFoto.onerror = null;
        elementoFoto.src = fotoPadrao;
    };
}

function popularServico(servico, elements) {
    const avaliacaoMedia = Number(servico.avaliacaoMedia || 0);
    const totalAvaliacoes = Number(servico.totalAvaliacoes || 0);

    if (elements.nome) {
        elements.nome.textContent = servico.nome || "Serviço";
    }

    if (elements.postador) {
        const nomePostador = resumirNome(servico.nomeUsuario);

        if (nomePostador) {
            elements.postadorNome.textContent = nomePostador;
            exibirFotoDono(servico.fotoPerfilUsuario, elements.postadorFoto);
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

    fotosServicoAtual = Array.isArray(servico.fotos)
        ? servico.fotos.filter((foto) => {
            const valor = typeof foto?.fotoBase64 === "string" ? foto.fotoBase64.trim() : "";
            return valor && valor.toLowerCase() !== "null";
        })
        : [];
    indiceFotoAtual = 0;
    renderizarFotoAtual(elements);

    if (elements.foto) {
        elements.foto.alt = servico.nome || "Serviço";
    }

    if (elements.badges) {
        elements.badges.innerHTML = "";
        const badges = [
            { label: `📞 ${servico.telefone || "Telefone não informado"}` },
            { label: `⭐ ${avaliacaoMedia.toFixed(1)} - ${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`, className: "avaliacao" }
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
        elements.whatsapp.innerHTML = `<span>💬</span> ${servico.telefone ? "Abrir WhatsApp" : "Telefone indisponível"}`;
    }

    if (elements.resumoNota) {
        elements.resumoNota.textContent = avaliacaoMedia.toFixed(1);
    }

    if (elements.resumoEstrelas) {
        elements.resumoEstrelas.innerHTML = "";
        const notaArredondada = Math.round(avaliacaoMedia);

        for (let i = 1; i <= 5; i++) {
            const estrela = document.createElement("span");
            estrela.className = `estrela${i <= notaArredondada ? " cheia" : ""}`;
            estrela.textContent = "★";
            elements.resumoEstrelas.appendChild(estrela);
        }
    }

    if (elements.resumoTotal) {
        elements.resumoTotal.textContent = `${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`;
    }

    if (elements.barras) {
        const totaisPorEstrela = {
            5: Number(servico.total5Estrelas || 0),
            4: Number(servico.total4Estrelas || 0),
            3: Number(servico.total3Estrelas || 0),
            2: Number(servico.total2Estrelas || 0),
            1: Number(servico.total1Estrelas || 0)
        };

        Object.keys(elements.barras).forEach((estrela) => {
            const { fill, count } = elements.barras[estrela];
            const quantidade = totaisPorEstrela[estrela] || 0;
            const porcentagem = totalAvaliacoes > 0 ? (quantidade / totalAvaliacoes) * 100 : 0;

            if (fill) fill.style.width = `${porcentagem}%`;
            if (count) count.textContent = quantidade;
        });
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

                        if (typeof window.carregarAvaliacoesPagina === "function") {
                            window.carregarAvaliacoesPagina(1);
                        }

                        if (typeof carregarServicoCompleto === "function") {
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

function criarAvaliacaoElemento(avaliacao, opcoes = {}) {
    const FOTO_USUARIO_PADRAO = "../img/default-profile.png";
    const container = document.createElement("article");
    container.className = "avaliacao-item";

    const avatar = document.createElement("img");
    avatar.className = "avaliacao-avatar";
    avatar.alt = `Foto de perfil de ${avaliacao.nomeUsuario || "Usuário"}`;
    const fotoPerfil = typeof avaliacao.fotoPerfilUsuario === "string"
        ? avaliacao.fotoPerfilUsuario.trim()
        : "";
    avatar.src = fotoPerfil && fotoPerfil.toLowerCase() !== "null"
        ? fotoPerfil
        : FOTO_USUARIO_PADRAO;
    avatar.onerror = () => {
        avatar.onerror = null;
        avatar.src = FOTO_USUARIO_PADRAO;
    };

    const conteudo = document.createElement("div");
    conteudo.className = "avaliacao-conteudo";

    const nome = document.createElement("h3");
    nome.className = "avaliacao-usuario";
    nome.textContent = avaliacao.nomeUsuario || "Usuário";

    const notaValor = Math.max(0, Math.min(5, Number(avaliacao.nota) || 0));
    const notaLinha = document.createElement("div");
    notaLinha.className = "avaliacao-nota";
    notaLinha.setAttribute("aria-label", `Nota ${notaValor.toFixed(1)} de 5`);

    const estrelas = document.createElement("span");
    estrelas.className = "avaliacao-estrelas";
    estrelas.setAttribute("aria-hidden", "true");
    for (let numero = 1; numero <= 5; numero++) {
        const estrela = document.createElement("span");
        estrela.className = numero <= Math.round(notaValor) ? "avaliacao-estrela ativa" : "avaliacao-estrela";
        estrela.textContent = "★";
        estrelas.appendChild(estrela);
    }

    const notaNumero = document.createElement("span");
    notaNumero.className = "avaliacao-nota-numero";
    notaNumero.textContent = notaValor.toFixed(1);
    notaLinha.append(estrelas, notaNumero);

    const data = document.createElement("time");
    data.className = "avaliacao-data";
    data.textContent = avaliacao.dataAvaliacao || "";

    conteudo.append(nome, notaLinha);
    container.append(avatar, conteudo, data);

    if (avaliacao.comentario) {
        const texto = document.createElement("p");
        texto.className = "avaliacao-texto";
        texto.textContent = avaliacao.comentario;
        conteudo.appendChild(texto);
    }

    const pertenceAoUsuario = pertenceAoUsuarioAutenticado(
        avaliacao,
        opcoes.idUsuarioAutenticado
    );

    if (pertenceAoUsuario) {
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "avaliacao-excluir";
        excluir.textContent = "Excluir";
        excluir.setAttribute("aria-label", "Excluir minha avaliação");

        excluir.addEventListener("click", async () => {
            if (!confirm("Deseja excluir esta avaliação? Esta ação não pode ser desfeita.")) return;

            excluir.disabled = true;
            excluir.textContent = "Excluindo...";

            try {
                const { status, body } = await excluirAvaliacao(opcoes.token, avaliacao.id);
                if (status === 200) {
                    if (typeof opcoes.aoExcluir === "function") opcoes.aoExcluir();
                    return;
                }

                const mensagemPadrao = status === 404
                    ? "A avaliação não existe ou não pertence a você."
                    : "Não foi possível excluir a avaliação.";
                alert(body?.erro || body?.mensagem || mensagemPadrao);
            } catch {
                alert("Erro de comunicação com o servidor.");
            } finally {
                excluir.disabled = false;
                excluir.textContent = "Excluir";
            }
        });

        conteudo.appendChild(excluir);
    }

    return container;
}

function limparAvaliacoes() {
    const list = document.getElementById("avaliacoes-list");
    if (list) list.innerHTML = "";
}

function temComentarioValido(avaliacao) {
    return typeof avaliacao?.comentario === "string" && avaliacao.comentario.trim().length > 0;
}

function pertenceAoUsuarioAutenticado(avaliacao, idUsuarioAutenticado) {
    return idUsuarioAutenticado !== null
        && idUsuarioAutenticado !== undefined
        && Number(avaliacao?.idUsuario) === Number(idUsuarioAutenticado);
}

function appendAvaliacoes(avaliacoes, opcoes = {}) {
    const list = document.getElementById("avaliacoes-list");
    if (!list) return;

    const avaliacoesVisiveis = Array.isArray(avaliacoes)
        ? avaliacoes.filter((avaliacao) =>
            temComentarioValido(avaliacao)
            || pertenceAoUsuarioAutenticado(avaliacao, opcoes.idUsuarioAutenticado)
        )
        : [];

    if (avaliacoesVisiveis.length === 0) {
        if (list.children.length === 0) {
            list.innerHTML = '<p class="avaliacao-vazia">Ainda não há comentários para este serviço.</p>';
        }
        return;
    }

    avaliacoesVisiveis.forEach((av) => {
        const el = criarAvaliacaoElemento(av, opcoes);
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
