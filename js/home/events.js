function abrirBuscaDeAnuncios(elements) {
    if (!elements.searchInput) return;

    const termo = elements.searchInput.value.trim();
    const parametros = new URLSearchParams();
    if (termo) parametros.set("busca", termo);

    const destino = parametros.size > 0
        ? `anuncios.html?${parametros.toString()}`
        : "anuncios.html";

    window.location.assign(destino);
}

function configurarPesquisaAnuncios(elements) {
    elements.searchButton?.addEventListener("click", () => {
        abrirBuscaDeAnuncios(elements);
    });

    elements.searchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") abrirBuscaDeAnuncios(elements);
    });
}

function configurarCategoriasPopulares(elements) {
    const categorias = ["pedreiro", "informatica", "mecanica", "beleza"];

    elements.popularCards.forEach((card, index) => {
        const categoria = categorias[index];
        if (!categoria) return;

        card.href = `anuncios.html?busca=${encodeURIComponent(categoria)}`;
    });
}
