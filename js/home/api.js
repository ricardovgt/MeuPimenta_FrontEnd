async function carregarPalavrasChaveCategoria(categoria) {
    const resposta = await fetch(`../keywords-categorias/${categoria}.txt`);

    if (!resposta.ok) {
        throw new Error(`Não foi possível carregar a categoria: ${categoria}.`);
    }

    return extrairPalavrasChave(await resposta.text());
}

function carregarAnunciosDestaque() {
    return Connecta.api.requisicao("anuncios", {
        method: "GET",
        parametros: {
            destaques: "true"
        }
    });
}
