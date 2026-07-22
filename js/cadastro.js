document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cadastro");
    const feedbackDiv = document.getElementById("cadastro-feedback");

    if (!form || !feedbackDiv) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const labelOriginal = submitButton ? submitButton.textContent : "Cadastrar";

    const setSubmitting = (isSubmitting) => {
        if (!submitButton) return;
        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting ? "Cadastrando..." : labelOriginal;
    };

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (submitButton?.disabled) return;

        const formData = new FormData(form);
        const dadosFormatados = new URLSearchParams(formData);

        limparFeedback(feedbackDiv);
        setSubmitting(true);

        try {
            const response = await fetch("http://localhost:8080/connecta-api/usuario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: dadosFormatados
            });

            const { status, body } = await lerResposta(response);

            if (status === 201 && body?.token) {
                sessionStorage.setItem("tokenConnectaRO", body.token);
                mostrarFeedback(feedbackDiv, "Conta criada com sucesso! Redirecionando...", true);
                form.reset();

                setTimeout(() => {
                    window.location.assign("perfil.html");
                }, 1500);
                return;
            }

            mostrarFeedback(feedbackDiv, body?.erro || body?.mensagem || "Falha ao cadastrar.", false);
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