const USUARIO_URL = "http://localhost:8080/connecta-api/usuario";

async function lerResposta(response) {
    const text = await response.text();
    if (!text) return { status: response.status, body: {} };
    try {
        return { status: response.status, body: JSON.parse(text) };
    } catch {
        return { status: response.status, body: { mensagem: text } };
    }
}

async function requisicaoUsuario(token, options = {}) {
    const response = await fetch(USUARIO_URL, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });
    return lerResposta(response);
}

function obterUsuario(token) {
    return requisicaoUsuario(token, { method: "GET" });
}

// Cada chamada recebe um payload de uma única ação. Não agrupar campos aqui.
function atualizarUsuario(token, payloadAtomico) {
    return requisicaoUsuario(token, {
        method: "PUT",
        body: JSON.stringify(payloadAtomico)
    });
}

function atualizarFotoPerfil(token, fotoBase64) {
    return atualizarUsuario(token, { fotoPerfil: fotoBase64 });
}

function excluirUsuario(token, email, senhaAtual) {
    return requisicaoUsuario(token, {
        method: "DELETE",
        body: JSON.stringify({ email, senhaAtual })
    });
}
