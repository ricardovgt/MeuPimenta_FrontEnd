function atualizarVisibilidadeMeusServicos(tipoConta) {
    const isContaComercial = tipoConta === "COMERCIAL";

    document.querySelectorAll("[data-conta-comercial]").forEach((link) => {
        link.classList.toggle("hidden", !isContaComercial);
    });
}

async function configurarNavegacaoPorTipoConta() {
    try {
        const sessao = await Connecta.auth.validarSessao();
        if (sessao) atualizarVisibilidadeMeusServicos(sessao.usuario?.tipoConta);
    } catch (erro) {
        console.error("Erro ao verificar o tipo de conta para a navegação:", erro);
    }
}

configurarNavegacaoPorTipoConta();
