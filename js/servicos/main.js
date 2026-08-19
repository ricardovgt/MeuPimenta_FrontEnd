document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.validarSessao();
    const token = sessao?.token || null;

    const elements = {
        formFiltros: document.getElementById("form-filtros"),
        filtroBusca: document.getElementById("filtro-busca"),
        filtroTipo: document.getElementById("filtro-tipo"),
        filtroTop: document.getElementById("filtro-top"),
        btnLimparFiltros: document.getElementById("btn-limpar-filtros"),
        btnAnunciar: document.getElementById("btn-anunciar"),
        gridServicos: document.getElementById("grid-servicos")
    };

    configurarFiltros(token, elements);
    configurarBotaoAnunciar(sessao, elements);
});
