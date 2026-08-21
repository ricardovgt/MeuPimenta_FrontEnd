function criarCardAnuncio(anuncio) {
    const card = document.createElement("div");
    card.className = "servico-card clickable";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const fallbackImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    const img = document.createElement("img");
    img.src = anuncio.fotoCapa || fallbackImage;
    img.alt = anuncio.nome || "Anúncio";
    img.className = "servico-foto";
    img.onerror = () => {
        img.onerror = null;
        img.src = fallbackImage;
    };

    const info = document.createElement("div");
    info.className = "servico-info";
    const title = document.createElement("h4");
    title.textContent = anuncio.nome || "Anúncio";
    const description = document.createElement("p");
    description.textContent = anuncio.descricao || "Sem descrição disponível.";

    const avaliacaoMedia = Math.max(0, Math.min(5, Number(anuncio.avaliacaoMedia) || 0));
    const totalAvaliacoes = Math.max(0, Number.parseInt(anuncio.totalAvaliacoes, 10) || 0);
    const textoQuantidade = totalAvaliacoes + " "
        + (totalAvaliacoes === 1 ? "avaliação" : "avaliações");
    const avaliacao = document.createElement("div");
    avaliacao.className = "servico-avaliacao";
    avaliacao.setAttribute(
        "aria-label",
        "Nota " + avaliacaoMedia.toFixed(1) + " de 5, " + textoQuantidade
    );

    const estrela = document.createElement("span");
    estrela.className = "servico-avaliacao-estrela";
    estrela.setAttribute("aria-hidden", "true");
    estrela.textContent = "★";

    const nota = document.createElement("span");
    nota.textContent = avaliacaoMedia.toFixed(1);

    const separador = document.createElement("span");
    separador.className = "servico-avaliacao-separador";
    separador.setAttribute("aria-hidden", "true");
    separador.textContent = "•";

    const quantidade = document.createElement("span");
    quantidade.textContent = textoQuantidade;

    avaliacao.append(estrela, nota, separador, quantidade);
    const meta = document.createElement("div");
    meta.className = "servico-meta";
    const badge = document.createElement("span");
    badge.className = "badge-link";
    badge.textContent = "Clique para ver mais";

    meta.appendChild(badge);
    info.append(title, description, avaliacao, meta);
    card.append(img, info);

    card.addEventListener("click", () => {
        if (anuncio.id) window.location.assign(`anuncio.html?id=${encodeURIComponent(anuncio.id)}`);
    });
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            card.click();
        }
    });

    return card;
}
