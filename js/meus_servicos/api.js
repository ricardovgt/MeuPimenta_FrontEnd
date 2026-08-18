const ENDPOINT_ANUNCIOS = "anuncios";

function carregarMeusServicos(token) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: { meus: "true" }
    });
}

function criarServico(token, dadosServico) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosServico)
    });
}

function obterServicoPorId(token, id) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: { id }
    });
}

function atualizarServico(token, dadosServico) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosServico)
    });
}

function excluirServico(token, id, email) {
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
    return atualizarServico(token, { id: Number(id), status });
}
