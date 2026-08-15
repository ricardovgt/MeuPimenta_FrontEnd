const ENDPOINT_SERVICOS = "servicos";
const ENDPOINT_AVALIACOES = "avaliacoes";

function obterServicoCompleto(token, idServico) {
    return Connecta.api.requisicao(ENDPOINT_SERVICOS, {
        method: "GET",
        token,
        parametros: { id: idServico }
    });
}

function enviarAvaliacao(token, idServico, nota, comentario) {
    const body = new URLSearchParams({ idServico: String(idServico), nota: String(nota) });
    if (comentario !== undefined && comentario !== null) body.set("comentario", String(comentario));

    return Connecta.api.requisicao(ENDPOINT_AVALIACOES, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
}

function listarAvaliacoes(idServico, pagina = 1, limite = 10) {
    return Connecta.api.requisicao(ENDPOINT_AVALIACOES, {
        method: "GET",
        parametros: { idServico, pagina, limite }
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
