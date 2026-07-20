function configurarNavegacao(elements) {
    if (elements.btnVoltar) {
        elements.btnVoltar.addEventListener("click", () => {
            window.location.href = "servicos.html";
        });
    }

    if (elements.btnHome) {
        elements.btnHome.addEventListener("click", () => {
            window.location.href = "perfil.html";
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
                await navigator.clipboard.writeText(url);
                mostrarFeedback(elements.feedback, "Link copiado para a área de transferência.", "success");
            } catch {
                mostrarFeedback(elements.feedback, "Não foi possível copiar o link automaticamente.", "error");
            }
        });
    }
}