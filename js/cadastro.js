document.getElementById("form-cadastro").addEventListener("submit", function(event) {
    event.preventDefault(); 
    
    const form = this;
    const formData = new FormData(form);
    const dadosFormatados = new URLSearchParams(formData);
    const feedbackDiv = document.getElementById("cadastro-feedback");

    feedbackDiv.classList.add("hidden");
    feedbackDiv.textContent = "";

    fetch("http://localhost:8080/connecta-api/usuario", {
        method: "POST",
        body: dadosFormatados
    })

    .then(response => {
        return response.json().then(data => ({ status: response.status, body: data }));
    }) 
    .then(({ status, body }) => {
        if (status === 201) {
            
            localStorage.setItem("tokenConnectaRO", body.token); 

            
            mostrarFeedback(feedbackDiv, "Conta criada com sucesso! Redirecionando...", true);
            form.reset();
            
            // Redireciona para a home após 2 segundos
            setTimeout(() => {
                window.location.href = "perfil.html";
            }, 2000);
            
        } else {
            // Exibe o erro validado pelo backend (ex: e-mail já existe)
            mostrarFeedback(feedbackDiv, body.erro || "Falha ao cadastrar.", false);
        }
    })
    .catch(erro => {
        console.error("Erro na requisição:", erro);
        mostrarFeedback(feedbackDiv, "Não foi possível se comunicar com o servidor.", false);
    });
});

function mostrarFeedback(elemento, mensagem, sucesso) {
    elemento.textContent = mensagem;
    elemento.classList.remove("hidden");
    elemento.style.backgroundColor = sucesso ? "var(--accent-color)" : "#ef4444";
    elemento.style.color = "#fff";
}