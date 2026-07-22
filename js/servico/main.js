document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("tokenConnectaRO");

    if (!token) {
        window.location.assign("login.html");
        return;
    }

    const idServico = new URLSearchParams(window.location.search).get("id");

    if (!idServico) {
        window.location.href = "servicos.html";
        return;
    }

    const elements = {
        nome: document.getElementById("servico-nome"),
        resumo: document.getElementById("servico-resumo"),
        descricao: document.getElementById("servico-descricao"),
        foto: document.getElementById("servico-foto"),
        badges: document.getElementById("servico-badges"),
        whatsapp: document.getElementById("servico-whatsapp"),
        bairro: document.getElementById("servico-bairro"),
        postador: document.getElementById("servico-postador"),
        feedback: document.getElementById("feedback-servico"),
        avaliacaoTexto: document.getElementById("texto-avaliacao"),
        btnAvaliar: document.getElementById("btn-avaliar"),
        btnCompartilhar: document.getElementById("btn-compartilhar"),
        btnVoltar: document.getElementById("btn-voltar"),
        btnHome: document.getElementById("btn-home")
    };

    configurarNavegacao(elements);
    carregarServicoCompleto(token, idServico, elements);
    configurarAvaliacoes(token, idServico, elements);
});