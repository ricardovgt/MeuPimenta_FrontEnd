function obterHeadersAutorizacao(token) {
    return {
        Authorization: "Bearer " + token
    };
}

function carregarPerfilUsuario(token, estadoConta) { 
    fetch("http://localhost:8080/connecta-api/usuario", {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
            if (status === 200) {
                estadoConta.isContaComercial = body.tipoConta === "COMERCIAL";
                return;
            }

            alert("Sessão expirada.");
            window.location.href = "login.html";
        })
        .catch((err) => console.error("Erro ao buscar usuário:", err));
}

function carregarServicos(token, elements, bairro = "", top = false) {
    const url = new URL("http://localhost:8080/connecta-api/servicos");

    if (bairro) {
        url.searchParams.set("bairro", bairro);
    }

    if (top) {
        url.searchParams.set("top", "true");
    }

    fetch(url, {
        method: "GET",
        headers: obterHeadersAutorizacao(token)
    })
        .then((res) => res.json())
        .then((data) => {
            const grid = elements.gridServicos;
            if (!grid) return;

            grid.innerHTML = "";

            if (data.length === 0) {
                grid.innerHTML = "<p>Nenhum serviço encontrado com esses filtros.</p>";
                return;
            }

            data.forEach((servico) => {
                const card = criarCardServico(servico, token, elements);
                grid.appendChild(card);
            });
        })
        .catch((err) => console.error("Erro ao buscar serviços:", err));
}

function criarServico(token, elements, formData) {
    const dadosFormatados = new URLSearchParams(formData);

    return fetch("http://localhost:8080/connecta-api/servicos", {
        method: "POST",
        headers: {
            ...obterHeadersAutorizacao(token),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: dadosFormatados
    })
        .then((res) => res.json().then((data) => ({ status: res.status, body: data })));
}

function mudarContaParaComercial(token) {
    return fetch("http://localhost:8080/connecta-api/usuario?tipoConta=COMERCIAL", {
        method: "PUT",
        headers: obterHeadersAutorizacao(token)
    })
        .then((res) => res.json().then((data) => ({ status: res.status, body: data })));
}