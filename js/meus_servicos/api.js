const ENDPOINT_SERVICOS = "servicos";

function carregarMeusServicos(token) {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "GET",
        token,
        parametros: { meus: "true" }
    });
}

function criarServico(token, dadosServico) {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosServico)
    });
}

function obterServicoPorId(token, id) {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "GET",
        token,
        parametros: { id }
    });
}

function atualizarServico(token, dadosServico) {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosServico)
    });
}

function excluirServico(token, id, email) {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "DELETE",
        token,
        parametros: { id, email }
    });
}
