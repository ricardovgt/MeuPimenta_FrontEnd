document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login");
    const feedbackDiv = document.getElementById("login-feedback");

    if (!form || !feedbackDiv) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const labelOriginal = submitButton ? submitButton.textContent : "Entrar";

    const setSubmitting = (isSubmitting) => {
        if (!submitButton) return;
        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting ? "Entrando..." : labelOriginal;
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (submitButton?.disabled) return;

        const formData = new FormData(form);
        const dadosFormatados = new URLSearchParams(formData);

        limparFeedback(feedbackDiv);
        setSubmitting(true);

        try {
            const response = await fetch("http://localhost:8080/connecta-api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: dadosFormatados
            });

            const { status, body } = await lerResposta(response);

            if (status === 200 && body?.token) {
                sessionStorage.setItem("tokenConnectaRO", body.token);
                form.reset();
                window.location.assign("perfil.html");
                return;
            }

            mostrarFeedback(feedbackDiv, body?.erro || body?.mensagem || "Falha na autenticação.", false);
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            mostrarFeedback(feedbackDiv, "Não foi possível se comunicar com o servidor.", false);
        } finally {
            setSubmitting(false);
        }
    });
});

async function lerResposta(response) {
    const text = await response.text();

    if (!text) {
        return { status: response.status, body: {} };
    }

    try {
        return { status: response.status, body: JSON.parse(text) };
    } catch {
        return { status: response.status, body: { mensagem: text } };
    }
}

function limparFeedback(elemento) {
    elemento.className = "feedback-msg";
    elemento.classList.add("hidden");
    elemento.textContent = "";
}

function mostrarFeedback(elemento, mensagem, sucesso) {
    elemento.textContent = mensagem;
    elemento.className = "feedback-msg";
    elemento.classList.remove("hidden");
    elemento.classList.add(sucesso ? "success" : "error");
}