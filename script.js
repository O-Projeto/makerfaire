document.addEventListener('DOMContentLoaded', () => {
    // --- Funções auxiliares (manter como estão, apenas movidas para melhor organização) ---
    // Função auxiliar para exibir mensagens de voto
    function displayVoteMessage(voteMessageElement, text, isError = false) {
        voteMessageElement.textContent = text;
        voteMessageElement.classList.remove('hidden');
        if (isError) {
            voteMessageElement.style.backgroundColor = '#ffe0e0';
            voteMessageElement.style.color = '#dc3545';
            voteMessageElement.style.border = '1px solid #dc3545';
        } else {
            voteMessageElement.style.backgroundColor = '#e0ffe0';
            voteMessageElement.style.color = '#28a745';
            voteMessageElement.style.border = '1px solid #28a745';
        }
    }

    // Função auxiliar para limpar mensagens de voto
    function clearVoteMessage(voteMessageElement) {
        voteMessageElement.textContent = '';
        voteMessageElement.classList.add('hidden');
        voteMessageElement.style.cssText = '';
    }

    // Função auxiliar para exibir mensagens na página de identificação
    const messageElement = document.getElementById('message'); // Certifique-se que este elemento existe na index.html
    function displayMainMessage(text, isError = false) {
        if (messageElement) { // Verifica se o elemento existe (apenas na index.html)
            messageElement.textContent = text;
            messageElement.classList.remove('hidden');
            if (isError) {
                messageElement.style.backgroundColor = '#ffe0e0';
                messageElement.style.color = '#dc3545';
                messageElement.style.border = '1px solid #dc3545';
            } else {
                messageElement.style.backgroundColor = '#e0ffe0';
                messageElement.style.color = '#28a745';
                messageElement.style.border = '1px solid #28a745';
            }
        }
    }

    // Função auxiliar para limpar mensagens na página de identificação
    function clearMainMessage() {
        if (messageElement) { // Verifica se o elemento existe
            messageElement.textContent = '';
            messageElement.classList.add('hidden');
            messageElement.style.cssText = '';
        }
    }


    // Função principal para manipular o fluxo de votação por categoria
    function setupVotingCategory(categoryName, nextCategoryPage = null) {
        const voteForm = document.getElementById(`voteForm${categoryName}`);
        const projectIdInput = document.getElementById(`projectId${categoryName}`);
        const confirmButton = document.getElementById(`confirm${categoryName}`);
        const confirmationStep = document.getElementById(`confirmationStep${categoryName}`);
        const confirmedProjectSpan = document.getElementById(`confirmedProject${categoryName}`);
        const editButton = document.getElementById(`edit${categoryName}`);
        const voteMessage = document.getElementById(`voteMessage${categoryName}`);

        if (!voteForm) { // Se o formulário não existe nesta página, apenas sai.
            return;
        }

        // Lógica para o botão de confirmar número
        confirmButton.addEventListener('click', () => {
            const projectId = projectIdInput.value.trim();
            if (projectId && parseInt(projectId) > 0) {
                confirmedProjectSpan.textContent = projectId;
                confirmationStep.classList.remove('hidden');
                confirmButton.classList.add('hidden');
                projectIdInput.setAttribute('readonly', true);
                clearVoteMessage(voteMessage); // Limpa a mensagem ao confirmar
            } else {
                displayVoteMessage(voteMessage, 'Por favor, insira um número de projeto válido.', true);
            }
        });

        // Lógica para o botão de editar número
        editButton.addEventListener('click', () => {
            confirmationStep.classList.add('hidden');
            confirmButton.classList.remove('hidden');
            projectIdInput.removeAttribute('readonly');
            clearVoteMessage(voteMessage); // Limpa a mensagem ao editar
        });

        // Lógica para o envio do formulário de voto (SUBMISSÃO DA CATEGORIA ATUAL)
        voteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const projectId = projectIdInput.value.trim();
            const voterId = new URLSearchParams(window.location.search).get('voterId');

            clearVoteMessage(voteMessage);

            if (!projectId || parseInt(projectId) <= 0) {
                displayVoteMessage(voteMessage, 'Número de projeto inválido. Por favor, tente novamente.', true);
                return;
            }

            if (!voterId) {
                displayVoteMessage(voteMessage, 'ID do eleitor não encontrado na URL. Retornando à página inicial.', true);
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }

            // 1. Coleta o voto atual
            const currentVote = {
                categoriaId: categoryName,
                projetoId: parseInt(projectId)
            };

            // 2. Recupera votos existentes do sessionStorage
            let allVotos = JSON.parse(sessionStorage.getItem('feiramakerVotos')) || [];

            // 3. Adiciona o voto atual ou atualiza se a categoria já existe (para evitar duplicatas em caso de refresh)
            const existingVoteIndex = allVotos.findIndex(v => v.categoriaId === categoryName);
            if (existingVoteIndex !== -1) {
                allVotos[existingVoteIndex] = currentVote; // Atualiza
            } else {
                allVotos.push(currentVote); // Adiciona
            }

            // 4. Salva os votos atualizados de volta no sessionStorage
            sessionStorage.setItem('feiramakerVotos', JSON.stringify(allVotos));

            displayVoteMessage(voteMessage, `Voto na categoria ${categoryName} registrado localmente. Redirecionando...`);

            // 5. Verifica se esta é a ÚLTIMA CATEGORIA para enviar os votos
            const isLastCategory = (nextCategoryPage === 'agradecimento.html'); // Ou você pode passar um flag explicitly

            if (isLastCategory) {
                displayVoteMessage(voteMessage, 'Enviando todos os votos. Por favor, aguarde...');
                try {
                    const finalPayload = {
                        eleitorId: voterId,
                        votos: allVotos
                    };
                    console.log("Payload final a ser enviado:", finalPayload);

                    const response = await fetch('http://localhost:3000/votacao', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(finalPayload),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Erro ao registrar votos:', errorData);
                        displayVoteMessage(voteMessage, `Erro ao finalizar votação: ${errorData.message || response.statusText}`, true);
                        sessionStorage.removeItem('feiramakerVotos'); // Limpa em caso de erro para não persistir dados inválidos
                        return;
                    }

                    // Se a votação total foi um sucesso
                    displayVoteMessage(voteMessage, 'Todos os seus votos foram registrados com sucesso!', false);
                    sessionStorage.removeItem('feiramakerVotos'); // Limpa votos após sucesso

                    setTimeout(() => {
                        window.location.href = `agradecimento.html?voterId=${encodeURIComponent(voterId)}`;
                    }, 2000);

                } catch (error) {
                    console.error('Erro de rede ao finalizar votação:', error);
                    displayVoteMessage(voteMessage, 'Não foi possível conectar ao servidor para finalizar a votação. Tente novamente.', true);
                    sessionStorage.removeItem('feiramakerVotos'); // Limpa em caso de erro de rede
                }
            } else {
                // Não é a última categoria, apenas redireciona para a próxima
                setTimeout(() => {
                    window.location.href = `${nextCategoryPage}?voterId=${encodeURIComponent(voterId)}`;
                }, 1500); // Pequeno atraso para a mensagem ser lida
            }
        });
    }

    // --- Lógica para a página index.html (Identificação) ---
    const voterForm = document.getElementById('voterForm');

    if (voterForm) {
        voterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const voterId = document.getElementById('voterId').value.trim();

            clearMainMessage();

            if (voterId === '') {
                displayMainMessage('Por favor, insira um ID de eleitor válido.', true);
                return;
            }

            displayMainMessage('Verificando ID do eleitor...', false);

            try {
                const response = await fetch(`http://localhost:3000/votacao/check-eleitor?id=${encodeURIComponent(voterId)}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        displayMainMessage(`ID de eleitor '${voterId}' não encontrado.`, true);
                    } else {
                        displayMainMessage(`Erro na verificação: ${response.statusText}`, true);
                    }
                    return;
                }

                const data = await response.json();

                if (data.eleitorId === voterId && data.hasVoted === false) {
                    displayMainMessage(`ID '${voterId}' verificado. Redirecionando para a votação...`);
                    // Limpa qualquer voto anterior do sessionStorage ao iniciar uma nova votação
                    sessionStorage.removeItem('feiramakerVotos');
                    setTimeout(() => {
                        window.location.href = `votar-junior.html?voterId=${encodeURIComponent(voterId)}`;
                    }, 1000);
                } else if (data.eleitorId === voterId && data.hasVoted === true) {
                    displayMainMessage(`ID '${voterId}' já votou.`, true);
                } else {
                    displayMainMessage('Erro na resposta do servidor. Por favor, tente novamente.', true);
                }

            } catch (error) {
                console.error('Erro ao verificar eleitor:', error);
                displayMainMessage('Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.', true);
            }
        });
    }

    // --- Configurar cada página de votação (chamadas para setupVotingCategory) ---
    // Essas chamadas devem estar ativas nas páginas de votação correspondentes.
    // Ex: Em votar-junior.html, apenas setupVotingCategory('votacao1', ...) será executado de fato.
    setupVotingCategory('votacao1', 'votar-plus.html');
    setupVotingCategory('votacao2', 'votar-senior.html');
    setupVotingCategory('votacao3', 'votar-master.html');
    setupVotingCategory('votacao4', 'agradecimento.html'); // Esta é a ÚLTIMA CATEGORIA

    // Lógica para a página de agradecimento (timer)
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        let timeLeft = 15;
        countdownElement.textContent = timeLeft;

        const timerInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                window.location.href = 'index.html'; // Redireciona para a página inicial
            }
        }, 1000);
    }
});