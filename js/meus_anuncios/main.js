document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.exigirSessao();
    if (!sessao) return;
    const token = sessao.token;

    const elements = {
        grid: document.getElementById("grid-meus-servicos"),
        resumo: document.getElementById("resumo-meus-servicos"),
        contagem: document.getElementById("meus-servicos-contagem"),

        btnNovoAnuncio: document.getElementById("btn-novo-servico"),
        avisoLimiteAnuncios: document.getElementById("aviso-limite-anuncios"),
        modalAnuncio: document.getElementById("modal-cadastro-servico"),
        formAnuncio: document.getElementById("form-servico"),
        inputTelefoneCadastro: document.getElementById("telefone"),
        inputFotosCadastro: document.getElementById("fotos-input"),
        fotosCadastroPreview: document.getElementById("fotos-preview"),
        feedbackAnuncio: document.getElementById("feedback-servico"),
        btnCancelarAnuncio: document.getElementById("btn-cancelar-servico"),
        btnFecharCadastro: document.getElementById("btn-fechar-cadastro"),
        aceiteRegrasAnuncio: document.getElementById("aceite-regras-anuncio"),
        btnVerRegrasPublicacao: document.getElementById("btn-ver-regras-publicacao"),
        modalRegrasPublicacao: document.getElementById("modal-regras-publicacao"),
        btnFecharRegrasPublicacao: document.getElementById("btn-fechar-regras-publicacao"),
        btnRevisarAnuncio: document.getElementById("btn-revisar-anuncio"),
        btnConfirmarPublicacao: document.getElementById("btn-confirmar-publicacao"),

        modalEditar: document.getElementById("modal-editar-servico"),
        formEditar: document.getElementById("form-editar-servico"),
        inputEditarId: document.getElementById("editar-id"),
        inputEditarTipo: document.getElementById("editar-tipo"),
        inputNome: document.getElementById("editar-nome"),
        inputTelefone: document.getElementById("editar-telefone"),
        inputFotosEdicao: document.getElementById("editar-fotos"),
        fotosPreview: document.getElementById("editar-fotos-preview"),
        inputDescricao: document.getElementById("editar-descricao"),
        inputDescricaoDetalhada: document.getElementById("editar-descricaoDetalhada"),
        btnCancelarEdicao: document.getElementById("btn-cancelar-edicao"),
        btnFecharEdicao: document.getElementById("btn-fechar-edicao"),
        btnSalvarEdicao: document.getElementById("btn-salvar-edicao"),

        modalExcluir: document.getElementById("modal-excluir-servico"),
        excluirId: document.getElementById("excluir-id"),
        inputEmailConfirm: document.getElementById("input-email-confirmacao"),
        btnCancelarExcluir: document.getElementById("btn-cancelar-excluir"),
        btnConfirmarExcluir: document.getElementById("btn-confirmar-excluir")
    };

    configurarListaAnuncios(token, elements);
    configurarCadastroAnuncio(token, elements);
    configurarEdicaoAnuncio(token, elements);
    configurarExclusaoAnuncio(token, elements);
    configurarFechamentoEdicao(elements);
    configurarMascaraTelefone(elements.inputTelefoneCadastro);
    configurarMascaraTelefone(elements.inputTelefone);
    Connecta.ui.configurarContadoresCaracteres();

    elements.solicitarNovoAnuncio = sessao.usuario?.tipoConta === "COMERCIAL"
        && new URLSearchParams(window.location.search).get("novo") === "1";
});
