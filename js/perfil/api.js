function carregarDadosUsuario(token, elements) {
    fetch("http://localhost:8080/connecta-api/usuario", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 200) {
                if (elements.nome) elements.nome.textContent = body.nome;
                if (elements.nomePerfil) elements.nomePerfil.textContent = body.nome;
                if (elements.email) elements.email.textContent = ocultarEmail(body.email);

                const tipoConta = body.tipoConta === "COMERCIAL" ? "Conta Comercial" : "Conta Pessoal";
                if (elements.tipo) elements.tipo.textContent = tipoConta;
                if (elements.tipoPerfil) elements.tipoPerfil.textContent = tipoConta;
                return;
            }

            alert(body.erro || "Sua sessão expirou.");
            fazerLogout();
        })
        .catch((erro) => {
            console.error("Erro na requisição:", erro);
            if (elements.nome) elements.nome.textContent = "Erro de conexão";
        });
}
