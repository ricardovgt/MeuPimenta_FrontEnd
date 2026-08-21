let fotosCadastroAtual = [];
let fotosEdicaoAtual = [];
const LIMITE_FOTOS = 5;

const ICONES_ANUNCIOS = {
    total: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M9 15h.01M15 15h.01"/></svg>',
    ativo: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16.5 9"/></svg>',
    oculto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    banido: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>',
    pausar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>',
    ativar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5z"/></svg>',
    editar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>',
    excluir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
    detalhes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
};

function criarIconeAnuncio(nome, classe = "") {
    const icone = document.createElement("span");
    icone.className = `icone-anuncio ${classe}`.trim();
    icone.innerHTML = ICONES_ANUNCIOS[nome] || "";
    return icone;
}

function adicionarConteudoBotao(elemento, icone, texto) {
    elemento.replaceChildren(criarIconeAnuncio(icone), document.createTextNode(texto));
}

function mostrarModal(modal) {
    modal?.classList.remove("hidden");
}

function esconderModal(modal) {
    modal?.classList.add("hidden");
}

function criarBotaoAnunciar(callback, classeAdicional = "") {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `btn btn-primary btn-anunciar-servico ${classeAdicional}`.trim();

    const icone = document.createElement("span");
    icone.setAttribute("aria-hidden", "true");
    icone.textContent = "＋";
    botao.append(icone, "Criar Anúncio");
    botao.addEventListener("click", callback);
    return botao;
}

function criarEstadoVazio(onNovo) {
    const estadoVazio = document.createElement("div");
    estadoVazio.className = "meus-servicos-vazio";

    const icone = document.createElement("img");
    icone.src = "../img/Icone_Clipboard.png";
    icone.alt = "";
    icone.className = "meus-servicos-vazio-icone";

    const titulo = document.createElement("h2");
    titulo.textContent = "Você ainda não possui anúncios cadastrados.";

    const descricao = document.createElement("p");
    descricao.textContent = "Adicione seu primeiro anúncio para aparecer para clientes que estão procurando por você.";

    estadoVazio.append(
        icone,
        titulo,
        descricao,
        criarBotaoAnunciar(onNovo, "btn-anunciar-servico--empty")
    );
    return estadoVazio;
}

function criarCard(anuncio, callbacks) {
    const status = ["ATIVO", "OCULTO", "BANIDO"].includes(anuncio.status)
        ? anuncio.status
        : "";
    const tipo = anuncio.tipo === "SERVICO"
        ? "Serviço"
        : anuncio.tipo === "COMERCIO" ? "Comércio" : "Tipo não informado";
    const card = document.createElement("article");
    card.className = `card-servico${status ? ` card-servico--${status.toLowerCase()}` : ""}`;

    const midia = document.createElement("div");
    midia.className = "card-servico-midia";
    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.src = anuncio.fotoCapa || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    thumb.alt = anuncio.nome || "Anúncio";
    midia.appendChild(thumb);

    const info = document.createElement("div");
    info.className = "info";
    const titulo = document.createElement("h3");
    titulo.textContent = anuncio.nome || "(Sem título)";
    const linha = document.createElement("p");
    linha.textContent = anuncio.nomeUsuario || "";

    const metadados = document.createElement("div");
    metadados.className = "card-servico-metadados";
    const badgeTipo = document.createElement("span");
    badgeTipo.className = "card-servico-badge card-servico-badge--tipo";
    badgeTipo.textContent = tipo;
    metadados.appendChild(badgeTipo);
    if (status) {
        const badgeStatus = document.createElement("span");
        badgeStatus.className = `card-servico-badge card-servico-badge--${status.toLowerCase()}`;
        badgeStatus.textContent = status === "OCULTO" ? "Oculto" : status === "ATIVO" ? "Ativo" : "Banido";
        metadados.appendChild(badgeStatus);
    }

    const acoes = document.createElement("div");
    acoes.className = "acoes";
    const linkDetalhes = document.createElement("a");
    linkDetalhes.className = "card-servico-link";
    linkDetalhes.href = `anuncio.html?id=${encodeURIComponent(anuncio.id)}`;
    adicionarConteudoBotao(linkDetalhes, "detalhes", "Ver detalhes");

    if (status !== "BANIDO") {
        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        adicionarConteudoBotao(btnEditar, "editar", "Editar");
        btnEditar.addEventListener("click", () => callbacks.onEditar(anuncio));

        if (status === "ATIVO" || status === "OCULTO") {
            const btnStatus = document.createElement("button");
            btnStatus.type = "button";
            btnStatus.className = "btn-status-anuncio";
            adicionarConteudoBotao(
                btnStatus,
                status === "ATIVO" ? "pausar" : "ativar",
                status === "ATIVO" ? "Pausar" : "Ativar"
            );
            btnStatus.addEventListener("click", () => callbacks.onAlterarStatus(anuncio, btnStatus));
            acoes.appendChild(btnStatus);
        }

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "btn-excluir-anuncio";
        adicionarConteudoBotao(btnExcluir, "excluir", "Excluir");
        btnExcluir.addEventListener("click", () => callbacks.onExcluir(anuncio.id));
        acoes.append(btnEditar, btnExcluir);
    }

    const painelAcoes = document.createElement("div");
    painelAcoes.className = "card-servico-painel-acoes";
    painelAcoes.append(acoes, linkDetalhes);

    info.append(titulo, linha, metadados);
    card.append(midia, info, painelAcoes);

    if (status === "BANIDO") {
        const bloqueio = document.createElement("div");
        bloqueio.className = "card-servico-banido-overlay";
        bloqueio.setAttribute("aria-label", "Anúncio banido. Disponível somente para visualização.");
        const texto = document.createElement("strong");
        texto.textContent = "BANIDO";
        const descricao = document.createElement("span");
        descricao.textContent = "Somente leitura";
        linkDetalhes.classList.add("card-servico-link--banido");
        bloqueio.append(texto, descricao, linkDetalhes);
        card.appendChild(bloqueio);
    }
    return card;
}

