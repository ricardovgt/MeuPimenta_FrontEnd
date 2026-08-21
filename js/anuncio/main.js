document.addEventListener("DOMContentLoaded", async () => {
    const sessao = await Connecta.auth.validarSessao();
    const token = sessao?.token || null;

    const idAnuncio = new URLSearchParams(window.location.search).get("id");
    if (!idAnuncio) {
        window.location.assign("anuncios.html");
        return;
    }

    const id = (valor) => document.getElementById(valor);
    const idUsuarioAutenticado = Number(
        sessao?.usuario?.idUsuario
        ?? sessao?.usuario?.id
        ?? obterIdUsuarioDoToken(token)
    ) || null;
    const elements = {
        idUsuarioAutenticado,
        detalhe: id("anuncio-detalhe"),
        nome: id("anuncio-nome"),
        resumo: id("anuncio-resumo"),
        descricao: id("anuncio-descricao"),
        foto: id("anuncio-foto"),
        hero: id("anuncio-hero"),
        btnFotoAnterior: id("btn-foto-anterior"),
        btnFotoProxima: id("btn-foto-proxima"),
        fotoContador: id("foto-contador"),
        fotoThumbs: id("foto-thumbs"),
        badges: id("anuncio-badges"),
        whatsapp: id("anuncio-whatsapp"),
        postador: id("anuncio-postador"),
        postadorFoto: id("anuncio-postador-foto"),
        postadorNome: id("anuncio-postador-nome"),
        feedback: id("feedback-anuncio"),
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
        btnDenunciar: id("btn-denunciar"),
        btnCarregarMais: id("btn-carregar-mais"),
        btnVoltar: id("btn-voltar"),
        btnHome: id("btn-home"),
        indisponivel: id("anuncio-indisponivel"),
        avisoRestricao: id("anuncio-aviso-restricao"),
        btnTentarNovamente: id("btn-tentar-novamente")
    };

    configurarNavegacao(elements);
    configurarGaleriaFotos(elements);
    configurarAvaliacoes(token, idAnuncio, elements);
    configurarDenuncia(token, idAnuncio, elements);
    const anuncioDisponivel = await carregarAnuncioCompleto(token, idAnuncio, elements);
    if (anuncioDisponivel) {
        configurarListaAvaliacoes(token, idAnuncio, elements, sessao?.usuario);
    }
});
