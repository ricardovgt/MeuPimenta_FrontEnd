// Estado do carrossel de fotos do anúncio (trocar de foto só troca o src, sem recarregar nada)
let fotosAnuncioAtual = [];
let indiceFotoAtual = 0;

function renderizarFotoAtual(elements) {
    const temFoto = fotosAnuncioAtual.length > 0;

    if (elements.hero) {
        elements.hero.classList.toggle("hidden", !temFoto);
    }

    if (elements.foto) {
        const fotoAtual = fotosAnuncioAtual[indiceFotoAtual];
        if (temFoto) {
            elements.foto.onerror = () => {
                elements.foto.onerror = null;
                fotosAnuncioAtual.splice(indiceFotoAtual, 1);
                indiceFotoAtual = Math.max(0, Math.min(indiceFotoAtual, fotosAnuncioAtual.length - 1));
                renderizarFotoAtual(elements);
            };
            elements.foto.src = fotoAtual.fotoBase64;
        } else {
            elements.foto.onerror = null;
            elements.foto.removeAttribute("src");
        }
    }

    const temVariasFotos = fotosAnuncioAtual.length > 1;

    if (elements.btnFotoAnterior) {
        elements.btnFotoAnterior.classList.toggle("hidden", !temVariasFotos);
    }

    if (elements.btnFotoProxima) {
        elements.btnFotoProxima.classList.toggle("hidden", !temVariasFotos);
    }

    if (elements.fotoContador) {
        if (temVariasFotos) {
            elements.fotoContador.textContent = `${indiceFotoAtual + 1} / ${fotosAnuncioAtual.length}`;
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

    if (fotosAnuncioAtual.length <= 1) {
        elements.fotoThumbs.classList.add("hidden");
        return;
    }

    elements.fotoThumbs.classList.remove("hidden");

    fotosAnuncioAtual.forEach((foto, index) => {
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
    if (fotosAnuncioAtual.length === 0) return;
    indiceFotoAtual = (indiceFotoAtual - 1 + fotosAnuncioAtual.length) % fotosAnuncioAtual.length;
    renderizarFotoAtual(elements);
}

function mostrarFotoProxima(elements) {
    if (fotosAnuncioAtual.length === 0) return;
    indiceFotoAtual = (indiceFotoAtual + 1) % fotosAnuncioAtual.length;
    renderizarFotoAtual(elements);
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

function anuncioPertenceAoUsuarioAutenticado(anuncio, idUsuarioAutenticado) {
    if (idUsuarioAutenticado === null || idUsuarioAutenticado === undefined) return false;

    const idDono = anuncio?.idUsuario
        ?? anuncio?.usuarioId
        ?? anuncio?.usuario?.idUsuario
        ?? anuncio?.usuario?.id;

    return idDono !== null
        && idDono !== undefined
        && Number(idDono) === Number(idUsuarioAutenticado);
}

function mostrarAnuncioIndisponivel(elements) {
    elements.detalhe?.classList.add("servico-indisponivel-ativo");
    elements.detalhe?.classList.remove("servico-banido-proprietario");
    elements.indisponivel?.classList.remove("hidden");
    elements.avisoRestricao?.classList.add("hidden");
    document.title = "Anúncio não encontrado - MeuPimenta";
}

function ocultarAnuncioIndisponivel(elements) {
    elements.detalhe?.classList.remove("servico-indisponivel-ativo");
    elements.indisponivel?.classList.add("hidden");
}

function popularAnuncio(anuncio, elements) {
    const avaliacaoMedia = Number(anuncio.avaliacaoMedia || 0);
    const totalAvaliacoes = Number(anuncio.totalAvaliacoes || 0);
    const statusAnuncio = String(anuncio.status || "").toUpperCase();
    const usuarioEhDono = anuncioPertenceAoUsuarioAutenticado(
        anuncio,
        elements.idUsuarioAutenticado
    );
    const statusRestrito = ["BANIDO", "OCULTO"].includes(statusAnuncio);
    const anuncioIndisponivel = statusRestrito && !usuarioEhDono;

    if (anuncioIndisponivel) {
        mostrarAnuncioIndisponivel(elements);
        return false;
    }

    ocultarAnuncioIndisponivel(elements);
    const exibirAvisoBanido = usuarioEhDono && statusAnuncio === "BANIDO";
    elements.detalhe?.classList.toggle("servico-banido-proprietario", exibirAvisoBanido);
    elements.avisoRestricao?.classList.toggle("hidden", !exibirAvisoBanido);
    const ocultarAcoesDoAnuncio = usuarioEhDono;

    if (elements.nome) {
        elements.nome.textContent = anuncio.nome || "Anúncio";
    }

    if (elements.postador) {
        const nomePostador = resumirNome(anuncio.nomeUsuario);

        if (nomePostador) {
            elements.postadorNome.textContent = nomePostador;
            exibirFotoDono(anuncio.fotoPerfilUsuario, elements.postadorFoto);
            elements.postador.classList.remove("hidden");
        } else {
            elements.postador.classList.add("hidden");
        }
    }

    if (elements.resumo) {
        elements.resumo.textContent = anuncio.descricao || "Sem descrição disponível.";
    }

    if (elements.descricao) {
        elements.descricao.textContent = anuncio.descricaoDetalhada || "Mais detalhes em breve.";
    }

    fotosAnuncioAtual = Array.isArray(anuncio.fotos)
        ? anuncio.fotos.filter((foto) => {
            const valor = typeof foto?.fotoBase64 === "string" ? foto.fotoBase64.trim() : "";
            return valor && valor.toLowerCase() !== "null";
        })
        : [];
    indiceFotoAtual = 0;
    renderizarFotoAtual(elements);

    if (elements.foto) {
        elements.foto.alt = anuncio.nome || "Anúncio";
    }

    if (elements.badges) {
        elements.badges.innerHTML = "";
        const badges = [
            { label: anuncio.tipo === "COMERCIO" ? "Comércio" : anuncio.tipo === "SERVICO" ? "Serviço" : "Tipo não informado", className: "tipo" },
            ...(statusAnuncio === "BANIDO" ? [{ label: "Banido", className: "status status-banido" }] : []),
            ...(statusAnuncio === "OCULTO" ? [{ label: "Pausado", className: "status status-oculto" }] : []),
            { label: anuncio.telefone || "Telefone não informado", className: "telefone-whatsapp", icon: "../img/whatsapp_Icon.svg" },
            { label: `⭐ ${avaliacaoMedia.toFixed(1)} - ${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`, className: "avaliacao" }
        ];

        badges.forEach((badge) => {
            const el = document.createElement("span");
            el.className = `badge${badge.className ? ` ${badge.className}` : ""}`;
            if (badge.icon) {
                const icon = document.createElement("img");
                icon.className = "badge-icon";
                icon.src = badge.icon;
                icon.alt = "";
                icon.setAttribute("aria-hidden", "true");
                el.append(icon, document.createTextNode(badge.label));
            } else {
                el.textContent = badge.label;
            }
            elements.badges.appendChild(el);
        });
    }

    if (elements.whatsapp) {
        elements.whatsapp.classList.toggle("hidden", ocultarAcoesDoAnuncio);
        elements.whatsapp.href = `https://wa.me/${(anuncio.telefone || "").replace(/\D/g, "")}`;
        elements.whatsapp.innerHTML = `
            <img class="btn-icon" src="../img/whatsapp_Icon.svg" alt="" aria-hidden="true">
            <span>${anuncio.telefone ? "Abrir WhatsApp" : "Telefone indisponível"}</span>
        `;
    }

    elements.btnAvaliar?.classList.toggle("hidden", ocultarAcoesDoAnuncio);
    elements.btnDenunciar?.classList.toggle("hidden", ocultarAcoesDoAnuncio);
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
            5: Number(anuncio.total5Estrelas || 0),
            4: Number(anuncio.total4Estrelas || 0),
            3: Number(anuncio.total3Estrelas || 0),
            2: Number(anuncio.total2Estrelas || 0),
            1: Number(anuncio.total1Estrelas || 0)
        };

        Object.keys(elements.barras).forEach((estrela) => {
            const { fill, count } = elements.barras[estrela];
            const quantidade = totaisPorEstrela[estrela] || 0;
            const porcentagem = totalAvaliacoes > 0 ? (quantidade / totalAvaliacoes) * 100 : 0;

            if (fill) fill.style.width = `${porcentagem}%`;
            if (count) count.textContent = quantidade;
        });
    }

    return true;
}

function mostrarModalAvaliacao(token, idAnuncio, elements, opcoes = {}) {
    const painel = document.createElement("div");
    painel.className = "avaliacao-panel avaliacao-form-panel";
    painel.innerHTML = `
        <h2 class="section-title">Avaliar este anúncio</h2>
        <div class="estrelas-avaliacao" role="radiogroup" aria-label="Avaliação do anúncio">
            <button type="button" class="estrela-btn" data-valor="1" aria-label="1 estrela">★</button>
            <button type="button" class="estrela-btn" data-valor="2" aria-label="2 estrelas">★</button>
            <button type="button" class="estrela-btn" data-valor="3" aria-label="3 estrelas">★</button>
            <button type="button" class="estrela-btn" data-valor="4" aria-label="4 estrelas">★</button>
            <button type="button" class="estrela-btn" data-valor="5" aria-label="5 estrelas">★</button>
        </div>
        <textarea id="comentario-avaliacao" class="comentario-input" placeholder="Deixe um comentário (opcional)" maxlength="1000"></textarea>
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
            if (!Number.isInteger(notaSelecionada) || notaSelecionada < 1 || notaSelecionada > 5) {
                Connecta.ui.mostrarFeedback(feedback, "Selecione uma nota inteira de 1 a 5 antes de enviar.", "error");
                return;
            }

            const comentario = painel.querySelector("#comentario-avaliacao").value.trim();
            if (comentario.length > 1000) {
                Connecta.ui.mostrarFeedback(feedback, "O comentário deve ter no máximo 1.000 caracteres.", "error");
                return;
            }

            Connecta.ui.mostrarFeedback(feedback, "Enviando avaliação...", "error");

            enviarAvaliacao(token, idAnuncio, notaSelecionada, comentario)
                .then(({ status, body }) => {
                    if (status === 201 || status === 200) {
                        Connecta.ui.mostrarFeedback(feedback, body?.mensagem || "Avaliação enviada com sucesso!", "success");

                        opcoes.aoEnviar?.();

                        return;
                    }
                    Connecta.ui.mostrarFeedback(feedback, body?.erro || body?.mensagem || "Não foi possível enviar a avaliação.", "error");
                })
                .catch(() => {
                    Connecta.ui.mostrarFeedback(feedback, "Erro de comunicação com o servidor.", "error");
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
            const confirmado = await Connecta.ui.confirmar({
                titulo: "Excluir Avaliação",
                mensagem: "Deseja excluir esta avaliação? Esta ação não pode ser desfeita.",
                textoConfirmar: "Excluir",
                textoCancelar: "Cancelar",
                kicker: "Ação Irreversível"
            });
            if (!confirmado) return;

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
                await Connecta.ui.alerta({
                    titulo: "Não foi possível excluir",
                    mensagem: body?.erro || body?.mensagem || mensagemPadrao,
                    kicker: "Aviso"
                });
            } catch {
                await Connecta.ui.alerta({
                    titulo: "Erro de Conexão",
                    mensagem: "Erro de comunicação com o servidor.",
                    kicker: "Erro"
                });
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
            list.innerHTML = '<p class="avaliacao-vazia">Ainda não há comentários para este anúncio.</p>';
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
    if (feedback) Connecta.ui.mostrarFeedback(feedback, mensagem, "error");
}
