const ENDPOINT_SERVICOS = "servicos";

function carregarServicos(token, top = false, busca = "") {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "GET",
        token,
        parametros: {
            top: top ? "true" : "",
            busca
        }
    });
}