function criarResumoAnuncios(lista) {
    const contagens = lista.reduce((resumo, anuncio) => {
        const status = String(anuncio?.status || "").toUpperCase();
        if (status === "ATIVO") resumo.ativos += 1;
        else if (status === "OCULTO") resumo.ocultos += 1;
        else if (status === "BANIDO") resumo.banidos += 1;
        return resumo;
    }, { ativos: 0, ocultos: 0, banidos: 0 });

    return [
        { chave: "total", rotulo: "Total de anúncios", valor: lista.length, detalhe: lista.length === 1 ? "anúncio publicado" : "anúncios publicados" },
        { chave: "ativo", rotulo: "Ativos", valor: contagens.ativos, detalhe: contagens.ativos === 1 ? "anúncio no ar" : "anúncios no ar" },
        { chave: "oculto", rotulo: "Pausados", valor: contagens.ocultos, detalhe: contagens.ocultos === 1 ? "anúncio oculto" : "anúncios ocultos" },
        { chave: "banido", rotulo: "Banidos", valor: contagens.banidos, detalhe: contagens.banidos === 1 ? "anúncio indisponível" : "anúncios indisponíveis" }
    ];
}

function renderizarResumo(elementoResumo, lista) {
    if (!elementoResumo) return;
    elementoResumo.innerHTML = "";
    criarResumoAnuncios(lista).forEach((item) => {
        const card = document.createElement("article");
        card.className = `resumo-anuncio resumo-anuncio--${item.chave}`;
        const icone = criarIconeAnuncio(item.chave, "resumo-anuncio-icone");
        const conteudo = document.createElement("div");
        const rotulo = document.createElement("p");
        rotulo.textContent = item.rotulo;
        const valor = document.createElement("strong");
        valor.textContent = String(item.valor);
        const detalhe = document.createElement("span");
        detalhe.textContent = item.detalhe;
        conteudo.append(rotulo, valor, detalhe);
        card.append(icone, conteudo);
        elementoResumo.appendChild(card);
    });
}

function renderizarLista(elementoGrid, lista, callbacks, elementoResumo, elementoContagem) {
    elementoGrid.innerHTML = "";
    const anuncios = Array.isArray(lista) ? lista : [];
    renderizarResumo(elementoResumo, anuncios);
    if (elementoContagem) elementoContagem.textContent = "";

    if (anuncios.length === 0) {
        elementoGrid.appendChild(criarEstadoVazio(callbacks.onNovo));
        return;
    }
    anuncios.forEach((anuncio) => elementoGrid.appendChild(criarCard(anuncio, callbacks)));
    if (elementoContagem) {
        elementoContagem.textContent = anuncios.length === 1
            ? "Mostrando 1 anúncio"
            : `Mostrando todos os ${anuncios.length} anúncios`;
    }
}

function renderizarPreviewFotos(fotos, elementoPreview, aoRemover) {
    if (!elementoPreview) return;
    elementoPreview.innerHTML = "";

    fotos.forEach((fotoBase64, index) => {
        const item = document.createElement("div");
        item.className = "foto-preview-item";

        if (index === 0) {
            const seloCapa = document.createElement("span");
            seloCapa.className = "foto-preview-capa";
            seloCapa.textContent = "Capa";
            item.appendChild(seloCapa);
        }

        const img = document.createElement("img");
        img.src = fotoBase64;
        img.alt = `Foto ${index + 1}`;

        const btnRemover = document.createElement("button");
        btnRemover.type = "button";
        btnRemover.className = "foto-preview-remover";
        btnRemover.textContent = "×";
        btnRemover.setAttribute("aria-label", `Remover foto ${index + 1}`);
        btnRemover.addEventListener("click", () => aoRemover(index));

        item.append(img, btnRemover);
        elementoPreview.appendChild(item);
    });
}

