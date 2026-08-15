document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.exigirSessao();
    if (!sessao) return;
    const token = sessao.token;

    const id = (valor) => document.getElementById(valor);
    const elements = {
        nome: id("info-nome"), nomePerfil: id("perfil-nome"), email: id("info-email"),
        tipo: id("info-tipo"), tipoPerfil: id("perfil-tipo-conta"), btnSair: id("btn-sair"),
        avatarImg: id("perfil-avatar-img"),
        inputFotoPerfil: id("input-foto-perfil"), feedbackFoto: id("feedback-foto-perfil"),
        formNome: id("form-nome"), inputNome: id("input-nome"), feedbackNome: id("feedback-nome"),
        formEmail: id("form-email"), inputEmail: id("input-email"), feedbackEmail: id("feedback-email"),
        formTipoConta: id("form-tipo-conta"), inputTipoConta: id("input-tipo-conta"), feedbackTipoConta: id("feedback-tipo-conta"),
        formSenha: id("form-senha"), inputNovaSenha: id("input-nova-senha"), inputConfirmarSenha: id("input-confirmar-senha"), feedbackSenha: id("feedback-senha"),
        modalSenha: id("modal-senha"), modalSenhaTitulo: id("modal-senha-titulo"), modalTipoAviso: id("modal-tipo-aviso"),
        formModalSenha: id("form-modal-senha"), modalSenhaAtual: id("modal-senha-atual"), feedbackModalSenha: id("feedback-modal-senha"),
        btnCancelarSenha: id("btn-cancelar-senha"), btnConfirmarSenha: id("btn-confirmar-senha"),
        btnAbrirExclusao: id("btn-abrir-exclusao"), modalExclusao: id("modal-exclusao"), formExclusao: id("form-exclusao"),
        exclusaoEmail: id("exclusao-email"), exclusaoSenha: id("exclusao-senha"), feedbackExclusao: id("feedback-exclusao"),
        btnCancelarExclusao: id("btn-cancelar-exclusao"), btnConfirmarExclusao: id("btn-confirmar-exclusao")
    };
    const state = { usuario: {} };

    const perfilCarregado = carregarPerfil(sessao, state, elements);
    if (!perfilCarregado) return;

    configurarBotaoSair(elements.btnSair);
    configurarUploadFotoPerfil(token, elements);
    configurarFormularioNome(token, state, elements);
    configurarAcoesComSenha(token, state, elements);
    configurarExclusaoConta(token, state, elements);
    configurarFechamentoModais(elements);
});
