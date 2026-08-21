function mensagemErro(body, fallback) {
    return body?.erro || body?.mensagem || fallback;
}

async function tratarSessaoEncerrada(status, body) {
    if (!(await Connecta.auth.respostaSessaoEncerrada(status, body))) return false;
    const contaBanida = Connecta.auth.respostaContaBanida(status, body);
    await Connecta.ui.alerta({
        titulo: contaBanida ? "Conta banida" : "Sessão expirada",
        mensagem: mensagemErro(
            body,
            contaBanida
                ? "Sua conta foi banida por violação das regras de conduta."
                : "Sua sessão expirou. Entre novamente para continuar."
        ),
        kicker: "Acesso encerrado"
    });
    Connecta.auth.fazerLogout();
    return true;
}

function carregarPerfil(sessao, state, elements) {
    if (!sessao?.usuario) return false;
    state.usuario = sessao.usuario;
    renderizarUsuario(sessao.usuario, elements);
    return true;
}

function configurarBotaoSair(btnSair) {
    btnSair.addEventListener("click", async () => {
        const confirmado = await Connecta.ui.confirmar({
            titulo: "Sair da conta",
            mensagem: "Tem certeza que deseja sair?",
            textoConfirmar: "Sair",
            textoCancelar: "Cancelar",
            kicker: "Ação Sensível"
        });
        if (confirmado) Connecta.auth.fazerLogout();
    });
}

function configurarUploadFotoPerfil(token, elements) {
    elements.inputFotoPerfil.addEventListener("change", async () => {
        const arquivo = elements.inputFotoPerfil.files[0];
        if (!arquivo) return;
        mostrarFeedback(elements.feedbackFoto, "Enviando foto...", "success");
        try {
            const fotoBase64 = await comprimirImagemAvatar(arquivo);
            const { status, body } = await atualizarFotoPerfil(token, fotoBase64);
            if (status === 200) {
                exibirFotoPerfil(fotoBase64, elements);
                atualizarAvatarNavegacao({
                    fotoPerfil: fotoBase64,
                    nome: elements.nomePerfil?.textContent
                });
                mostrarFeedback(elements.feedbackFoto, "Foto de perfil atualizada.", "success");
            } else if (await tratarSessaoEncerrada(status, body)) {
                return;
            } else {
                mostrarFeedback(elements.feedbackFoto, mensagemErro(body, "Não foi possível atualizar a foto."), "error");
            }
        } catch (erro) {
            console.error("Erro ao atualizar foto:", erro);
            mostrarFeedback(elements.feedbackFoto, "Não foi possível processar ou enviar a imagem.", "error");
        } finally {
            elements.inputFotoPerfil.value = "";
        }
    });
}

function configurarFormularioNome(token, state, elements) {
    elements.formNome.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = elements.inputNome.value.trim();
        if (nome.length < 3 || nome.length > 30) {
            mostrarFeedback(elements.feedbackNome, "O nome deve ter entre 3 e 30 caracteres.", "error");
            return;
        }
        const botao = elements.formNome.querySelector("button[type=submit]");
        definirCarregamento(botao, true);
        limparFeedback(elements.feedbackNome);
        try {
            // Payload atômico: somente nome.
            const { status, body } = await atualizarUsuario(token, { nome });
            if (status === 200) {
                state.usuario.nome = nome;
                elements.nome.textContent = nome;
                elements.nomePerfil.textContent = nome;
                mostrarFeedback(elements.feedbackNome, "Nome atualizado com sucesso.", "success");
            } else if (await tratarSessaoEncerrada(status, body)) {
                return;
            } else {
                mostrarFeedback(elements.feedbackNome, mensagemErro(body, "Não foi possível atualizar o nome."), "error");
            }
        } catch (erro) {
            mostrarFeedback(elements.feedbackNome, "Erro de conexão com o servidor.", "error");
        } finally {
            definirCarregamento(botao, false);
        }
    });
}

