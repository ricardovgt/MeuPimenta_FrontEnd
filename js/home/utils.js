const FILTRO_CATEGORIA_HOME_STORAGE_KEY = "meuPimenta:filtro-categoria-home";

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