function renderizarPreviewFotosCadastro(elementoPreview) {
    renderizarPreviewFotos(fotosCadastroAtual, elementoPreview, (index) => {
        fotosCadastroAtual.splice(index, 1);
        renderizarPreviewFotosCadastro(elementoPreview);
    });
}

async function processarFotosCadastro(inputFotos, elementoPreview, feedbackElement) {
    if (!inputFotos?.files?.length) return;
    let arquivos = Array.from(inputFotos.files);

    if (arquivos.length > LIMITE_FOTOS) {
        Connecta.ui.mostrarFeedback(
            feedbackElement,
            `Máximo de ${LIMITE_FOTOS} fotos. Só as ${LIMITE_FOTOS} primeiras foram usadas.`,
            "error"
        );
        arquivos = arquivos.slice(0, LIMITE_FOTOS);
    }

    try {
        fotosCadastroAtual = await Promise.all(arquivos.map((arquivo) => Connecta.imagem.comprimir(arquivo)));
        renderizarPreviewFotosCadastro(elementoPreview);
    } catch (erro) {
        console.error("Erro ao processar fotos:", erro);
        Connecta.ui.mostrarFeedback(feedbackElement, "Não foi possível processar uma das fotos selecionadas.", "error");
    } finally {
        inputFotos.value = "";
    }
}

function obterFotosCadastroAtual() {
    return fotosCadastroAtual;
}

function limparFotosCadastro(elementoPreview) {
    fotosCadastroAtual = [];
    if (elementoPreview) elementoPreview.innerHTML = "";
}

function renderizarPreviewFotosEdicao(elementoPreview) {
    renderizarPreviewFotos(fotosEdicaoAtual, elementoPreview, (index) => {
        fotosEdicaoAtual.splice(index, 1);
        renderizarPreviewFotosEdicao(elementoPreview);
    });
}

function carregarFotosExistentes(fotos, elementoPreview) {
    fotosEdicaoAtual = Array.isArray(fotos)
        ? fotos.map((foto) => foto?.fotoBase64).filter(Boolean).slice(0, LIMITE_FOTOS)
        : [];
    renderizarPreviewFotosEdicao(elementoPreview);
}

async function adicionarFotosSelecionadas(inputFotos, elementoPreview) {
    if (!inputFotos?.files?.length) return;
    let arquivos = Array.from(inputFotos.files);
    const espacoDisponivel = LIMITE_FOTOS - fotosEdicaoAtual.length;

    if (espacoDisponivel <= 0) {
        Connecta.ui.alerta({
            titulo: "Limite Atingido",
            mensagem: `Você já atingiu o limite de ${LIMITE_FOTOS} fotos. Remova alguma antes de adicionar outra.`,
            kicker: "Atenção"
        });
        inputFotos.value = "";
        return;
    }
    if (arquivos.length > espacoDisponivel) {
        Connecta.ui.alerta({
            titulo: "Limite de Fotos",
            mensagem: `Só cabem mais ${espacoDisponivel} foto(s). As demais foram ignoradas.`,
            kicker: "Atenção"
        });
        arquivos = arquivos.slice(0, espacoDisponivel);
    }

    try {
        const comprimidas = await Promise.all(arquivos.map((arquivo) => Connecta.imagem.comprimir(arquivo)));
        fotosEdicaoAtual = fotosEdicaoAtual.concat(comprimidas);
        renderizarPreviewFotosEdicao(elementoPreview);
    } catch (erro) {
        console.error("Erro ao processar fotos:", erro);
        Connecta.ui.alerta({
            titulo: "Erro de Imagem",
            mensagem: "Não foi possível processar uma das fotos selecionadas.",
            kicker: "Erro"
        });
    } finally {
        inputFotos.value = "";
    }
}

function obterFotosEdicaoAtual() {
    return fotosEdicaoAtual;
}

function limparFotosEdicao(elementoPreview) {
    fotosEdicaoAtual = [];
    if (elementoPreview) elementoPreview.innerHTML = "";
}

function configurarMascaraTelefone(inputTelefone) {
    inputTelefone?.addEventListener("input", (event) => {
        let valor = event.target.value.replace(/\D/g, "").slice(0, 11);
        if (valor.length > 6) valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
        else if (valor.length > 2) valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        else if (valor.length > 0) valor = `(${valor}`;
        event.target.value = valor;
    });
}
