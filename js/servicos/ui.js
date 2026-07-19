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

    const imgSource = servico.fotoUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    card.innerHTML = `
        <img src="${imgSource}" alt="${servico.nome}" class="servico-foto" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
        <div class="servico-info">
            <h4>${servico.nome}</h4>
            <p>${servico.descricao || "Sem descrição disponível."}</p>
            <div class="servico-meta">
                <span class="badge-link">Clique para ver mais</span>
            </div>
        </div>
    `;

    card.addEventListener("click", () => {
        if (servico.id) {
            window.location.href = `servico.html?id=${encodeURIComponent(servico.id)}`;
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