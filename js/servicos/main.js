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
        filtroBairro: document.getElementById("filtro-bairro"),
        filtroTop: document.getElementById("filtro-top"),
        btnLimparFiltros: document.getElementById("btn-limpar-filtros"),
        gridServicos: document.getElementById("grid-servicos"),
        btnVoltarHome: document.getElementById("btn-voltar-home"),
        btnNovoServico: document.getElementById("btn-novo-servico"),
        btnCancelarAviso: document.getElementById("btn-cancelar-aviso"),
        btnCancelarServico: document.getElementById("btn-cancelar-servico"),
        btnMudarConta: document.getElementById("btn-mudar-conta"),
        feedbackAviso: document.getElementById("feedback-mudar-conta"),
        modalAviso: document.getElementById("modal-aviso-conta"),
        modalServico: document.getElementById("modal-cadastro-servico"),
        formServico: document.getElementById("form-servico"),
        feedbackServico: document.getElementById("feedback-servico"),
        inputTelefone: document.getElementById("telefone")
    };

    carregarPerfilUsuario(token, estadoConta);
    configurarFiltros(token, elements);
    configurarModais(token, estadoConta, elements);
    configurarCadastroServico(token, elements);
    configurarMascaraTelefone(elements.inputTelefone);
});