function configurarAcoesComSenha(token, state, elements) {
    let acaoPendente = null;

    function prepararAcao(config) {
        acaoPendente = config;
        elements.modalSenhaTitulo.textContent = config.titulo;
        const mudandoDeComercialParaComum = config.tipo === "tipoConta"
            && String(state.usuario.tipoConta).toUpperCase() === "COMERCIAL"
            && String(config.payload?.tipoConta).toUpperCase() === "COMUM";
        elements.modalTipoAviso.classList.toggle("hidden", !mudandoDeComercialParaComum);
        elements.modalSenhaAtual.value = "";
        limparFeedback(elements.feedbackModalSenha);
        abrirModal(elements.modalSenha, elements.modalSenhaAtual);
    }

    elements.formEmail.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!elements.formEmail.reportValidity()) return;
        const email = elements.inputEmail.value.trim();
        prepararAcao({ tipo: "email", titulo: "Confirme a alteração de e-mail", payload: { email }, feedback: elements.feedbackEmail, form: elements.formEmail });
    });

    elements.formTipoConta.addEventListener("submit", (event) => {
        event.preventDefault();
        const tipoConta = elements.inputTipoConta.value;
        if (tipoConta === state.usuario.tipoConta) {
            mostrarFeedback(elements.feedbackTipoConta, "Selecione um tipo de conta diferente do atual.", "error");
            return;
        }
        prepararAcao({ tipo: "tipoConta", titulo: "Confirme a alteração do tipo de conta", payload: { tipoConta }, feedback: elements.feedbackTipoConta, form: elements.formTipoConta });
    });

    elements.formSenha.addEventListener("submit", (event) => {
        event.preventDefault();
        const novaSenha = elements.inputNovaSenha.value;
        const confirmarNovaSenha = elements.inputConfirmarSenha.value;
        if (novaSenha !== confirmarNovaSenha) {
            mostrarFeedback(elements.feedbackSenha, "A nova senha e a confirmação devem ser iguais.", "error");
            return;
        }
        prepararAcao({ tipo: "senha", titulo: "Confirme a alteração de senha", payload: { novaSenha, confirmarNovaSenha }, feedback: elements.feedbackSenha, form: elements.formSenha });
    });

    function cancelar() {
        fecharModal(elements.modalSenha);
        elements.formModalSenha.reset();
        acaoPendente = null;
    }
    elements.btnCancelarSenha.addEventListener("click", cancelar);

    elements.formModalSenha.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!acaoPendente) return;
        const senhaAtual = elements.modalSenhaAtual.value;
        const botao = elements.btnConfirmarSenha;
        definirCarregamento(botao, true);
        limparFeedback(elements.feedbackModalSenha);
        try {
            // Payload atômico: campos da ação selecionada + senha atual exigida.
            const { status, body } = await atualizarUsuario(token, { ...acaoPendente.payload, senhaAtual });
            if (status === 200) {
                const concluida = acaoPendente;
                fecharModal(elements.modalSenha);
                if (concluida.tipo === "email") {
                    if (body?.token) Connecta.auth.salvarToken(body.token);
                    state.usuario.email = concluida.payload.email;
                    elements.email.textContent = ocultarEmail(concluida.payload.email);
                } else if (concluida.tipo === "tipoConta") {
                    state.usuario.tipoConta = concluida.payload.tipoConta;
                    const rotulo = nomeTipoConta(concluida.payload.tipoConta);
                    elements.tipo.textContent = rotulo;
                    elements.tipoPerfil.textContent = rotulo;
                    atualizarVisibilidadeMeusAnuncios(concluida.payload.tipoConta);
                } else {
                    concluida.form.reset();
                }
                mostrarFeedback(concluida.feedback, mensagemErro(body, "Alteração realizada com sucesso."), "success");
                elements.formModalSenha.reset();
                acaoPendente = null;
            } else if (await tratarSessaoEncerrada(status, body)) {
                return;
            } else if (status === 401) {
                mostrarFeedback(elements.feedbackModalSenha, mensagemErro(body, "Senha atual incorreta."), "error");
            } else if (status === 409) {
                fecharModal(elements.modalSenha);
                mostrarFeedback(acaoPendente.feedback, mensagemErro(body, "Este e-mail já está cadastrado."), "error");
                elements.formModalSenha.reset();
                acaoPendente = null;
            } else {
                mostrarFeedback(elements.feedbackModalSenha, mensagemErro(body, "Não foi possível realizar a alteração."), "error");
            }
        } catch (erro) {
            mostrarFeedback(elements.feedbackModalSenha, "Erro de conexão com o servidor.", "error");
        } finally {
            definirCarregamento(botao, false);
        }
    });
}

function configurarExclusaoConta(token, state, elements) {
    function validarDesbloqueio() {
        const emailConfere = elements.exclusaoEmail.value.trim() === (state.usuario.email || "");
        elements.btnConfirmarExclusao.disabled = !emailConfere || !elements.exclusaoSenha.value;
    }
    elements.btnAbrirExclusao.addEventListener("click", () => {
        elements.formExclusao.reset();
        limparFeedback(elements.feedbackExclusao);
        validarDesbloqueio();
        abrirModal(elements.modalExclusao, elements.exclusaoEmail);
    });
    elements.btnCancelarExclusao.addEventListener("click", () => fecharModal(elements.modalExclusao));
    elements.exclusaoEmail.addEventListener("input", validarDesbloqueio);
    elements.exclusaoSenha.addEventListener("input", validarDesbloqueio);
    elements.formExclusao.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (elements.btnConfirmarExclusao.disabled) return;
        const email = elements.exclusaoEmail.value.trim();
        const senhaAtual = elements.exclusaoSenha.value;
        definirCarregamento(elements.btnConfirmarExclusao, true, "Excluindo...");
        try {
            const { status, body } = await excluirUsuario(token, email, senhaAtual);
            if (status === 200) {
                Connecta.auth.fazerLogout();
                return;
            }
            if (await tratarSessaoEncerrada(status, body)) return;
            mostrarFeedback(elements.feedbackExclusao, status === 401 ? mensagemErro(body, "E-mail ou senha inválidos.") : mensagemErro(body, "Não foi possível excluir a conta."), "error");
        } catch (erro) {
            mostrarFeedback(elements.feedbackExclusao, "Erro de conexão com o servidor.", "error");
        } finally {
            definirCarregamento(elements.btnConfirmarExclusao, false);
            validarDesbloqueio();
        }
    });
}

function configurarFechamentoModais(elements) {
    [elements.modalSenha, elements.modalExclusao].forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target !== modal) return;
            if (modal === elements.modalSenha) elements.btnCancelarSenha.click();
            else elements.btnCancelarExclusao.click();
        });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (!elements.modalSenha.classList.contains("hidden")) elements.btnCancelarSenha.click();
        else if (!elements.modalExclusao.classList.contains("hidden")) elements.btnCancelarExclusao.click();
    });
}
