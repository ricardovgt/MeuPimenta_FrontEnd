function obterHeadersAutorizacao(token) {
    return {
        Authorization: "Bearer " + token
    };
}

function carregarServicoCompleto(token, idServico, elements) {
    fetch(`http://localhost:8080/connecta-api/servicos?id=${encodeURIComponent(idServico)}`, {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
            if (status !== 200) {
                mostrarFeedback(elements.feedback, "Não foi possível carregar este serviço.", "error");
                return;
            }

            popularServico(body, elements);
        })
        .catch((err) => {
            console.error("Erro ao carregar serviço:", err);
            mostrarFeedback(elements.feedback, "Erro de conexão com o servidor.", "error");
        });
}

function enviarAvaliacao(token, elements, idServico, nota) {
    if (!idServico || !nota) {
        mostrarFeedback(elements.feedbackAvaliacao, "Selecione uma nota antes de enviar.", "error");
        return Promise.resolve({ status: 400, body: { erro: "Selecione uma nota antes de enviar." } });
    }

    const body = new URLSearchParams({
        idServico: String(idServico),
        nota: String(nota)
    });

    return fetch("http://localhost:8080/connecta-api/avaliacoes", {
        method: "POST",
        headers: {
            ...obterHeadersAutorizacao(token),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    })
        .then(async (res) => {
            const text = await res.text();
            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { mensagem: text };
            }

            return { status: res.status, body: data };
        });
}