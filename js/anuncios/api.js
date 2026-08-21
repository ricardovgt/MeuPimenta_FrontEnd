const ENDPOINT_ANUNCIOS = "anuncios";

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
