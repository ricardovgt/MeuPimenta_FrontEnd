function ocultarEmail(email) {
    const [username, domain] = email.split("@");

    if (!username || !domain) {
        return email;
    }

    return `${username[0]}...@${domain}`;
}

function fazerLogout() {
    sessionStorage.removeItem("tokenConnectaRO");
    window.location.assign("login.html");
}

const RESOLUCAO_MAXIMA_AVATAR = 400;
const QUALIDADE_JPEG_AVATAR = 0.7;

function comprimirImagemAvatar(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = (eventoLeitura) => {
            const imagem = new Image();

            imagem.onload = () => {
                let largura = imagem.width;
                let altura = imagem.height;

                if (largura > RESOLUCAO_MAXIMA_AVATAR || altura > RESOLUCAO_MAXIMA_AVATAR) {
                    if (largura > altura) {
                        altura = Math.round((altura * RESOLUCAO_MAXIMA_AVATAR) / largura);
                        largura = RESOLUCAO_MAXIMA_AVATAR;
                    } else {
                        largura = Math.round((largura * RESOLUCAO_MAXIMA_AVATAR) / altura);
                        altura = RESOLUCAO_MAXIMA_AVATAR;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = largura;
                canvas.height = altura;

                const contexto = canvas.getContext("2d");
                contexto.drawImage(imagem, 0, 0, largura, altura);

                resolve(canvas.toDataURL("image/jpeg", QUALIDADE_JPEG_AVATAR));
            };

            imagem.onerror = () => reject(new Error("Não foi possível ler esta imagem."));
            imagem.src = eventoLeitura.target.result;
        };

        leitor.onerror = () => reject(new Error("Não foi possível ler este arquivo."));
        leitor.readAsDataURL(arquivo);
    });
}

function limparFeedback(elemento) {
    if (!elemento) return;
    elemento.className = "feedback-msg";
    elemento.classList.add("hidden");
    elemento.textContent = "";
}

function mostrarFeedback(elemento, mensagem, tipo = "error") {
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.remove("hidden");
    elemento.className = "feedback-msg";
    if (tipo === "success") elemento.classList.add("success");
    else if (tipo === "error") elemento.classList.add("error");
}
