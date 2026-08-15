document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.exigirSessao();
    if (!sessao) return;
    const token = sessao.token;

    const elements = {
        formFiltros: document.getElementById("form-filtros"),
        filtroBusca: document.getElementById("filtro-busca"),
        filtroTop: document.getElementById("filtro-top"),
        btnLimparFiltros: document.getElementById("btn-limpar-filtros"),
        gridServicos: document.getElementById("grid-servicos")
    };

    configurarFiltros(token, elements);
});
