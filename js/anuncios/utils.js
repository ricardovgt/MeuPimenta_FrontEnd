const FILTRO_CATEGORIA_HOME_STORAGE_KEY = "meuPimenta:filtro-categoria-home";

function consumirFiltroCategoriaHome() {
    const filtroSalvo = sessionStorage.getItem(FILTRO_CATEGORIA_HOME_STORAGE_KEY);
    sessionStorage.removeItem(FILTRO_CATEGORIA_HOME_STORAGE_KEY);

    if (!filtroSalvo) return [];

    try {
        const filtro = JSON.parse(filtroSalvo);
        if (!Array.isArray(filtro?.palavrasChave)) return [];

        return filtro.palavrasChave
            .filter((palavra) => typeof palavra === "string")
            .map((palavra) => palavra.trim())
            .filter(Boolean);
    } catch (erro) {
        console.error("Erro ao recuperar o filtro da página inicial:", erro);
        return [];
    }
}
