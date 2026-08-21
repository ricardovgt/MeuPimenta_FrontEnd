const LIMITE_ANUNCIOS_POR_PAGINA = 12;

function navegarComFiltros(elements, pagina = 1) {
    const url = new URL(window.location.href);
    const busca = elements.filtroBusca?.value.trim() || "";
    const tipo = elements.filtroTipo?.value || "";
    const top = elements.filtroTop?.checked || false;

    busca ? url.searchParams.set("busca", busca) : url.searchParams.delete("busca");
    tipo ? url.searchParams.set("tipo", tipo) : url.searchParams.delete("tipo");
    top ? url.searchParams.set("top", "true") : url.searchParams.delete("top");
    url.searchParams.set("pagina", String(Math.max(1, Number(pagina) || 1)));
    window.location.assign(url.toString());
}

function atualizarControlesPaginacao(elements, dados) {
    if (!elements.paginacao) return;

    const paginaAtual = Math.max(1, Number(dados?.paginaAtual) || 1);
    const totalPaginas = Math.max(0, Number(dados?.totalPaginas) || 0);
    const totalAnuncios = Math.max(0, Number(dados?.totalAnuncios) || 0);
    const temResultados = totalAnuncios > 0;

    elements.paginacao.classList.toggle("hidden", !temResultados);
    if (!temResultados) return;

    if (elements.paginacaoInfo) {
        elements.paginacaoInfo.textContent = `Página ${paginaAtual} de ${Math.max(1, totalPaginas)}`;
    }
    if (elements.paginacaoTotal) {
        elements.paginacaoTotal.textContent = totalAnuncios === 1
            ? "1 anúncio encontrado"
            : `${totalAnuncios} anúncios encontrados`;
    }

    if (elements.btnPaginaAnterior) {
        elements.btnPaginaAnterior.disabled = !dados?.temPaginaAnterior || paginaAtual <= 1;
        elements.btnPaginaAnterior.dataset.pagina = String(Math.max(1, paginaAtual - 1));
    }
    if (elements.btnProximaPagina) {
        elements.btnProximaPagina.disabled = !dados?.temProximaPagina || paginaAtual >= totalPaginas;
        elements.btnProximaPagina.dataset.pagina = String(paginaAtual + 1);
    }
}

function atualizarListaAnuncios(token, elements, filtros = {}) {
    const grid = elements.gridAnuncios;
    if (!grid) return Promise.resolve();

    grid.replaceChildren();
    const carregando = document.createElement("p");
    carregando.textContent = "Carregando anúncios...";
    grid.appendChild(carregando);

    return carregarAnuncios(token, {
        pagina: filtros.pagina,
        limite: LIMITE_ANUNCIOS_POR_PAGINA,
        top: filtros.top,
        busca: filtros.busca,
        tipo: filtros.tipo
    })
        .then(({ status, body }) => {
            grid.innerHTML = "";
            if (status !== 200) {
                elements.paginacao?.classList.add("hidden");
                const mensagem = document.createElement("p");
                mensagem.textContent = body?.erro || "Não foi possível carregar os anúncios.";
                grid.appendChild(mensagem);
                return;
            }

            const lista = Array.isArray(body?.anuncios) ? body.anuncios : [];
            atualizarControlesPaginacao(elements, body);

            const totalPaginas = Number(body?.totalPaginas) || 0;
            if (totalPaginas > 0 && filtros.pagina > totalPaginas) {
                navegarComFiltros(elements, totalPaginas);
                return;
            }

            if (lista.length === 0) {
                const mensagem = document.createElement("p");
                mensagem.textContent = "Nenhum anúncio encontrado com esses filtros.";
                grid.appendChild(mensagem);
                return;
            }
            lista.forEach((anuncio) => grid.appendChild(criarCardAnuncio(anuncio)));
        })
        .catch((erro) => {
            elements.paginacao?.classList.add("hidden");
            grid.innerHTML = "";
            const mensagem = document.createElement("p");
            mensagem.textContent = "Erro de comunicação ao buscar os anúncios.";
            grid.appendChild(mensagem);
            console.error("Erro ao buscar anúncios:", erro);
        });
}

function configurarFiltros(token, elements, filtrosIniciais = {}) {
    elements.formFiltros?.addEventListener("submit", (event) => {
        event.preventDefault();
        navegarComFiltros(elements, 1);
    });

    elements.btnLimparFiltros?.addEventListener("click", () => {
        const url = new URL(window.location.href);
        url.search = "";
        window.location.assign(url.toString());
    });

    elements.btnPaginaAnterior?.addEventListener("click", () => {
        navegarComFiltros(elements, elements.btnPaginaAnterior.dataset.pagina);
    });
    elements.btnProximaPagina?.addEventListener("click", () => {
        navegarComFiltros(elements, elements.btnProximaPagina.dataset.pagina);
    });

    atualizarListaAnuncios(token, elements, filtrosIniciais);
}

function configurarBotaoAnunciar(sessao, elements) {
    elements.btnAnunciar?.addEventListener("click", async () => {
        if (!sessao) {
            window.location.assign("login.html");
            return;
        }

        const tipoConta = String(sessao.usuario?.tipoConta || "").toUpperCase();
        if (tipoConta === "COMERCIAL") {
            window.location.assign("meus_anuncios.html?novo=1");
            return;
        }

        const desejaAlterarTipo = await Connecta.ui.confirmar({
            titulo: "Quer publicar um anúncio?",
            mensagem: "Para publicar anúncios, sua conta precisa ser do tipo Comercial.",
            textoConfirmar: "Tornar minha conta Comercial",
            textoCancelar: "Agora não",
            kicker: "Conta Comercial"
        });

        if (desejaAlterarTipo) {
            window.location.assign("perfil.html#form-tipo-conta");
        }
    });
}
