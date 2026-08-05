const API_SERVICOS = "http://localhost:8080/connecta-api/servicos";

function obterHeadersAutorizacao(token) {
    const tokenNormalizado = String(token || "").trim().replace(/^Bearer\s+/i, "");

    return {
        Authorization: `Bearer ${tokenNormalizado}`,
        Accept: "application/json"
    };
}

async function lerResposta(response) {
    const text = await response.text();

    if (!text) return { status: response.status, body: {} };

    try {
        return { status: response.status, body: JSON.parse(text) };
    } catch {
        return { status: response.status, body: { mensagem: text } };
    }
}

function carregarMeusServicos(token) {
    const url = new URL(API_SERVICOS);
    url.searchParams.set("meus", "true");

    return fetch(url, {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then(async (res) => {
            const { status, body } = await lerResposta(res);
            return { status, body };
        });
}

function obterServicoPorId(token, id) {
    const url = new URL(API_SERVICOS);
    url.searchParams.set("id", id);

    return fetch(url, {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then(async (res) => {
            const { status, body } = await lerResposta(res);
            return { status, body };
        });
}

function atualizarServico(token, dadosServico) {
    return fetch(API_SERVICOS, {
        method: "PUT",
        headers: {
            ...obterHeadersAutorizacao(token),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosServico)
    }).then(async (res) => {
        const { status, body } = await lerResposta(res);
        return { status, body };
    });
}

function excluirServico(token, id, email) {
    const url = new URL(API_SERVICOS);
    url.searchParams.set("id", id);
    url.searchParams.set("email", email);

    return fetch(url, {
        method: "DELETE",
        headers: obterHeadersAutorizacao(token)
    }).then(async (res) => {
        const { status, body } = await lerResposta(res);
        return { status, body };
    });
}

window.meusServicosApi = {
    carregarMeusServicos,
    obterServicoPorId,
    atualizarServico,
    excluirServico
};
