// Estado das fotos no formulário de edição (Base64 já prontas: existentes + novas comprimidas)
let fotosEdicaoAtual = [];
const LIMITE_FOTOS = 5;
const RESOLUCAO_MAXIMA = 800; // maior lado da imagem, em pixels
const QUALIDADE_JPEG = 0.7;

function mostrarModal(modal) {
    if (modal) modal.classList.remove("hidden");
}

function esconderModal(modal) {
    if (modal) modal.classList.add("hidden");
}

function criarCard(servico, callbacks) {
    const card = document.createElement("div");
    card.className = "card-servico";

    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.src = servico.fotoCapa || "../css/img/placeholder.png";
    thumb.alt = servico.nome || "servico";
    card.appendChild(thumb);

    const info = document.createElement("div");
    info.className = "info";

    const titulo = document.createElement("h3");
    titulo.textContent = servico.nome || "(Sem título)";
    info.appendChild(titulo);

    const linha = document.createElement("p");
    linha.textContent = servico.nomeUsuario || "";
    info.appendChild(linha);

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar Serviço";
    btnEditar.addEventListener("click", () => callbacks.onEditar(servico));
    acoes.appendChild(btnEditar);

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => callbacks.onExcluir(servico.id));
    acoes.appendChild(btnExcluir);

    info.appendChild(acoes);
    card.appendChild(info);

    return card;
}

function renderizarLista(elementoGrid, lista, callbacks) {
    elementoGrid.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Você ainda não possui serviços cadastrados.";
        elementoGrid.appendChild(p);
        return;
    }

    lista.forEach((servico) => {
        elementoGrid.appendChild(criarCard(servico, callbacks));
    });
}

// Lê o arquivo, desenha num canvas redimensionado e devolve o Base64 já comprimido (JPEG)
function comprimirImagem(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = (eventoLeitura) => {
            const imagem = new Image();

            imagem.onload = () => {
                let largura = imagem.width;
                let altura = imagem.height;

                if (largura > RESOLUCAO_MAXIMA || altura > RESOLUCAO_MAXIMA) {
                    if (largura > altura) {
                        altura = Math.round((altura * RESOLUCAO_MAXIMA) / largura);
                        largura = RESOLUCAO_MAXIMA;
                    } else {
                        largura = Math.round((largura * RESOLUCAO_MAXIMA) / altura);
                        altura = RESOLUCAO_MAXIMA;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = largura;
                canvas.height = altura;

                const contexto = canvas.getContext("2d");
                contexto.drawImage(imagem, 0, 0, largura, altura);

                resolve(canvas.toDataURL("image/jpeg", QUALIDADE_JPEG));
            };

            imagem.onerror = () => reject(new Error("Não foi possível ler esta imagem."));
            imagem.src = eventoLeitura.target.result;
        };

        leitor.onerror = () => reject(new Error("Não foi possível ler este arquivo."));
        leitor.readAsDataURL(arquivo);
    });
}

function renderizarPreviewFotosEdicao(elementoPreview) {
    if (!elementoPreview) return;

    elementoPreview.innerHTML = "";

    fotosEdicaoAtual.forEach((fotoBase64, index) => {
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
        item.appendChild(img);

        const btnRemover = document.createElement("button");
        btnRemover.type = "button";
        btnRemover.className = "foto-preview-remover";
        btnRemover.textContent = "×";
        btnRemover.setAttribute("aria-label", `Remover foto ${index + 1}`);
        btnRemover.addEventListener("click", () => {
            fotosEdicaoAtual.splice(index, 1);
            renderizarPreviewFotosEdicao(elementoPreview);
        });
        item.appendChild(btnRemover);

        elementoPreview.appendChild(item);
    });
}

// Pré-carrega as fotos que o serviço já tinha, quando o modal de edição é aberto
function carregarFotosExistentes(fotos, elementoPreview) {
    fotosEdicaoAtual = Array.isArray(fotos) ? fotos.map((f) => f.fotoBase64).filter(Boolean) : [];
    renderizarPreviewFotosEdicao(elementoPreview);
}

// Chamado quando o usuário escolhe novos arquivos: comprime e ACRESCENTA ao que já tem (até o limite)
async function adicionarFotosSelecionadas(inputFotos, elementoPreview) {
    if (!inputFotos || !inputFotos.files || inputFotos.files.length === 0) return;

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
        const comprimidas = await Promise.all(arquivos.map(comprimirImagem));
        fotosEdicaoAtual = fotosEdicaoAtual.concat(comprimidas);
        renderizarPreviewFotosEdicao(elementoPreview);
    } catch (erro) {
        console.error("Erro ao processar fotos:", erro);
        alert("Não foi possível processar uma das fotos selecionadas.");
    } finally {
        inputFotos.value = ""; // permite escolher o mesmo arquivo de novo, se precisar
    }
}

function obterFotosEdicaoAtual() {
    return fotosEdicaoAtual;
}

function limparFotosEdicao(elementoPreview) {
    fotosEdicaoAtual = [];
    if (elementoPreview) elementoPreview.innerHTML = "";
}