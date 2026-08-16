const FOTO_PERFIL_PADRAO = "../img/default-profile.png";

function exibirFotoPerfil(fotoBase64, elements) {
    if (!elements.avatarImg) return;

    const possuiFoto = typeof fotoBase64 === "string"
        && fotoBase64.trim() !== ""
        && fotoBase64.trim().toLowerCase() !== "null";

    elements.avatarImg.src = possuiFoto ? fotoBase64 : FOTO_PERFIL_PADRAO;
    elements.avatarImg.onerror = () => {
        elements.avatarImg.onerror = null;
        elements.avatarImg.src = FOTO_PERFIL_PADRAO;
    };
}

function nomeTipoConta(tipoConta) {
    return tipoConta === "COMERCIAL" ? "Conta Comercial" : "Conta Comum";
}

function renderizarUsuario(usuario, elements) {
    const nome = usuario.nome || "Nome não informado";
    const tipo = nomeTipoConta(usuario.tipoConta);
    elements.nome.textContent = nome;
    elements.nomePerfil.textContent = nome;
    elements.email.textContent = ocultarEmail(usuario.email || "");
    elements.tipo.textContent = tipo;
    elements.tipoPerfil.textContent = tipo;
    elements.inputNome.value = usuario.nome || "";
    elements.inputEmail.value = ocultarEmail(usuario.email || "");
    elements.inputTipoConta.value = usuario.tipoConta === "COMERCIAL" ? "COMERCIAL" : "COMUM";
    exibirFotoPerfil(usuario.fotoPerfil, elements);
}

function abrirModal(modal, foco) {
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    setTimeout(() => foco?.focus(), 0);
}

function fecharModal(modal) {
    modal.classList.add("hidden");
    if (!document.querySelector(".profile-modal:not(.hidden)")) document.body.classList.remove("modal-open");
}

function definirCarregamento(botao, carregando, textoCarregando = "Salvando...") {
    if (!botao.dataset.textoOriginal) botao.dataset.textoOriginal = botao.textContent;
    botao.disabled = carregando;
    botao.textContent = carregando ? textoCarregando : botao.dataset.textoOriginal;
}
