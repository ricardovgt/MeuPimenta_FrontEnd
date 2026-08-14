(function iniciarConnectaGlobal(window) {
    "use strict";

    const API_BASE_URL = "http://localhost:8080/connecta-api";
    const TOKEN_STORAGE_KEY = "tokenConnectaRO";

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

    function obterToken() {
        return normalizarToken(sessionStorage.getItem(TOKEN_STORAGE_KEY));
    }

    function exigirToken() {
        const token = obterToken();
        if (!token) {
            window.location.assign("login.html");
            return null;
        }
        return token;
    }

    function fazerLogout() {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
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
        return lerResposta(response);
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

    window.Connecta = Object.freeze({
        config: Object.freeze({ API_BASE_URL, TOKEN_STORAGE_KEY }),
        api: Object.freeze({ criarUrl, requisicao }),
        auth: Object.freeze({ exigirToken, fazerLogout, obterHeadersAutorizacao, obterToken }),
        imagem: Object.freeze({ comprimir: comprimirImagem }),
        ui: Object.freeze({ configurarContadoresCaracteres, limparFeedback, mostrarFeedback })
    });
}(window));
