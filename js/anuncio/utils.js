function obterIdUsuarioDoToken(jwt) {
    try {
        let payloadBase64 = jwt.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        payloadBase64 = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
        const payload = JSON.parse(decodeURIComponent(Array.from(atob(payloadBase64))
            .map((caractere) => `%${caractere.charCodeAt(0).toString(16).padStart(2, "0")}`)
            .join("")));
        return Number(payload.idUsuario ?? payload.id ?? payload.userId) || null;
    } catch {
        return null;
    }
}
