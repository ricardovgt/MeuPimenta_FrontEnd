const ENDPOINT_ANUNCIOS = "anuncios";
const ENDPOINT_AVALIACOES = "avaliacoes";

function obterAnuncioCompleto(token, idAnuncio) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: { id: idAnuncio }
    });
}

function enviarAvaliacao(token, idAnuncio, nota, comentario) {
    const notaNumerica = Number(nota);
    if (!Number.isInteger(notaNumerica) || notaNumerica < 1 || notaNumerica > 5) {
        return Promise.reject(new Error("A nota deve ser um número inteiro de 1 a 5."));
    }
    if (String(comentario ?? "").length > 1000) {
        return Promise.reject(new Error("O comentário deve ter no máximo 1.000 caracteres."));
    }

    const body = new URLSearchParams({ idAnuncio: String(idAnuncio), nota: String(notaNumerica) });
    if (comentario !== undefined && comentario !== null) body.set("comentario", String(comentario));

    return Connecta.api.requisicao(ENDPOINT_AVALIACOES, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
}

function listarAvaliacoes(idAnuncio, pagina = 1, limite = 10) {
    return Connecta.api.requisicao(ENDPOINT_AVALIACOES, {
        method: "GET",
        parametros: { idAnuncio, pagina, limite }
    });
}

function denunciarAnuncio(token, idAnuncio) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "DENUNCIAR", idAnuncio: Number(idAnuncio) })
    });
}

function excluirAvaliacao(token, idAvaliacao) {
    return Connecta.api.requisicao(ENDPOINT_AVALIACOES, {
        method: "DELETE",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idAvaliacao: Number(idAvaliacao) })
    });
}
