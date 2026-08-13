function atualizarVisibilidadeMeusServicos(tipoConta) {
    const isContaComercial = tipoConta === "COMERCIAL";

    document.querySelectorAll("[data-conta-comercial]").forEach((link) => {
        link.classList.toggle("hidden", !isContaComercial);
    });
}

async function configurarNavegacaoPorTipoConta() {
    const token = sessionStorage.getItem("tokenConnectaRO");
    if (!token) return;

    try {
        const response = await fetch("http://localhost:8080/connecta-api/usuario", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const usuario = await response.json();
        atualizarVisibilidadeMeusServicos(usuario?.tipoConta);
    } catch (erro) {
        console.error("Erro ao verificar o tipo de conta para a navegação:", erro);
    }
}

configurarNavegacaoPorTipoConta();
