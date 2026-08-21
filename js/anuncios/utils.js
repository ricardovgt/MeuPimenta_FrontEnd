const FILTRO_CATEGORIA_HOME_STORAGE_KEY = "meuPimenta:filtro-categoria-home";

function consumirFiltroCategoriaHome() {
    const filtroSalvo = sessionStorage.getItem(FILTRO_CATEGORIA_HOME_STORAGE_KEY);
    sessionStorage.removeItem(FILTRO_CATEGORIA_HOME_STORAGE_KEY);

    if (!filtroSalvo) return null;

    try {
        const filtro = JSON.parse(filtroSalvo);
        if (!Array.isArray(filtro?.palavrasChave)) return null;

        const palavrasChave = filtro.palavrasChave
            .filter((palavra) => typeof palavra === "string")
            .map((palavra) => palavra.trim())
            .filter(Boolean);

        if (palavrasChave.length === 0) return null;
        return {
            categoria: typeof filtro.categoria === "string" ? filtro.categoria : "",
            palavrasChave
        };
    } catch (erro) {
        console.error("Erro ao recuperar o filtro da página inicial:", erro);
        return null;
    }
}

function preservarFiltroCategoria(filtroCategoria) {
    if (!filtroCategoria?.palavrasChave?.length) return;
    sessionStorage.setItem(
        FILTRO_CATEGORIA_HOME_STORAGE_KEY,
        JSON.stringify(filtroCategoria)
    );
}

function limparFiltroCategoriaHome() {
    sessionStorage.removeItem(FILTRO_CATEGORIA_HOME_STORAGE_KEY);
}
