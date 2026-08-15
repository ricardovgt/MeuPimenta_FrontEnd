document.addEventListener("DOMContentLoaded", async () => {
    if (await Connecta.auth.validarSessao()) {
        window.location.assign("perfil.html");
        return;
    }

    const form = document.getElementById("form-login");
    const feedback = document.getElementById("login-feedback");
    if (!form || !feedback) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const labelOriginal = submitButton?.textContent || "Entrar";

    function definirEnvio(emAndamento) {
        if (!submitButton) return;
        submitButton.disabled = emAndamento;
        submitButton.textContent = emAndamento ? "Entrando..." : labelOriginal;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (submitButton?.disabled) return;

        Connecta.ui.limparFeedback(feedback);
        definirEnvio(true);

        try {
            const { status, body } = await Connecta.api.requisicao("login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(new FormData(form))
            });

            if (status === 200 && body?.token) {
                Connecta.auth.salvarToken(body.token);
                form.reset();
                window.location.assign("perfil.html");
                return;
            }

            Connecta.ui.mostrarFeedback(
                feedback,
                body?.erro || body?.mensagem || "Falha na autenticação.",
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
