const ENDPOINT_ANUNCIOS = "anuncios";
const ENDPOINT_AVALIACOES = "avaliacoes";

function obterServicoCompleto(token, idAnuncio) {
    return Connecta.api.requisicao(ENDPOINT_ANUNCIOS, {
        method: "GET",
        token,
        parametros: { id: idAnuncio }
    });
}

function enviarAvaliacao(token, idAnuncio, nota, comentario) {
    const body = new URLSearchParams({ idAnuncio: String(idAnuncio), nota: String(nota) });
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
