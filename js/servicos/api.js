const ENDPOINT_ANUNCIOS = "anuncios";

function carregarServicos(token, top = false, busca = "", tipo = "") {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: {
            top: top ? "true" : "",
            busca,
            tipo
        }
    });
}
