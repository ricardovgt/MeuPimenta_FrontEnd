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
    elements.popularCards.forEach((card) => {
        const categoria = card.dataset.categoria;
        if (!categoria) return;

        card.href = "anuncios.html";
        card.addEventListener("click", async (event) => {
            event.preventDefault();
            if (card.getAttribute("aria-busy") === "true") return;

            card.setAttribute("aria-busy", "true");
            try {
                const palavrasChave = await carregarPalavrasChaveCategoria(categoria);
                if (palavrasChave.length === 0) {
                    throw new Error(`A categoria ${categoria} não possui palavras-chave.`);
                }

                salvarFiltroCategoriaHome(categoria, palavrasChave);
                window.location.assign("anuncios.html");
            } catch (erro) {
                card.removeAttribute("aria-busy");
                console.error("Erro ao abrir categoria popular:", erro);
                window.alert("Não foi possível carregar essa categoria. Tente novamente.");
            }
        });
    });
}
