(function iniciarConnectaGlobal(window) {
    "use strict";

    const API_BASE_URL = "http://localhost:8080/connecta-api";
    const TOKEN_STORAGE_KEY = "tokenConnectaRO";
    const MENSAGEM_CONTA_BANIDA = "Sua conta foi banida por violação das regras de conduta.";
    let sessaoValidada = null;
    let validacaoSessaoPendente = null;

    function criarUrl(caminho, parametros = {}) {
        const url = new URL(`${API_BASE_URL}/${String(caminho).replace(/^\/+/, "")}`);
        Object.entries(parametros).forEach(([chave, valor]) => {
            if (valor !== undefined && valor !== null && valor !== "") {
                url.searchParams.set(chave, String(valor));
            }
        });
        return url;
    }

    function normalizarToken(token) {
        return String(token || "").trim().replace(/^Bearer\s+/i, "");
    }

    function tokenExpirado(token) {
        try {
            let payloadBase64 = token.split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            payloadBase64 = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
            const payload = JSON.parse(atob(payloadBase64));
            return Boolean(payload.exp) && Date.now() >= Number(payload.exp) * 1000;
        } catch {
            return false;
        }
    }

    function salvarToken(token) {
        const tokenNormalizado = normalizarToken(token);
        if (!tokenNormalizado) return null;
        if (tokenExpirado(tokenNormalizado)) {
            removerToken();
            return null;
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenNormalizado);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessaoValidada = null;
        validacaoSessaoPendente = null;
        return tokenNormalizado;
    }

    function obterToken() {
        const tokenPersistente = normalizarToken(localStorage.getItem(TOKEN_STORAGE_KEY));
        if (tokenPersistente) {
            if (tokenExpirado(tokenPersistente)) {
                removerToken();
                return null;
            }
            return tokenPersistente;
        }

        const tokenLegado = normalizarToken(sessionStorage.getItem(TOKEN_STORAGE_KEY));
        return tokenLegado ? salvarToken(tokenLegado) : null;
    }

    function removerToken() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessaoValidada = null;
        validacaoSessaoPendente = null;
    }

    function respostaContaBanida(status, body) {
        const mensagem = body?.erro || body?.mensagem;
        return status === 403 && mensagem === MENSAGEM_CONTA_BANIDA;
    }

    function respostaUsuarioValida(status, body) {
        return status === 200
            && body
            && typeof body === "object"
            && !body.erro
            && typeof body.email === "string"
            && body.email.trim() !== "";
    }

    async function validarSessao() {
        const token = obterToken();
        if (!token) return null;
        if (sessaoValidada?.token === token) return sessaoValidada;
        if (validacaoSessaoPendente) return validacaoSessaoPendente;

        validacaoSessaoPendente = requisicao("usuario", { method: "GET", token })
            .then(({ status, body }) => {
                if (respostaUsuarioValida(status, body)) {
                    sessaoValidada = { token, usuario: body };
                    return sessaoValidada;
                }

                const respostaInvalidaDoUsuario = status === 200;
                const erroClienteNaoProibido = status >= 400 && status < 500 && status !== 403;
                if (erroClienteNaoProibido || respostaContaBanida(status, body) || respostaInvalidaDoUsuario) {
                    removerToken();
                }
                return null;
            })
            .catch((erro) => {
                console.error("Não foi possível validar a sessão:", erro);
                return null;
            })
            .finally(() => {
                validacaoSessaoPendente = null;
            });

        return validacaoSessaoPendente;
    }

    async function revalidarSessao() {
        sessaoValidada = null;
        validacaoSessaoPendente = null;
        return validarSessao();
    }

    async function respostaSessaoEncerrada(status, body) {
        if (respostaContaBanida(status, body)) return true;
        if (status !== 401) return false;
        if (!obterToken()) return true;
        return !(await revalidarSessao());
    }

    async function exigirSessao() {
        const sessao = await validarSessao();
        if (!sessao) {
            window.location.assign("login.html");
            return null;
        }
        return sessao;
    }

    function fazerLogout() {
        removerToken();
        window.location.assign("login.html");
    }

    function obterHeadersAutorizacao(token, headers = {}) {
        return {
            Authorization: `Bearer ${normalizarToken(token)}`,
            Accept: "application/json",
            ...headers
        };
    }

    async function lerResposta(response) {
        const texto = await response.text();
        if (!texto) return { status: response.status, body: {} };
        try {
            return { status: response.status, body: JSON.parse(texto) };
        } catch {
            return { status: response.status, body: { mensagem: texto } };
        }
    }

    async function requisicao(caminho, opcoes = {}) {
        const { token, parametros, headers = {}, ...fetchOptions } = opcoes;
        const requestHeaders = token
            ? obterHeadersAutorizacao(token, headers)
            : { Accept: "application/json", ...headers };
        const response = await fetch(criarUrl(caminho, parametros), {
            ...fetchOptions,
            headers: requestHeaders
        });
        const resultado = await lerResposta(response);
        if (token && respostaContaBanida(resultado.status, resultado.body)) {
            removerToken();
            window.dispatchEvent(new CustomEvent("connecta:sessao-encerrada", {
                detail: { motivo: "CONTA_BANIDA", mensagem: MENSAGEM_CONTA_BANIDA }
            }));
        }
        return resultado;
    }

    function limparFeedback(elemento) {
        if (!elemento) return;
        elemento.className = "feedback-msg hidden";
        elemento.textContent = "";
    }

    function mostrarFeedback(elemento, mensagem, tipo = "error") {
        if (!elemento) return;
        elemento.className = `feedback-msg ${tipo}`;
        elemento.textContent = mensagem;
    }

    function configurarContadoresCaracteres(raiz = document) {
        raiz.querySelectorAll(".modal-campo-counter").forEach((contador) => {
            const input = document.getElementById(contador.dataset.target);
            const maximo = Number(contador.dataset.max);
            if (!input || !maximo) return;

            const atualizar = () => {
                const tamanho = input.value.length;
                contador.textContent = `${tamanho}/${maximo}`;
                contador.classList.toggle("modal-campo-counter--warn", tamanho >= maximo * 0.9);
            };
            input.addEventListener("input", atualizar);
            atualizar();
        });
    }

    function comprimirImagem(arquivo, opcoes = {}) {
        const { resolucaoMaxima = 800, qualidade = 0.7 } = opcoes;
        return new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onload = (eventoLeitura) => {
                const imagem = new Image();
                imagem.onload = () => {
                    let largura = imagem.width;
                    let altura = imagem.height;
                    if (largura > resolucaoMaxima || altura > resolucaoMaxima) {
                        if (largura > altura) {
                            altura = Math.round((altura * resolucaoMaxima) / largura);
                            largura = resolucaoMaxima;
                        } else {
                            largura = Math.round((largura * resolucaoMaxima) / altura);
                            altura = resolucaoMaxima;
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = largura;
                    canvas.height = altura;
                    canvas.getContext("2d").drawImage(imagem, 0, 0, largura, altura);
                    resolve(canvas.toDataURL("image/jpeg", qualidade));
                };
                imagem.onerror = () => reject(new Error("Não foi possível ler esta imagem."));
                imagem.src = eventoLeitura.target.result;
            };
            leitor.onerror = () => reject(new Error("Não foi possível ler este arquivo."));
            leitor.readAsDataURL(arquivo);
        });
    }

    function criarOuObterModalEstilizado() {
        let overlay = document.getElementById("connecta-custom-modal");
        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = "connecta-custom-modal";
        overlay.className = "connecta-modal-overlay hidden";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.innerHTML = `
            <div class="connecta-modal-card">
                <p id="connecta-modal-kicker" class="connecta-modal-kicker"></p>
                <h2 id="connecta-modal-title" class="connecta-modal-title"></h2>
                <p id="connecta-modal-message" class="connecta-modal-message"></p>
                <div id="connecta-modal-confirmacao-digitada" class="connecta-modal-confirmacao-digitada hidden">
                    <label for="connecta-modal-confirmacao-input"></label>
                    <input id="connecta-modal-confirmacao-input" type="text" autocomplete="off" spellcheck="false">
                </div>
                <div class="connecta-modal-actions">
                    <button type="button" id="connecta-modal-btn-cancel" class="btn-connecta-modal-cancel"></button>
                    <button type="button" id="connecta-modal-btn-confirm" class="btn-connecta-modal-confirm"></button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    function confirmar(opcoes) {
        const config = typeof opcoes === "string" ? { mensagem: opcoes } : (opcoes || {});
        const titulo = config.titulo || "Confirmação";
        const mensagem = config.mensagem || "Tem certeza que deseja prosseguir?";
        const textoConfirmar = config.textoConfirmar || "Confirmar";
        const textoCancelar = config.textoCancelar || "Cancelar";
        const kicker = config.kicker || "Ação Sensível";
        const textoConfirmacao = String(config.textoConfirmacao || "");

        const modal = criarOuObterModalEstilizado();
        const kickerEl = modal.querySelector("#connecta-modal-kicker");
        const titleEl = modal.querySelector("#connecta-modal-title");
        const messageEl = modal.querySelector("#connecta-modal-message");
        const confirmacaoDigitadaEl = modal.querySelector("#connecta-modal-confirmacao-digitada");
        const confirmacaoLabel = confirmacaoDigitadaEl.querySelector("label");
        const confirmacaoInput = modal.querySelector("#connecta-modal-confirmacao-input");
        const btnCancel = modal.querySelector("#connecta-modal-btn-cancel");
        const btnConfirm = modal.querySelector("#connecta-modal-btn-confirm");

        kickerEl.textContent = kicker;
        titleEl.textContent = titulo;
        messageEl.textContent = mensagem;
        btnCancel.textContent = textoCancelar;
        btnConfirm.textContent = textoConfirmar;
        btnCancel.style.display = "";
        confirmacaoDigitadaEl.classList.toggle("hidden", !textoConfirmacao);
        confirmacaoLabel.textContent = textoConfirmacao
            ? `Digite "${textoConfirmacao}" para confirmar:`
            : "";
        confirmacaoInput.value = "";
        confirmacaoInput.placeholder = textoConfirmacao;
        btnConfirm.disabled = Boolean(textoConfirmacao);

        modal.classList.remove("hidden");
        if (textoConfirmacao) {
            confirmacaoInput.focus();
        } else {
            btnConfirm.focus();
        }

        return new Promise((resolve) => {
            function atualizarConfirmacaoDigitada() {
                btnConfirm.disabled = confirmacaoInput.value.trim() !== textoConfirmacao;
            }

            function fechar(resultado) {
                modal.classList.add("hidden");
                btnConfirm.removeEventListener("click", onConfirm);
                btnCancel.removeEventListener("click", onCancel);
                confirmacaoInput.removeEventListener("input", atualizarConfirmacaoDigitada);
                modal.removeEventListener("click", onOverlayClick);
                document.removeEventListener("keydown", onKeyDown);
                resolve(resultado);
            }

            function onConfirm() { fechar(true); }
            function onCancel() { fechar(false); }
            function onOverlayClick(e) { if (e.target === modal) fechar(false); }
            function onKeyDown(e) {
                if (e.key === "Escape") fechar(false);
                if (e.key === "Enter" && textoConfirmacao && !btnConfirm.disabled) fechar(true);
            }

            btnConfirm.addEventListener("click", onConfirm);
            btnCancel.addEventListener("click", onCancel);
            confirmacaoInput.addEventListener("input", atualizarConfirmacaoDigitada);
            modal.addEventListener("click", onOverlayClick);
            document.addEventListener("keydown", onKeyDown);
        });
    }

    function alerta(opcoes) {
        const config = typeof opcoes === "string" ? { mensagem: opcoes } : (opcoes || {});
        const titulo = config.titulo || "Aviso";
        const mensagem = config.mensagem || "";
        const textoBotao = config.textoBotao || "OK";
        const kicker = config.kicker || "Notificação";

        const modal = criarOuObterModalEstilizado();
        const kickerEl = modal.querySelector("#connecta-modal-kicker");
        const titleEl = modal.querySelector("#connecta-modal-title");
        const messageEl = modal.querySelector("#connecta-modal-message");
        const confirmacaoDigitadaEl = modal.querySelector("#connecta-modal-confirmacao-digitada");
        const confirmacaoInput = modal.querySelector("#connecta-modal-confirmacao-input");
        const btnCancel = modal.querySelector("#connecta-modal-btn-cancel");
        const btnConfirm = modal.querySelector("#connecta-modal-btn-confirm");

        kickerEl.textContent = kicker;
        titleEl.textContent = titulo;
        messageEl.textContent = mensagem;
        btnConfirm.textContent = textoBotao;
        btnCancel.style.display = "none";
        confirmacaoDigitadaEl.classList.add("hidden");
        confirmacaoInput.value = "";
        btnConfirm.disabled = false;

        modal.classList.remove("hidden");
        btnConfirm.focus();

        return new Promise((resolve) => {
            function fechar() {
                modal.classList.add("hidden");
                btnConfirm.removeEventListener("click", onConfirm);
                modal.removeEventListener("click", onOverlayClick);
                document.removeEventListener("keydown", onKeyDown);
                resolve();
            }

            function onConfirm() { fechar(); }
            function onOverlayClick(e) { if (e.target === modal) fechar(); }
            function onKeyDown(e) {
                if (e.key === "Escape" || e.key === "Enter") fechar();
            }

            btnConfirm.addEventListener("click", onConfirm);
            modal.addEventListener("click", onOverlayClick);
            document.addEventListener("keydown", onKeyDown);
        });
    }

    window.Connecta = Object.freeze({
        config: Object.freeze({ API_BASE_URL, TOKEN_STORAGE_KEY }),
        api: Object.freeze({ criarUrl, requisicao }),
        auth: Object.freeze({
            exigirSessao,
            fazerLogout,
            obterHeadersAutorizacao,
            obterToken,
            removerToken,
            respostaContaBanida,
            respostaSessaoEncerrada,
            revalidarSessao,
            salvarToken,
            validarSessao
        }),
        imagem: Object.freeze({ comprimir: comprimirImagem }),
        ui: Object.freeze({ alerta, confirmar, configurarContadoresCaracteres, limparFeedback, mostrarFeedback })
    });
}(window));
