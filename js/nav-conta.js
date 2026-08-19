function atualizarVisibilidadeMeusServicos(tipoConta) {
    const isContaComercial = tipoConta === "COMERCIAL";

    document.querySelectorAll("[data-conta-comercial]").forEach((link) => {
        link.classList.toggle("hidden", !isContaComercial);
    });
}

function atualizarAvatarNavegacao(usuario) {
    const fotoPadrao = "../img/default-profile.png";
    const fotoRecebida = typeof usuario?.fotoPerfil === "string"
        ? usuario.fotoPerfil.trim()
        : "";
    const fotoPerfil = fotoRecebida && fotoRecebida.toLowerCase() !== "null"
        ? fotoRecebida
        : fotoPadrao;
    const nomeUsuario = typeof usuario?.nome === "string" ? usuario.nome.trim() : "";

    document.querySelectorAll("[data-nav-avatar]").forEach((avatar) => {
        avatar.src = fotoPerfil;
        avatar.alt = nomeUsuario ? `Foto de perfil de ${nomeUsuario}` : "Foto de perfil";
        avatar.onerror = () => {
            avatar.onerror = null;
            avatar.src = fotoPadrao;
        };
    });

    document.querySelectorAll("[data-nav-avatar-link]").forEach((link) => {
        link.setAttribute("aria-label", nomeUsuario ? `Abrir perfil de ${nomeUsuario}` : "Abrir perfil");
        link.title = nomeUsuario || "Perfil";
    });
}

async function configurarNavegacaoPorTipoConta() {
    try {
        const sessao = await Connecta.auth.validarSessao();
        if (sessao) {
            atualizarVisibilidadeMeusServicos(sessao.usuario?.tipoConta);
            atualizarAvatarNavegacao(sessao.usuario);
        }
    } catch (erro) {
        console.error("Erro ao verificar o tipo de conta para a navegação:", erro);
    }
}

configurarNavegacaoPorTipoConta();

window.addEventListener("connecta:sessao-encerrada", () => {
    atualizarVisibilidadeMeusServicos(null);
    atualizarAvatarNavegacao(null);
});
