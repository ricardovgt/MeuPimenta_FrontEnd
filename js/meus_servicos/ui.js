let fotosCadastroAtual = [];
let fotosEdicaoAtual = [];
const LIMITE_FOTOS = 5;

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

function criarCard(servico, callbacks) {
    const status = ["ATIVO", "OCULTO", "BANIDO"].includes(servico.status)
        ? servico.status
        : "";
    const tipo = servico.tipo === "SERVICO"
        ? "Serviço"
        : servico.tipo === "COMERCIO" ? "Comércio" : "Tipo não informado";
    const card = document.createElement("article");
    card.className = `card-servico${status ? ` card-servico--${status.toLowerCase()}` : ""}`;

    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.src = servico.fotoCapa || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    thumb.alt = servico.nome || "Anúncio";

    const info = document.createElement("div");
    info.className = "info";
    const titulo = document.createElement("h3");
    titulo.textContent = servico.nome || "(Sem título)";
    const linha = document.createElement("p");
    linha.textContent = servico.nomeUsuario || "";

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
    linkDetalhes.href = `servico.html?id=${encodeURIComponent(servico.id)}`;
    linkDetalhes.textContent = "Ver detalhes";

    if (status !== "BANIDO") {
        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.textContent = "Editar Anúncio";
        btnEditar.addEventListener("click", () => callbacks.onEditar(servico));

        if (status === "ATIVO" || status === "OCULTO") {
            const btnStatus = document.createElement("button");
            btnStatus.type = "button";
            btnStatus.className = "btn-status-anuncio";
            btnStatus.textContent = status === "ATIVO" ? "Pausar" : "Reativar";
            btnStatus.addEventListener("click", () => callbacks.onAlterarStatus(servico, btnStatus));
            acoes.appendChild(btnStatus);
        }

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => callbacks.onExcluir(servico.id));
        acoes.append(btnEditar, btnExcluir, linkDetalhes);
    }

    info.append(titulo, linha, metadados, acoes);
    card.append(thumb, info);

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

function renderizarLista(elementoGrid, lista, callbacks) {
    elementoGrid.innerHTML = "";
    if (!Array.isArray(lista) || lista.length === 0) {
        elementoGrid.appendChild(criarEstadoVazio(callbacks.onNovo));
        return;
    }
    lista.forEach((servico) => elementoGrid.appendChild(criarCard(servico, callbacks)));
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
