function configurarNavegacao(elements) {
    if (elements.btnVoltar) {
        elements.btnVoltar.addEventListener("click", () => {
            window.location.assign("servicos.html");
        });
    }

    if (elements.btnHome) {
        elements.btnHome.addEventListener("click", () => {
            window.location.assign("perfil.html");
        });
    }
}

function configurarAvaliacoes(token, idServico, elements) {
    if (!elements.btnAvaliar) return;

    elements.btnAvaliar.addEventListener("click", () => {
        const painelExistente = document.querySelector(".avaliacao-form-panel");

        if (painelExistente) {
            painelExistente.remove();
            return;
        }

        mostrarModalAvaliacao(token, idServico, elements);
    });

    if (elements.btnCompartilhar) {
        elements.btnCompartilhar.addEventListener("click", async () => {
            const url = window.location.href;
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: document.title,
                        text: "Confira este serviço no MeuPimenta",
                        url
                    });
                    return;
                }

                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(url);
                    mostrarFeedback(elements.feedback, "Link copiado para a área de transferência.", "success");
                    return;
                }

                throw new Error("Compartilhamento indisponível");
            } catch {
                mostrarFeedback(elements.feedback, "Não foi possível compartilhar o link automaticamente.", "error");
            }
        });
    }
}