document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("tokenConnectaRO");

    if (!token) {
        window.location.assign("login.html");
        return;
    }

    const elements = {
        grid: document.getElementById("grid-meus-servicos"),

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

        modalExcluir: document.getElementById("modal-excluir-servico"),
        excluirId: document.getElementById("excluir-id"),
        inputEmailConfirm: document.getElementById("input-email-confirmacao"),
        btnCancelarExcluir: document.getElementById("btn-cancelar-excluir"),
        btnConfirmarExcluir: document.getElementById("btn-confirmar-excluir")
    };

    configurarEdicaoServico(token, elements);
    configurarExclusaoServico(token, elements);
    configurarListaServicos(token, elements);
});