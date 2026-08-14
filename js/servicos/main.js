document.addEventListener("DOMContentLoaded", () => {
    const token = Connecta.auth.exigirToken();
    if (!token) return;

    const elements = {
        formFiltros: document.getElementById("form-filtros"),
        filtroBusca: document.getElementById("filtro-busca"),
        filtroTop: document.getElementById("filtro-top"),
        btnLimparFiltros: document.getElementById("btn-limpar-filtros"),
        gridServicos: document.getElementById("grid-servicos")
    };

    configurarFiltros(token, elements);
});
