document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        searchInput: document.getElementById("searchInput"),
        searchButton: document.getElementById("searchButton"),
        popularCards: document.querySelectorAll(".popular-card"),
        featuredGrid: document.getElementById("featuredGrid")
    };

    configurarPesquisaAnuncios(elements);
    configurarCategoriasPopulares(elements);
    carregarEExibirDestaques(elements);
});
