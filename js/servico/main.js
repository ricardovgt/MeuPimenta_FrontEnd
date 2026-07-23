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

    // Estado de paginação para avaliações
    const avaliacoesState = {
        paginaAtual: 1,
        totalPaginas: 1,
        limite: 10
    };

    // Função exposta para recarregar uma página específica (usada pelo modal após postar)
    window.carregarAvaliacoesPagina = function (pagina) {
        const paginaReq = Number(pagina || 1);

        listarAvaliacoes(idServico, paginaReq, avaliacoesState.limite)
            .then(({ status, body }) => {
                if (status !== 200) {
                    mostrarErroAvaliacoes(body?.erro || body?.mensagem || 'Não foi possível carregar avaliações.');
                    return;
                }

                const resp = body || {};

                // atualizar estado
                avaliacoesState.paginaAtual = Number(resp.paginaAtual || paginaReq);
                avaliacoesState.totalPaginas = Number(resp.totalPaginas || 1);

                if (paginaReq === 1) {
                    limparAvaliacoes();
                }

                appendAvaliacoes(resp.avaliacoes || []);
                atualizarBotaoCarregarMais(avaliacoesState.paginaAtual, avaliacoesState.totalPaginas);
            })
            .catch(() => {
                mostrarErroAvaliacoes('Erro de comunicação com o servidor.');
            });
    };

    // carregar primeira página
    window.carregarAvaliacoesPagina(1);

    const btnCarregarMais = document.getElementById('btn-carregar-mais');
    if (btnCarregarMais) {
        btnCarregarMais.addEventListener('click', () => {
            if (avaliacoesState.paginaAtual < avaliacoesState.totalPaginas) {
                const proxima = avaliacoesState.paginaAtual + 1;
                window.carregarAvaliacoesPagina(proxima);
            }
        });
    }
});