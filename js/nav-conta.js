function atualizarVisibilidadeMeusAnuncios(tipoConta) {
    const isContaComercial = tipoConta === "COMERCIAL";

    document.querySelectorAll("[data-conta-comercial]").forEach((link) => {
        link.classList.toggle("hidden", !isContaComercial);
    });
}

function atualizarAvatarNavegacao(usuario) {
    const fotoPadrao = document.querySelector("[data-nav-avatar]")?.getAttribute("src")
        || "../img/default-profile.png";
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

function atualizarNavegacaoPorSessao(usuario) {
    const autenticado = Boolean(usuario);

    document.querySelectorAll("[data-nav-autenticado]").forEach((elemento) => {
        elemento.classList.toggle("hidden", !autenticado);
    });

    document.querySelectorAll("[data-nav-anonimo]").forEach((elemento) => {
        elemento.classList.toggle("hidden", autenticado);
    });
}

async function configurarNavegacaoPorTipoConta() {
    try {
        const sessao = await Connecta.auth.validarSessao();
        atualizarNavegacaoPorSessao(sessao?.usuario);
        if (sessao) {
            atualizarVisibilidadeMeusAnuncios(sessao.usuario?.tipoConta);
            atualizarAvatarNavegacao(sessao.usuario);
        }
    } catch (erro) {
        console.error("Erro ao verificar o tipo de conta para a navegação:", erro);
    }
}

configurarNavegacaoPorTipoConta();

window.addEventListener("connecta:sessao-encerrada", () => {
    atualizarVisibilidadeMeusAnuncios(null);
    atualizarAvatarNavegacao(null);
    atualizarNavegacaoPorSessao(null);
});
