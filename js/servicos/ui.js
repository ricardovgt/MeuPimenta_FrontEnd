// Estado das fotos escolhidas no formulário de cadastro (já comprimidas em Base64)
let fotosSelecionadas = [];
const LIMITE_FOTOS = 5;
const RESOLUCAO_MAXIMA = 800; // maior lado da imagem, em pixels
const QUALIDADE_JPEG = 0.7;

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

// Redesenha as miniaturas de preview a partir de fotosSelecionadas
function renderizarPreviewFotos(elementoPreview) {
    if (!elementoPreview) return;

    elementoPreview.innerHTML = "";

    fotosSelecionadas.forEach((fotoBase64, index) => {
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
            fotosSelecionadas.splice(index, 1);
            renderizarPreviewFotos(elementoPreview);
        });
        item.appendChild(btnRemover);

        elementoPreview.appendChild(item);
    });
}

// Chamada quando o usuário escolhe arquivos no input; comprime tudo antes de guardar
async function processarFotosSelecionadas(inputFotos, elementoPreview, feedbackElement) {
    if (!inputFotos || !inputFotos.files || inputFotos.files.length === 0) return;

    let arquivos = Array.from(inputFotos.files);

    if (arquivos.length > LIMITE_FOTOS) {
        mostrarFeedback(feedbackElement, `Máximo de ${LIMITE_FOTOS} fotos. Só as ${LIMITE_FOTOS} primeiras foram usadas.`, "error");
        arquivos = arquivos.slice(0, LIMITE_FOTOS);
    }

    try {
        fotosSelecionadas = await Promise.all(arquivos.map(comprimirImagem));
        renderizarPreviewFotos(elementoPreview);
    } catch (erro) {
        console.error("Erro ao processar fotos:", erro);
        mostrarFeedback(feedbackElement, "Não foi possível processar uma das fotos selecionadas.", "error");
    }
}

function limparFotosSelecionadas(elementoPreview) {
    fotosSelecionadas = [];
    if (elementoPreview) elementoPreview.innerHTML = "";
}

function limparFeedback(elemento) {
    if (!elemento) return;

    elemento.className = "feedback-msg";
    elemento.classList.add("hidden");
    elemento.textContent = "";
}

function mostrarFeedback(elemento, mensagem, tipo = "error") {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.classList.remove("hidden");
    elemento.className = "feedback-msg";

    if (tipo === "success") {
        elemento.classList.add("success");
    } else if (tipo === "error") {
        elemento.classList.add("error");
    }
}

function criarCardServico(servico) {
    const card = document.createElement("div");
    card.className = "servico-card clickable";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const imgSource = servico.fotoCapa || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    const fallbackImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    const img = document.createElement("img");
    img.src = imgSource;
    img.alt = servico.nome || "Serviço";
    img.className = "servico-foto";
    img.onerror = () => {
        img.src = fallbackImage;
    };

    const info = document.createElement("div");
    info.className = "servico-info";

    const title = document.createElement("h4");
    title.textContent = servico.nome || "Serviço";

    const description = document.createElement("p");
    description.textContent = servico.descricao || "Sem descrição disponível.";

    const meta = document.createElement("div");
    meta.className = "servico-meta";

    const badge = document.createElement("span");
    badge.className = "badge-link";
    badge.textContent = "Clique para ver mais";

    meta.appendChild(badge);
    info.append(title, description, meta);
    card.append(img, info);

    card.addEventListener("click", () => {
        if (servico.id) {
            window.location.assign(`servico.html?id=${encodeURIComponent(servico.id)}`);
        }
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            card.click();
        }
    });

    return card;
}

function configurarMascaraTelefone(inputTelefone) {
    if (!inputTelefone) return;

    inputTelefone.addEventListener("input", (event) => {
        let value = event.target.value.replace(/\D/g, "");

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length > 6) {
            event.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            event.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            event.target.value = `(${value}`;
        }
    });
}