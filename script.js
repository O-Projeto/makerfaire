document.addEventListener('DOMContentLoaded', async () => {
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

    // --- Função para carregar resultados da votação ---
    async function loadVotingResults() {
        try {
            // Verificar se estamos na página de resultados
            if (!document.querySelector('main').classList.contains('results-page')) {
                return;
            }

            // Buscar os dados dos projetos mais votados
            const maisVotadosResponse = await fetch('http://localhost:3000/votacao/mais-votados');
            const maisVotados = await maisVotadosResponse.json();
            
            // Buscar os detalhes dos votos
            const totalVotosResponse = await fetch('http://localhost:3000/votacao/total-votos');
            const totalVotos = await totalVotosResponse.json();
            
            // Mapear os nomes das categorias
            const categorias = {
                'votacao1': 'Categoria Junior',
                'votacao2': 'Categoria Plus',
                'votacao3': 'Categoria Senior',
                'votacao4': 'Categoria Master'
            };
            
            for (const [categoriaId, categoriaTitle] of Object.entries(categorias)) {
                const projetoVencedor = maisVotados[categoriaId];
                const votosCategoria = totalVotos.find(item => item.categoriaId === categoriaId);

                const section = document.createElement('section');
                section.className = 'voting-section';

                const h2 = document.createElement('h2');
                h2.textContent = categoriaTitle;
                section.appendChild(h2);

                const pProjeto = document.createElement('p');
                const strongProjeto = document.createElement('strong');
                strongProjeto.textContent = 'Projeto Vencedor: ';
                const spanProjeto = document.createElement('span');
                spanProjeto.style.color = '#4CAF50';
                spanProjeto.textContent = `#${projetoVencedor.projetoId}`;

                pProjeto.appendChild(strongProjeto);
                pProjeto.appendChild(spanProjeto);
                section.appendChild(pProjeto);

                const pVotos = document.createElement('p');
                const strongVotos = document.createElement('strong');
                strongVotos.textContent = 'Total de Votos: ';
                pVotos.appendChild(strongVotos);
                pVotos.appendChild(document.createTextNode(projetoVencedor.totalVotos));
                section.appendChild(pVotos);

                const divEleitores = document.createElement('div');
                divEleitores.className = 'eleitor-list';

                const h3Eleitores = document.createElement('h3');
                h3Eleitores.textContent = 'Eleitores:';
                divEleitores.appendChild(h3Eleitores);

                // Criar tabela
                const table = document.createElement('table');
                table.className = 'votos-table';
                table.style.borderCollapse = 'collapse';
                table.style.width = '100%';
                table.style.marginTop = '10px';

                // Cabeçalho da tabela
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');

                ['Eleitor', 'Projeto'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    th.style.border = '1px solid #ccc';
                    th.style.padding = '8px';
                    th.style.backgroundColor = '#f2f2f2';
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Corpo da tabela com os votos
                const tbody = document.createElement('tbody');

               const votosAgrupados = {};
votosCategoria.votos.forEach(voto => {
    if (!votosAgrupados[voto.projetoId]) {
        votosAgrupados[voto.projetoId] = [];
    }
    votosAgrupados[voto.projetoId].push(voto.eleitor.id);
});

// Criar linhas agrupadas por projeto
Object.entries(votosAgrupados).forEach(([projetoId, eleitores]) => {
    eleitores.forEach((eleitorId, index) => {
        const row = document.createElement('tr');

        const tdEleitor = document.createElement('td');
        tdEleitor.textContent = `#${eleitorId}`;
        tdEleitor.style.border = '1px solid #ccc';
        tdEleitor.style.padding = '8px';

        const tdProjeto = document.createElement('td');
        tdProjeto.textContent = index === 0 ? `#${projetoId}` : '';
        tdProjeto.style.border = '1px solid #ccc';
        tdProjeto.style.padding = '8px';

        row.appendChild(tdEleitor);
        row.appendChild(tdProjeto);
        tbody.appendChild(row);
    });
});

                table.appendChild(tbody);
                divEleitores.appendChild(table);
                section.appendChild(divEleitores);

                document.querySelector('main').appendChild(section);
            }

            
        } catch (error) {
            console.error('Erro ao carregar os dados da votação:', error);
            const errorSection = document.createElement('section');
            errorSection.className = 'error-message';
            
            const h2 = document.createElement('h2');
            h2.textContent = 'Erro ao carregar os resultados';
            errorSection.appendChild(h2);
            
            const p = document.createElement('p');
            p.textContent = 'Não foi possível carregar os dados da votação. Por favor, tente recarregar a página.';
            errorSection.appendChild(p);
            
            document.querySelector('main').appendChild(errorSection);
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

    // --- Carregar resultados da votação ---
    loadVotingResults();
});