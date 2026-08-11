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
        btnFotoAnterior: document.getElementById("btn-foto-anterior"),
        btnFotoProxima: document.getElementById("btn-foto-proxima"),
        fotoContador: document.getElementById("foto-contador"),
        fotoThumbs: document.getElementById("foto-thumbs"),
        badges: document.getElementById("servico-badges"),
        whatsapp: document.getElementById("servico-whatsapp"),
        postador: document.getElementById("servico-postador"),
        feedback: document.getElementById("feedback-servico"),
        resumoNota: document.getElementById("resumo-nota"),
        resumoEstrelas: document.getElementById("resumo-estrelas"),
        resumoTotal: document.getElementById("resumo-total"),
        barras: {
            5: { fill: document.getElementById("barra-fill-5"), count: document.getElementById("barra-count-5") },
            4: { fill: document.getElementById("barra-fill-4"), count: document.getElementById("barra-count-4") },
            3: { fill: document.getElementById("barra-fill-3"), count: document.getElementById("barra-count-3") },
            2: { fill: document.getElementById("barra-fill-2"), count: document.getElementById("barra-count-2") },
            1: { fill: document.getElementById("barra-fill-1"), count: document.getElementById("barra-count-1") }
        },
        btnAvaliar: document.getElementById("btn-avaliar"),
        btnCompartilhar: document.getElementById("btn-compartilhar"),
        btnVoltar: document.getElementById("btn-voltar"),
        btnHome: document.getElementById("btn-home")
    };

    configurarNavegacao(elements);
    configurarGaleriaFotos(elements);
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