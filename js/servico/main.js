document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.exigirSessao();
    if (!sessao) return;
    const token = sessao.token;

    const idServico = new URLSearchParams(window.location.search).get("id");
    if (!idServico) {
        window.location.assign("servicos.html");
        return;
    }

    const id = (valor) => document.getElementById(valor);
    const elements = {
        nome: id("servico-nome"),
        resumo: id("servico-resumo"),
        descricao: id("servico-descricao"),
        foto: id("servico-foto"),
        hero: id("servico-hero"),
        btnFotoAnterior: id("btn-foto-anterior"),
        btnFotoProxima: id("btn-foto-proxima"),
        fotoContador: id("foto-contador"),
        fotoThumbs: id("foto-thumbs"),
        badges: id("servico-badges"),
        whatsapp: id("servico-whatsapp"),
        postador: id("servico-postador"),
        postadorFoto: id("servico-postador-foto"),
        postadorNome: id("servico-postador-nome"),
        feedback: id("feedback-servico"),
        resumoNota: id("resumo-nota"),
        resumoEstrelas: id("resumo-estrelas"),
        resumoTotal: id("resumo-total"),
        barras: {
            5: { fill: id("barra-fill-5"), count: id("barra-count-5") },
            4: { fill: id("barra-fill-4"), count: id("barra-count-4") },
            3: { fill: id("barra-fill-3"), count: id("barra-count-3") },
            2: { fill: id("barra-fill-2"), count: id("barra-count-2") },
            1: { fill: id("barra-fill-1"), count: id("barra-count-1") }
        },
        btnAvaliar: id("btn-avaliar"),
        btnCompartilhar: id("btn-compartilhar"),
        btnCarregarMais: id("btn-carregar-mais"),
        btnVoltar: id("btn-voltar"),
        btnHome: id("btn-home")
    };

    configurarNavegacao(elements);
    configurarGaleriaFotos(elements);
    configurarAvaliacoes(token, idServico, elements);
    configurarListaAvaliacoes(token, idServico, elements, sessao.usuario);
    carregarServicoCompleto(token, idServico, elements);
});
