function exibirTodasAsCategorias(categoryCards) {
    categoryCards.forEach((card) => {
        card.style.display = "";
    });
}

function filtrarCategorias(categoryCards, termo) {
    const termoNormalizado = normalizarTexto(termo);

    if (!termoNormalizado) {
        exibirTodasAsCategorias(categoryCards);
        return true;
    }

    let encontrou = false;

    categoryCards.forEach((card) => {
        const textoCard = normalizarTexto(
            `${card.textContent} ${card.dataset.search || ""}`
        );
        const corresponde = textoCard.includes(termoNormalizado);

        card.style.display = corresponde ? "" : "none";
        encontrou = encontrou || corresponde;
    });

    return encontrou;
}

function avisarCategoriaNaoEncontrada(termo) {
    window.alert(`Não encontramos uma categoria para "${termo}".`);
}

function criarCardDestaque(anuncio) {
    const card = document.createElement("article");
    card.className = "featured-card";

    const imagem = document.createElement("img");
    const imagemPadrao = "../img/anuncio_not_found.png";
    const fotoCapa = typeof anuncio?.fotoCapa === "string"
        ? anuncio.fotoCapa.trim()
        : "";
    imagem.className = "featured-image";
    imagem.src = fotoCapa || imagemPadrao;
    imagem.alt = anuncio?.nome ? `Foto de ${anuncio.nome}` : "Foto do anúncio";
    if (!fotoCapa) imagem.classList.add("featured-image--fallback");
    imagem.onerror = () => {
        imagem.onerror = null;
        imagem.src = imagemPadrao;
        imagem.classList.add("featured-image--fallback");
    };

    const conteudo = document.createElement("div");
    conteudo.className = "featured-content";

    const tipo = document.createElement("span");
    tipo.className = "featured-tag";
    tipo.textContent = anuncio?.tipo === "COMERCIO"
        ? "Comércio"
        : anuncio?.tipo === "SERVICO" ? "Serviço" : "Destaque";

    const titulo = document.createElement("h3");
    titulo.textContent = anuncio?.nome || "Anúncio em destaque";

    const descricao = document.createElement("p");
    descricao.textContent = anuncio?.descricao || "Confira este anúncio em destaque.";

    const link = document.createElement("a");
    link.textContent = "Ver anúncio →";
    link.href = anuncio?.id
        ? `anuncio.html?id=${encodeURIComponent(anuncio.id)}`
        : "anuncios.html";

    conteudo.append(tipo, titulo, descricao, link);
    card.append(imagem, conteudo);
    return card;
}

function exibirStatusDestaques(grid, mensagem) {
    if (!grid) return;

    const status = document.createElement("p");
    status.className = "featured-status";
    status.textContent = mensagem;
    grid.replaceChildren(status);
}

function exibirDestaques(grid, anuncios) {
    if (!grid) return;

    const lista = Array.isArray(anuncios)
        ? anuncios
        : Array.isArray(anuncios?.anuncios) ? anuncios.anuncios : [anuncios];
    const destaques = lista.filter((anuncio) => anuncio && typeof anuncio === "object").slice(0, 3);

    if (destaques.length === 0) {
        exibirStatusDestaques(grid, "Nenhum anúncio em destaque no momento.");
        return;
    }

    grid.replaceChildren(...destaques.map(criarCardDestaque));
}

async function carregarEExibirDestaques(elements) {
    try {
        const { status, body } = await carregarAnunciosDestaque();
        if (status !== 200) {
            exibirStatusDestaques(
                elements.featuredGrid,
                body?.erro || "Não foi possível carregar os destaques."
            );
            return;
        }

        exibirDestaques(elements.featuredGrid, body);
    } catch (erro) {
        console.error("Erro ao carregar anúncios em destaque:", erro);
        exibirStatusDestaques(elements.featuredGrid, "Não foi possível carregar os destaques.");
    }
}
