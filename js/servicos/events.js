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

function configurarBotaoAnunciar(sessao, elements) {
    elements.btnAnunciar?.addEventListener("click", async () => {
        if (!sessao) {
            window.location.assign("login.html");
            return;
        }

        const tipoConta = String(sessao.usuario?.tipoConta || "").toUpperCase();
        if (tipoConta === "COMERCIAL") {
            window.location.assign("meus_servicos.html?novo=1");
            return;
        }

        const desejaAlterarTipo = await Connecta.ui.confirmar({
            titulo: "Quer anunciar um serviço?",
            mensagem: "Para publicar anúncios, sua conta precisa ser do tipo Comercial.",
            textoConfirmar: "Tornar minha conta Comercial",
            textoCancelar: "Agora não",
            kicker: "Conta Comercial"
        });

        if (desejaAlterarTipo) {
            window.location.assign("perfil.html#form-tipo-conta");
        }
    });
}
