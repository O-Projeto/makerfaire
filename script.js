document.addEventListener('DOMContentLoaded', async () => {

    let dadosMaisVotados = {};

    async function loadVotingResults() {
        try {
            const response = await fetch('http://localhost:3000/votacao/mais-votados');
            dadosMaisVotados = await response.json();
            renderCategoria(1); // Exibe a primeira categoria por padrão
        } catch (error) {
            console.error('Erro ao carregar resultados:', error);
            const topProjects = document.getElementById('topProjects');
            topProjects.innerHTML = `<p style="color:red;">Erro ao carregar resultados. Tente novamente mais tarde.</p>`;
        }
    }

    function renderCategoria(categoriaNumero) {
        const categoriaKey = `categoria${categoriaNumero}`;
        const resultados = dadosMaisVotados[categoriaKey];

        if (!resultados) return;

        const categoryTitle = document.getElementById('categoryTitle');
        categoryTitle.innerHTML = `<h2>🏆 Resultados da ${categoriaNumero}ª Categoria</h2>`;

        const topProjects = document.getElementById('topProjects');
        topProjects.innerHTML = '';

        const medalhas = ['🥇', '🥈', '🥉'];
        const cores = ['#f9f9f9', '#f0f0f0', '#e9e9e9'];

        resultados.forEach((projeto, index) => {
            const div = document.createElement('div');
            div.className = 'project podium';
            div.style.background = cores[index];
            div.style.padding = '1rem';
            div.style.borderRadius = '8px';
            div.style.marginBottom = '1rem';
            div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

            div.innerHTML = `
                <h3>${medalhas[index]} ${index + 1}º Lugar: Projeto #${projeto.projetoId}</h3>
                <p>Total de Votos: ${projeto.totalVotos}</p>
            `;

            topProjects.appendChild(div);
        });
    }

    // Navegação entre categorias
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            const categoriaNumero = button.getAttribute('data-category');
            renderCategoria(categoriaNumero);
        });
    });

    loadVotingResults();
    
    // --- Funções auxiliares ---
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

    function clearVoteMessage(voteMessageElement) {
        voteMessageElement.textContent = '';
        voteMessageElement.classList.add('hidden');
        voteMessageElement.style.cssText = '';
    }

    const messageElement = document.getElementById('message');
    function displayMainMessage(text, isError = false) {
        if (messageElement) {
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

    function clearMainMessage() {
        if (messageElement) {
            messageElement.textContent = '';
            messageElement.classList.add('hidden');
            messageElement.style.cssText = '';
        }
    }



    // --- Função principal para manipular o fluxo de votação por categoria ---
    function setupVotingCategory(categoryName, nextCategoryPage = null) {
        const voteForm = document.getElementById(`voteForm${categoryName}`);
        if (!voteForm) return;

        const projectIdInput = document.getElementById(`projectId${categoryName}`);
        const confirmButton = document.getElementById(`confirm${categoryName}`);
        const confirmationStep = document.getElementById(`confirmationStep${categoryName}`);
        const confirmedProjectSpan = document.getElementById(`confirmedProject${categoryName}`);
        const editButton = document.getElementById(`edit${categoryName}`);
        const voteMessage = document.getElementById(`voteMessage${categoryName}`);

        confirmButton.addEventListener('click', () => {
            const projectId = projectIdInput.value.trim();
            if (projectId && parseInt(projectId) > 0) {
                confirmedProjectSpan.textContent = projectId;
                confirmationStep.classList.remove('hidden');
                confirmButton.classList.add('hidden');
                projectIdInput.setAttribute('readonly', true);
                clearVoteMessage(voteMessage);
            } else {
                displayVoteMessage(voteMessage, 'Por favor, insira um número de projeto válido.', true);
            }
        });

        editButton.addEventListener('click', () => {
            confirmationStep.classList.add('hidden');
            confirmButton.classList.remove('hidden');
            projectIdInput.removeAttribute('readonly');
            clearVoteMessage(voteMessage);
        });

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

            const currentVote = {
                categoriaId: categoryName,
                projetoId: parseInt(projectId)
            };

            let allVotos = JSON.parse(sessionStorage.getItem('feiramakerVotos')) || [];
            const existingVoteIndex = allVotos.findIndex(v => v.categoriaId === categoryName);
            
            if (existingVoteIndex !== -1) {
                allVotos[existingVoteIndex] = currentVote;
            } else {
                allVotos.push(currentVote);
            }

            sessionStorage.setItem('feiramakerVotos', JSON.stringify(allVotos));
            displayVoteMessage(voteMessage, `Voto na categoria ${categoryName} registrado localmente. Redirecionando...`);

            const isLastCategory = (nextCategoryPage === '/agradecimento');
            if (isLastCategory) {
                displayVoteMessage(voteMessage, 'Enviando todos os votos. Por favor, aguarde...');
                try {
                    const finalPayload = {
                        eleitorId: voterId,
                        votos: allVotos
                    };

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
                        sessionStorage.removeItem('feiramakerVotos');
                        return;
                    }

                    displayVoteMessage(voteMessage, 'Todos os seus votos foram registrados com sucesso!', false);
                    sessionStorage.removeItem('feiramakerVotos');

                    setTimeout(() => {
                       window.location.href = `/agradecimento?voterId=${encodeURIComponent(voterId)}`;
                    }, 2000);

                } catch (error) {
                    console.error('Erro de rede ao finalizar votação:', error);
                    displayVoteMessage(voteMessage, 'Não foi possível conectar ao servidor para finalizar a votação. Tente novamente.', true);
                    sessionStorage.removeItem('feiramakerVotos');
                }
            } else {
                setTimeout(() => {
                    window.location.href = `${nextCategoryPage}?voterId=${encodeURIComponent(voterId)}`;
                }, 1500);
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
                    sessionStorage.removeItem('feiramakerVotos');
                    setTimeout(() => {
                       window.location.href = `/votar/junior?voterId=${encodeURIComponent(voterId)}`;
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

    // --- Configurar cada página de votação ---
    setupVotingCategory('votacao1', '/votar/plus');
    setupVotingCategory('votacao2', '/votar/senior');
    setupVotingCategory('votacao3', '/votar/master');
    setupVotingCategory('votacao4', '/agradecimento');

    // --- Lógica para a página de agradecimento ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        let timeLeft = 5;
        countdownElement.textContent = timeLeft;

        const timerInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                window.location.href = '/index';
            }
        }, 1000);
    }
});