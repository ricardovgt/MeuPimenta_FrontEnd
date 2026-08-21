const ENDPOINT_ANUNCIOS = "anuncios";

function normalizarTextoParaBusca(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function anuncioCorrespondeAosTermos(anuncio, termos) {
    const textoAnuncio = ` ${normalizarTextoParaBusca(
        `${anuncio?.nome || ""} ${anuncio?.descricao || ""}`
    )} `;

    return termos.some((termo) => {
        const termoNormalizado = normalizarTextoParaBusca(termo);
        return termoNormalizado && textoAnuncio.includes(` ${termoNormalizado} `);
    });
}

function carregarAnuncios(
    token,
    { pagina = 1, limite = 12, top = false, busca = "", tipo = "" } = {}
) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: {
            pagina,
            limite,
            top: top ? "true" : "",
            busca,
            tipo
        }
    });
}

async function carregarTodosAnunciosDoTermo(token, palavraChave, filtros = {}) {
    const limite = 50;
    const primeiraResposta = await carregarAnuncios(token, {
        pagina: 1,
        limite,
        top: filtros.top,
        busca: palavraChave,
        tipo: filtros.tipo
    });
    if (primeiraResposta.status !== 200) return primeiraResposta;

    const totalPaginas = Math.max(1, Number(primeiraResposta.body?.totalPaginas) || 1);
    const respostasRestantes = totalPaginas > 1
        ? await Promise.all(
            Array.from({ length: totalPaginas - 1 }, (_, indice) =>
                carregarAnuncios(token, {
                    pagina: indice + 2,
                    limite,
                    top: filtros.top,
                    busca: palavraChave,
                    tipo: filtros.tipo
                })
            )
        )
        : [];

    const respostaComErro = respostasRestantes.find(({ status }) => status !== 200);
    if (respostaComErro) return respostaComErro;

    return {
        status: 200,
        body: {
            anuncios: [primeiraResposta, ...respostasRestantes]
                .flatMap(({ body }) => Array.isArray(body?.anuncios) ? body.anuncios : [])
        }
    };
}

async function carregarAnunciosPorPalavrasChave(
    token,
    { palavrasChave = [], pagina = 1, limite = 12, top = false, tipo = "" } = {}
) {
    const termos = [...new Set(
        palavrasChave
            .filter((termo) => typeof termo === "string")
            .map((termo) => termo.trim())
            .filter(Boolean)
    )];
    const respostas = await Promise.all(
        termos.map((termo) => carregarTodosAnunciosDoTermo(token, termo, { top, tipo }))
    );
    const respostaComErro = respostas.find(({ status }) => status !== 200);
    if (respostaComErro) return respostaComErro;

    const anunciosPorId = new Map();
    respostas.forEach(({ body }) => {
        (body?.anuncios || [])
            .filter((anuncio) => anuncioCorrespondeAosTermos(anuncio, termos))
            .forEach((anuncio) => {
                const id = Number(anuncio?.id);
                if (Number.isInteger(id) && !anunciosPorId.has(id)) {
                    anunciosPorId.set(id, anuncio);
                }
            });
    });

    const anuncios = [...anunciosPorId.values()];
    anuncios.sort((anuncioA, anuncioB) => {
        if (top) {
            const diferencaMedia = (Number(anuncioB.avaliacaoMedia) || 0)
                - (Number(anuncioA.avaliacaoMedia) || 0);
            if (diferencaMedia !== 0) return diferencaMedia;
            const diferencaTotal = (Number(anuncioB.totalAvaliacoes) || 0)
                - (Number(anuncioA.totalAvaliacoes) || 0);
            if (diferencaTotal !== 0) return diferencaTotal;
        }
        return Number(anuncioB.id) - Number(anuncioA.id);
    });

    const paginaAtual = Math.max(1, Number(pagina) || 1);
    const limiteSeguro = Math.max(1, Number(limite) || 12);
    const totalAnuncios = anuncios.length;
    const totalPaginas = totalAnuncios === 0 ? 0 : Math.ceil(totalAnuncios / limiteSeguro);
    const inicio = (paginaAtual - 1) * limiteSeguro;

    return {
        status: 200,
        body: {
            anuncios: anuncios.slice(inicio, inicio + limiteSeguro),
            paginaAtual,
            limite: limiteSeguro,
            totalAnuncios,
            totalPaginas,
            temPaginaAnterior: paginaAtual > 1,
            temProximaPagina: paginaAtual < totalPaginas
        }
    };
}
