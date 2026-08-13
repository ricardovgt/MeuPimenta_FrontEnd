document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("tokenConnectaRO");

    if (!token) {
        window.location.assign("login.html");
        return;
    }

    const estadoConta = {
        isContaComercial: false
    };

    const elements = {
        formFiltros: document.getElementById("form-filtros"),
        filtroBusca: document.getElementById("filtro-busca"),
        filtroTop: document.getElementById("filtro-top"),
        btnLimparFiltros: document.getElementById("btn-limpar-filtros"),
        gridServicos: document.getElementById("grid-servicos"),
        btnVoltarHome: document.getElementById("btn-voltar-home"),
        btnNovoServico: document.getElementById("btn-novo-servico"),
        btnCancelarAviso: document.getElementById("btn-cancelar-aviso"),
        btnCancelarServico: document.getElementById("btn-cancelar-servico"),
        btnIrConfiguracoes: document.getElementById("btn-ir-configuracoes"),
        modalAviso: document.getElementById("modal-aviso-conta"),
        modalServico: document.getElementById("modal-cadastro-servico"),
        formServico: document.getElementById("form-servico"),
        inputFotos: document.getElementById("fotos-input"),
        fotosPreview: document.getElementById("fotos-preview"),
        feedbackServico: document.getElementById("feedback-servico"),
        inputTelefone: document.getElementById("telefone")
    };

    carregarPerfilUsuario(token, estadoConta);
    configurarFiltros(token, elements);
    configurarModais(estadoConta, elements);
    configurarCadastroServico(token, elements);
    configurarMascaraTelefone(elements.inputTelefone);
});
