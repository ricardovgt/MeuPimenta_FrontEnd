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
