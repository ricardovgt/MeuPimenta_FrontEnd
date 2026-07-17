function configurarBotaoSair(btnSair) {
    if (!btnSair) return;

    btnSair.addEventListener("click", () => {
        const confirmar = confirm("Tem certeza que deseja sair?");
        if (confirmar) {
            fazerLogout();
        }
    });
}
