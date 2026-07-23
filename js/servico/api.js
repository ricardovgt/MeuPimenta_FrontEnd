function obterHeadersAutorizacao(token) {
    return {
        Authorization: "Bearer " + token
    };
}

async function lerResposta(response) {
    const text = await response.text();

    if (!text) {
        return { status: response.status, body: {} };
    }

    try {
        return { status: response.status, body: JSON.parse(text) };
    } catch {
        return { status: response.status, body: { mensagem: text } };
    }
}

function carregarServicoCompleto(token, idServico, elements) {
    fetch(`http://localhost:8080/connecta-api/servicos?id=${encodeURIComponent(idServico)}`, {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then(async (res) => {
            const { status, body } = await lerResposta(res);

            if (status !== 200) {
                mostrarFeedback(elements.feedback, body?.erro || body?.mensagem || "Não foi possível carregar este serviço.", "error");
                return;
            }

            popularServico(body, elements);
        })
        .catch((err) => {
            console.error("Erro ao carregar serviço:", err);
            mostrarFeedback(elements.feedback, "Erro de conexão com o servidor.", "error");
        });
}

function enviarAvaliacao(token, feedbackElement, idServico, nota, comentario) {
    if (!idServico || !nota) {
        mostrarFeedback(feedbackElement, "Selecione uma nota antes de enviar.", "error");
        return Promise.resolve({ status: 400, body: { erro: "Selecione uma nota antes de enviar." } });
    }

    const params = {
        idServico: String(idServico),
        nota: String(nota)
    };

    if (comentario !== undefined && comentario !== null) {
        params.comentario = String(comentario);
    }

    const body = new URLSearchParams(params);

    return fetch("http://localhost:8080/connecta-api/avaliacoes", {
        method: "POST",
        headers: {
            ...obterHeadersAutorizacao(token),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    })
        .then(async (res) => {
            const data = await lerResposta(res);
            return { status: res.status, body: data.body };
        });
}

function listarAvaliacoes(idServico, pagina = 1, limite = 10) {
    const qs = new URLSearchParams({ idServico: String(idServico), pagina: String(pagina), limite: String(limite) });

    return fetch(`http://localhost:8080/connecta-api/avaliacoes?${qs.toString()}`, {
        method: "GET"
    })
        .then(async (res) => {
            const data = await lerResposta(res);
            return { status: res.status, body: data.body };
        });
}