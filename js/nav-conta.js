function atualizarVisibilidadeMeusServicos(tipoConta) {
    const isContaComercial = tipoConta === "COMERCIAL";

    document.querySelectorAll("[data-conta-comercial]").forEach((link) => {
        link.classList.toggle("hidden", !isContaComercial);
    });
}

async function configurarNavegacaoPorTipoConta() {
    const token = Connecta.auth.obterToken();
    if (!token) return;

    try {
        const { status, body } = await Connecta.api.requisicao("usuario", {
            method: "GET",
            token
        });
        if (status === 200) atualizarVisibilidadeMeusServicos(body?.tipoConta);
    } catch (erro) {
        console.error("Erro ao verificar o tipo de conta para a navegação:", erro);
    }
}

configurarNavegacaoPorTipoConta();
