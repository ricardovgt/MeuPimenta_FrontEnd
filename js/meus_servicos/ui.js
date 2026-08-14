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
    botao.append(icone, "Anunciar Serviço");
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
    titulo.textContent = "Você ainda não possui serviços cadastrados.";

    const descricao = document.createElement("p");
    descricao.textContent = "Adicione seu primeiro serviço para aparecer para clientes que estão procurando por você.";

    estadoVazio.append(
        icone,
        titulo,
        descricao,
        criarBotaoAnunciar(onNovo, "btn-anunciar-servico--empty")
    );
    return estadoVazio;
}

function criarCard(servico, callbacks) {
    const card = document.createElement("div");
    card.className = "card-servico";

    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.src = servico.fotoCapa || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    thumb.alt = servico.nome || "Serviço";

    const info = document.createElement("div");
    info.className = "info";
    const titulo = document.createElement("h3");
    titulo.textContent = servico.nome || "(Sem título)";
    const linha = document.createElement("p");
    linha.textContent = servico.nomeUsuario || "";

    const acoes = document.createElement("div");
    acoes.className = "acoes";
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar Serviço";
    btnEditar.addEventListener("click", () => callbacks.onEditar(servico));
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => callbacks.onExcluir(servico.id));

    acoes.append(btnEditar, btnExcluir);
    info.append(titulo, linha, acoes);
    card.append(thumb, info);
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
    fotosEdicaoAtual = Array.isArray(fotos) ? fotos.map((foto) => foto.fotoBase64).filter(Boolean) : [];
    renderizarPreviewFotosEdicao(elementoPreview);
}

async function adicionarFotosSelecionadas(inputFotos, elementoPreview) {
    if (!inputFotos?.files?.length) return;
    let arquivos = Array.from(inputFotos.files);
    const espacoDisponivel = LIMITE_FOTOS - fotosEdicaoAtual.length;

    if (espacoDisponivel <= 0) {
        alert(`Você já atingiu o limite de ${LIMITE_FOTOS} fotos. Remova alguma antes de adicionar outra.`);
        inputFotos.value = "";
        return;
    }
    if (arquivos.length > espacoDisponivel) {
        alert(`Só cabem mais ${espacoDisponivel} foto(s). As demais foram ignoradas.`);
        arquivos = arquivos.slice(0, espacoDisponivel);
    }

    try {
        const comprimidas = await Promise.all(arquivos.map((arquivo) => Connecta.imagem.comprimir(arquivo)));
        fotosEdicaoAtual = fotosEdicaoAtual.concat(comprimidas);
        renderizarPreviewFotosEdicao(elementoPreview);
    } catch (erro) {
        console.error("Erro ao processar fotos:", erro);
        alert("Não foi possível processar uma das fotos selecionadas.");
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
