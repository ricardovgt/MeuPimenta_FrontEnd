const FILTRO_CATEGORIA_HOME_STORAGE_KEY = "meuPimenta:filtro-categoria-home";

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function extrairPalavrasChave(conteudo) {
    const palavrasChave = String(conteudo || "")
        .split(/\s+/)
        .map((palavra) => palavra.trim().replaceAll("-", " "))
        .filter(Boolean);

    return [...new Set(palavrasChave)];
}

function salvarFiltroCategoriaHome(categoria, palavrasChave) {
    sessionStorage.setItem(
        FILTRO_CATEGORIA_HOME_STORAGE_KEY,
        JSON.stringify({ categoria, palavrasChave })
    );
}
