document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.exigirSessao();
    if (!sessao) return;
    const token = sessao.token;

    const elements = {
        grid: document.getElementById("grid-meus-servicos"),

        btnNovoServico: document.getElementById("btn-novo-servico"),
        modalServico: document.getElementById("modal-cadastro-servico"),
        formServico: document.getElementById("form-servico"),
        inputTelefoneCadastro: document.getElementById("telefone"),
        inputFotosCadastro: document.getElementById("fotos-input"),
        fotosCadastroPreview: document.getElementById("fotos-preview"),
        feedbackServico: document.getElementById("feedback-servico"),
        btnCancelarServico: document.getElementById("btn-cancelar-servico"),
        btnFecharCadastro: document.getElementById("btn-fechar-cadastro"),

        modalEditar: document.getElementById("modal-editar-servico"),
        formEditar: document.getElementById("form-editar-servico"),
        inputEditarId: document.getElementById("editar-id"),
        inputNome: document.getElementById("editar-nome"),
        inputTelefone: document.getElementById("editar-telefone"),
        inputFotosEdicao: document.getElementById("editar-fotos"),
        fotosPreview: document.getElementById("editar-fotos-preview"),
        inputDescricao: document.getElementById("editar-descricao"),
        inputDescricaoDetalhada: document.getElementById("editar-descricaoDetalhada"),
        btnCancelarEdicao: document.getElementById("btn-cancelar-edicao"),
        btnFecharEdicao: document.getElementById("btn-fechar-edicao"),

        modalExcluir: document.getElementById("modal-excluir-servico"),
        excluirId: document.getElementById("excluir-id"),
        inputEmailConfirm: document.getElementById("input-email-confirmacao"),
        btnCancelarExcluir: document.getElementById("btn-cancelar-excluir"),
        btnConfirmarExcluir: document.getElementById("btn-confirmar-excluir")
    };

    configurarListaServicos(token, elements);
    configurarCadastroServico(token, elements);
    configurarEdicaoServico(token, elements);
    configurarExclusaoServico(token, elements);
    configurarFechamentoEdicao(elements);
    configurarMascaraTelefone(elements.inputTelefoneCadastro);
    configurarMascaraTelefone(elements.inputTelefone);
    Connecta.ui.configurarContadoresCaracteres();
});
