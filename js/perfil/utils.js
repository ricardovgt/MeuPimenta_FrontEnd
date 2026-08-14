const { limparFeedback, mostrarFeedback } = Connecta.ui;

function ocultarEmail(email) {
    const [username, domain] = email.split("@");

    if (!username || !domain) {
        return email;
    }

    return `${username[0]}...@${domain}`;
}

function comprimirImagemAvatar(arquivo) {
    return Connecta.imagem.comprimir(arquivo, {
        resolucaoMaxima: 400,
        qualidade: 0.7
    });
}
