function carregarAnunciosDestaque() {
    return Connecta.api.requisicao("anuncios", {
        method: "GET",
        parametros: {
            destaques: "true"
        }
    });
}
