document.addEventListener('DOMContentLoaded', () => {
    // Função auxiliar para manipular o fluxo de votação por categoria
    function setupVotingCategory(categoryName, nextCategoryPage = null) {
        const voteForm = document.getElementById(`voteForm${categoryName}`);
        const projectIdInput = document.getElementById(`projectId${categoryName}`);
        const confirmButton = document.getElementById(`confirm${categoryName}`);
        const confirmationStep = document.getElementById(`confirmationStep${categoryName}`);
        const confirmedProjectSpan = document.getElementById(`confirmedProject${categoryName}`);
        const editButton = document.getElementById(`edit${categoryName}`);
        const voteMessage = document.getElementById(`voteMessage${categoryName}`);

        if (voteForm) {
            // Lógica para o botão de confirmar número
            confirmButton.addEventListener('click', () => {
                const projectId = projectIdInput.value.trim();
                if (projectId && parseInt(projectId) > 0) {
                    confirmedProjectSpan.textContent = projectId;
                    confirmationStep.classList.remove('hidden');
                    confirmButton.classList.add('hidden');
                    projectIdInput.setAttribute('readonly', true);
                    voteMessage.classList.add('hidden');
                } else {
                    voteMessage.textContent = 'Por favor, insira um número de projeto válido.';
                    voteMessage.classList.remove('hidden');
                    voteMessage.style.backgroundColor = '#ffe0e0';
                    voteMessage.style.color = '#dc3545';
                    voteMessage.style.border = '1px solid #dc3545';
                }
            });

            // Lógica para o botão de editar número
            editButton.addEventListener('click', () => {
                confirmationStep.classList.add('hidden');
                confirmButton.classList.remove('hidden');
                projectIdInput.removeAttribute('readonly');
                voteMessage.classList.add('hidden');
            });

            // Lógica para o envio do formulário de voto
            voteForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const projectId = projectIdInput.value.trim();
                const voterId = new URLSearchParams(window.location.search).get('voterId');

                if (projectId && parseInt(projectId) > 0) {
                    // Em uma aplicação real, aqui você enviaria o voterId, categoryName e projectId
                    // para o seu backend para registrar o voto.
                    console.log(`Voto registrado na categoria ${categoryName} para o projeto ${projectId} pelo eleitor ID: ${voterId}`);

                    voteMessage.textContent = `Seu voto no projeto ${projectId} da categoria ${categoryName} foi registrado!`;
                    voteMessage.classList.remove('hidden');
                    voteMessage.style.backgroundColor = '#e0ffe0';
                    voteMessage.style.color = '#28a745';
                    voteMessage.style.border = '1px solid #28a745';

                    // Limpa o formulário e redireciona após um tempo
                    setTimeout(() => {
                        voteForm.reset();
                        projectIdInput.removeAttribute('readonly');
                        confirmationStep.classList.add('hidden');
                        confirmButton.classList.remove('hidden');
                        voteMessage.classList.add('hidden');

                        if (nextCategoryPage) {
                            window.location.href = `${nextCategoryPage}?voterId=${encodeURIComponent(voterId)}`;
                        } else {
                            // Após a última categoria, redireciona para a página de agradecimento
                            window.location.href = `agradecimento.html?voterId=${encodeURIComponent(voterId)}`;
                        }
                    }, 2000); // Redireciona após 2 segundos
                } else {
                    voteMessage.textContent = 'Número de projeto inválido. Por favor, tente novamente.';
                    voteMessage.classList.remove('hidden');
                    voteMessage.style.backgroundColor = '#ffe0e0';
                    voteMessage.style.color = '#dc3545';
                    voteMessage.style.border = '1px solid #dc3545';
                }
            });
        }
    }

    // Lógica para a página index.html (Identificação)
    const voterForm = document.getElementById('voterForm');
    const messageElement = document.getElementById('message');

    if (voterForm) {
        voterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const voterId = document.getElementById('voterId').value.trim();

            if (voterId !== '') {
                messageElement.textContent = `ID '${voterId}' recebido. Redirecionando para a votação...`;
                messageElement.classList.remove('hidden');
                messageElement.style.backgroundColor = '#e0ffe0';

                window.location.href = `votar-junior.html?voterId=${encodeURIComponent(voterId)}`;
            } else {
                messageElement.textContent = 'Por favor, insira um ID de eleitor válido.';
                messageElement.classList.remove('hidden');
                messageElement.style.backgroundColor = '#ffe0e0';
                messageElement.style.color = '#dc3545';
                messageElement.style.border = '1px solid #dc3545';
            }
        });
    }

    // Configurar cada página de votação
    setupVotingCategory('Junior', 'votar-plus.html');
    setupVotingCategory('Plus', 'votar-senior.html');
    setupVotingCategory('Senior', 'votar-master.html');
    setupVotingCategory('Master', 'agradecimento.html'); // Redireciona para agradecimento.html

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
        }, 1000); // Atualiza a cada 1 segundo
    }
});