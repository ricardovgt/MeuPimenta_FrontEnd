function criarCardServico(servico) {
    const card = document.createElement("div");
    card.className = "servico-card clickable";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const fallbackImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    const img = document.createElement("img");
    img.src = servico.fotoCapa || fallbackImage;
    img.alt = servico.nome || "Serviço";
    img.className = "servico-foto";
    img.onerror = () => {
        img.onerror = null;
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
        if (servico.id) window.location.assign(`servico.html?id=${encodeURIComponent(servico.id)}`);
    });
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            card.click();
        }
    });

    return card;
}
