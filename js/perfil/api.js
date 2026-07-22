function carregarDadosUsuario(token, elements) {
    if (!token) {
        fazerLogout();
        return;
    }

    fetch("http://localhost:8080/connecta-api/usuario", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(async (response) => {
            const { status, body } = await lerResposta(response);

            if (status === 200) {
                if (elements.nome) elements.nome.textContent = body.nome || "Nome não informado";
                if (elements.nomePerfil) elements.nomePerfil.textContent = body.nome || "Nome não informado";
                if (elements.email) elements.email.textContent = ocultarEmail(body.email || "");

                const tipoConta = body.tipoConta === "COMERCIAL" ? "Conta Comercial" : "Conta Pessoal";
                if (elements.tipo) elements.tipo.textContent = tipoConta;
                if (elements.tipoPerfil) elements.tipoPerfil.textContent = tipoConta;
                return;
            }

            if (status === 401 || status === 403) {
                fazerLogout();
                return;
            }

            if (elements.nome) elements.nome.textContent = body.erro || "Não foi possível carregar o perfil.";
        })
        .catch((erro) => {
            console.error("Erro na requisição:", erro);
            if (elements.nome) elements.nome.textContent = "Erro de conexão";
        });
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
