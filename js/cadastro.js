document.addEventListener("DOMContentLoaded", async () => {
    if (await Connecta.auth.validarSessao()) {
        window.location.assign("perfil.html");
        return;
    }

    const form = document.getElementById("form-cadastro");
    const feedback = document.getElementById("cadastro-feedback");
    if (!form || !feedback) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const labelOriginal = submitButton?.textContent || "Cadastrar";

    function definirEnvio(emAndamento) {
        if (!submitButton) return;
        submitButton.disabled = emAndamento;
        submitButton.textContent = emAndamento ? "Cadastrando..." : labelOriginal;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (submitButton?.disabled) return;

        Connecta.ui.limparFeedback(feedback);
        definirEnvio(true);

        try {
            const { status, body } = await Connecta.api.requisicao("usuario", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(new FormData(form))
            });

            if (status === 201 && body?.token) {
                Connecta.auth.salvarToken(body.token);
                Connecta.ui.mostrarFeedback(
                    feedback,
                    "Conta criada com sucesso! Redirecionando...",
                    "success"
                );
                form.reset();
                setTimeout(() => window.location.assign("perfil.html"), 1500);
                return;
            }

            Connecta.ui.mostrarFeedback(
                feedback,
                body?.erro || body?.mensagem || "Falha ao cadastrar.",
                "error"
            );
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            Connecta.ui.mostrarFeedback(feedback, "Não foi possível se comunicar com o servidor.", "error");
        } finally {
            definirEnvio(false);
        }
    });
});
