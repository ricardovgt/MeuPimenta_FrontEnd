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

function carregarPerfilUsuario(token, estadoConta) {
    if (!token) {
        window.location.assign("login.html");
        return;
    }

    fetch("http://localhost:8080/connecta-api/usuario", {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then(async (res) => {
            const { status, body } = await lerResposta(res);

            if (status === 200) {
                estadoConta.isContaComercial = body?.tipoConta === "COMERCIAL";
                return;
            }

            if (status === 401 || status === 403) {
                window.location.assign("login.html");
            }
        })
        .catch((err) => console.error("Erro ao buscar usuário:", err));
}

function carregarServicos(token, elements, top = false, busca = "") {
    const url = new URL("http://localhost:8080/connecta-api/servicos");

    if (top) {
        url.searchParams.set("top", "true");
    }

    if (busca) {
        url.searchParams.set("busca", busca);
    }

    fetch(url, {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then(async (res) => {
            const { status, body } = await lerResposta(res);
            const grid = elements.gridServicos;
            if (!grid) return;

            grid.innerHTML = "";

            if (status !== 200) {
                const mensagem = document.createElement("p");
                mensagem.textContent = body?.erro || "Não foi possível carregar os serviços.";
                grid.appendChild(mensagem);
                return;
            }

            const listaServicos = Array.isArray(body) ? body : [];

            if (listaServicos.length === 0) {
                const mensagem = document.createElement("p");
                mensagem.textContent = "Nenhum serviço encontrado com esses filtros.";
                grid.appendChild(mensagem);
                return;
            }

            listaServicos.forEach((servico) => {
                const card = criarCardServico(servico);
                grid.appendChild(card);
            });
        })
        .catch((err) => console.error("Erro ao buscar serviços:", err));
}

function criarServico(token, elements, dadosServico) {
    return fetch("http://localhost:8080/connecta-api/servicos", {
        method: "POST",
        headers: {
            ...obterHeadersAutorizacao(token),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosServico)
    })
        .then(async (res) => {
            const body = await lerResposta(res);
            return { status: res.status, body: body.body };
        });
}

function mudarContaParaComercial(token) {
    return fetch("http://localhost:8080/connecta-api/usuario?tipoConta=COMERCIAL", {
        method: "PUT",
        headers: obterHeadersAutorizacao(token)
    })
        .then(async (res) => {
            const body = await lerResposta(res);
            return { status: res.status, body: body.body };
        });
}