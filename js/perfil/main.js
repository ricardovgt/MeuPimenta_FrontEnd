document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("tokenConnectaRO");

    if (!token) {
        window.location.assign("login.html");
        return;
    }

    const elements = {
        nome: document.getElementById("info-nome"),
        nomePerfil: document.getElementById("perfil-nome"),
        email: document.getElementById("info-email"),
        tipo: document.getElementById("info-tipo"),
        tipoPerfil: document.getElementById("perfil-tipo-conta"),
        btnSair: document.getElementById("btn-sair")
    };

    carregarDadosUsuario(token, elements);
    configurarBotaoSair(elements.btnSair);
});
