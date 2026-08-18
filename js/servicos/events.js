function atualizarListaServicos(token, elements, top = false, busca = "", tipo = "") {
    const grid = elements.gridServicos;
    if (!grid) return Promise.resolve();

    return carregarServicos(token, top, busca, tipo)
        .then(({ status, body }) => {
            grid.innerHTML = "";
            if (status !== 200) {
                const mensagem = document.createElement("p");
                mensagem.textContent = body?.erro || "Não foi possível carregar os anúncios.";
                grid.appendChild(mensagem);
                return;
            }

            const lista = Array.isArray(body) ? body : [];
            if (lista.length === 0) {
                const mensagem = document.createElement("p");
                mensagem.textContent = "Nenhum anúncio encontrado com esses filtros.";
                grid.appendChild(mensagem);
                return;
            }
            lista.forEach((servico) => grid.appendChild(criarCardServico(servico)));
        })
        .catch((erro) => console.error("Erro ao buscar anúncios:", erro));
}

function configurarFiltros(token, elements) {
    elements.formFiltros?.addEventListener("submit", (event) => {
        event.preventDefault();
        atualizarListaServicos(
            token,
            elements,
            elements.filtroTop?.checked || false,
            elements.filtroBusca?.value || "",
            elements.filtroTipo?.value || ""
        );
    });

    elements.btnLimparFiltros?.addEventListener("click", () => {
        if (elements.filtroTop) elements.filtroTop.checked = false;
        if (elements.filtroBusca) elements.filtroBusca.value = "";
        if (elements.filtroTipo) elements.filtroTipo.value = "";
        atualizarListaServicos(token, elements);
    });

    atualizarListaServicos(token, elements);
}
