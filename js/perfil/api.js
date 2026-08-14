const ENDPOINT_USUARIO = "usuario";

function requisicaoUsuario(token, options = {}) {
    return Connecta.api.requisicao(ENDPOINT_USUARIO, {
        ...options,
        token,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });
}

function obterUsuario(token) {
    return requisicaoUsuario(token, { method: "GET" });
}

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
