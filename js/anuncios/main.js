document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.validarSessao();
    const token = sessao?.token || null;
    const parametros = new URLSearchParams(window.location.search);
    const buscaInicial = (parametros.get("busca") || "").trim();
    const tipoInformado = (parametros.get("tipo") || "").toUpperCase();
    const tipoInicial = ["SERVICO", "COMERCIO"].includes(tipoInformado)
        ? tipoInformado
        : "";
    const paginaInformada = Number.parseInt(parametros.get("pagina"), 10);
    const paginaInicial = Number.isInteger(paginaInformada) && paginaInformada > 0
        ? paginaInformada
        : 1;
    const topInicial = parametros.get("top") === "true";
    const filtroCategoria = buscaInicial ? null : consumirFiltroCategoriaHome();

    const elements = {
        formFiltros: document.getElementById("form-filtros"),
        filtroBusca: document.getElementById("filtro-busca"),
        filtroTipo: document.getElementById("filtro-tipo"),
        filtroTop: document.getElementById("filtro-top"),
        btnLimparFiltros: document.getElementById("btn-limpar-filtros"),
        btnAnunciar: document.getElementById("btn-anunciar"),
        gridAnuncios: document.getElementById("grid-anuncios"),
        paginacao: document.getElementById("paginacao-anuncios"),
        paginacaoInfo: document.getElementById("paginacao-info"),
        paginacaoTotal: document.getElementById("paginacao-total"),
        btnPaginaAnterior: document.getElementById("btn-pagina-anterior"),
        btnProximaPagina: document.getElementById("btn-proxima-pagina")
    };

    if (elements.filtroBusca) elements.filtroBusca.value = buscaInicial;
    if (elements.filtroTipo) elements.filtroTipo.value = tipoInicial;
    if (elements.filtroTop) elements.filtroTop.checked = topInicial;

    configurarFiltros(token, elements, {
        busca: buscaInicial,
        tipo: tipoInicial,
        top: topInicial,
        pagina: paginaInicial,
        filtroCategoria
    });
    configurarBotaoAnunciar(sessao, elements);
});
