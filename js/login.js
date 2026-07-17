document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login");
    const feedbackDiv = document.getElementById("login-feedback");

    if (!form || !feedbackDiv) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const dadosFormatados = new URLSearchParams(formData);

        limparFeedback(feedbackDiv);

        try {
            const response = await fetch("http://localhost:8080/connecta-api/login", {
                method: "POST",
                body: dadosFormatados
            });

            const { status, body } = await response.json().then((data) => ({
                status: response.status,
                body: data
            }));

            if (status === 200) {
                localStorage.setItem("tokenConnectaRO", body.token);
                form.reset();
                window.location.href = "perfil.html";
                return;
            }

            mostrarFeedback(feedbackDiv, body.erro || "Falha na autenticação.", false);
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            mostrarFeedback(feedbackDiv, "Não foi possível se comunicar com o servidor.", false);
        }
    });
});

function limparFeedback(elemento) {
    elemento.classList.add("hidden");
    elemento.textContent = "";
}

function mostrarFeedback(elemento, mensagem, sucesso) {
    elemento.textContent = mensagem;
    elemento.classList.remove("hidden");
    elemento.style.backgroundColor = sucesso ? "var(--accent-color)" : "#ef4444";
    elemento.style.color = "#fff";
}