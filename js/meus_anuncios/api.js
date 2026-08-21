const ENDPOINT_ANUNCIOS = "anuncios";

function carregarMeusAnuncios(token) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: { meus: "true" }
    });
}

function criarAnuncio(token, dadosAnuncio) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAnuncio)
    });
}

function obterAnuncioPorId(token, id) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: { id }
    });
}

function atualizarAnuncio(token, dadosAnuncio) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAnuncio)
    });
}

function excluirAnuncio(token, id, email) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "DELETE",
        token,
        parametros: { id, email }
    });
}

function atualizarStatusAnuncio(token, id, status) {
    if (status !== "ATIVO" && status !== "OCULTO") {
        return Promise.reject(new Error("Status de anúncio inválido."));
    }
    return atualizarAnuncio(token, { id: Number(id), status });
}
