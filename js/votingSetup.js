// js/votingSetup.js
import { displayVoteMessage, clearVoteMessage } from "./utils.js";

const categoryIdMap = {
  votacao1: "categoria1",
  votacao2: "categoria2",
  votacao3: "categoria3",
  votacao4: "categoria4",
};

export function setupVotingCategory(categoryHTMLId, nextCategoryPage = null) {
  const voteForm = document.getElementById("voterForm");
  if (!voteForm) {
    console.warn(
      `Formulário com ID 'voterForm' não encontrado para a categoria ${categoryHTMLId}. Certifique-se de que o ID do formulário seja 'voterForm' em todas as páginas de votação.`,
    );
    return;
  }

  const backendCategoryName = categoryIdMap[categoryHTMLId];
  if (!backendCategoryName) {
    console.error(
      `Mapeamento não encontrado para o ID HTML: ${categoryHTMLId}`,
    );
    return;
  }

  const projectIdInput = document.getElementById(`projectId${categoryHTMLId}`);
  const confirmButton = document.getElementById(`confirm${categoryHTMLId}`);
  const confirmationStep = document.getElementById(
    `confirmationStep${categoryHTMLId}`,
  );
  const confirmedProjectSpan = document.getElementById(
    `confirmedProject${categoryHTMLId}`,
  );
  const editButton = document.getElementById(`edit${categoryHTMLId}`);
  const voteMessage = document.getElementById(`voteMessage${categoryHTMLId}`);

  if (
    !projectIdInput ||
    !confirmButton ||
    !confirmationStep ||
    !confirmedProjectSpan ||
    !editButton ||
    !voteMessage
  ) {
    console.warn(
      `Um ou mais elementos específicos para a categoria ${categoryHTMLId} (e.g., projectId${categoryHTMLId}, confirm${categoryHTMLId}) não foram encontrados nesta página. A configuração desta categoria será pulada.`,
    );
    return;
  }

  confirmButton.addEventListener("click", () => {
    const projectId = projectIdInput.value.trim();
    if (projectId && parseInt(projectId) > 0) {
      confirmedProjectSpan.textContent = projectId;
      confirmationStep.classList.remove("hidden");
      confirmButton.classList.add("hidden");
      projectIdInput.setAttribute("readonly", true);
      clearVoteMessage(voteMessage);
    } else {
      displayVoteMessage(
        voteMessage,
        "Por favor, insira um número de projeto válido.",
        true,
      );
    }
  });

  editButton.addEventListener("click", () => {
    confirmationStep.classList.add("hidden");
    confirmButton.classList.remove("hidden");
    projectIdInput.removeAttribute("readonly");
    clearVoteMessage(voteMessage);
  });

  voteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const projectId = projectIdInput.value.trim();
    const voterId = new URLSearchParams(window.location.search).get("voterId");

    clearVoteMessage(voteMessage);

    if (!projectId || parseInt(projectId) <= 0) {
      displayVoteMessage(
        voteMessage,
        "Número de projeto inválido. Por favor, tente novamente.",
        true,
      );
      return;
    }

    if (!voterId) {
      displayVoteMessage(
        voteMessage,
        "ID do eleitor não encontrado na URL. Retornando à página inicial.",
        true,
      );
      setTimeout(() => (window.location.href = "/index.html"), 2000);
      return;
    }

    const currentVote = {
      categoriaId: backendCategoryName,
      projetoId: parseInt(projectId),
    };

    let allVotos = JSON.parse(sessionStorage.getItem("feiramakerVotos")) || [];
    const existingVoteIndex = allVotos.findIndex(
      (v) => v.categoriaId === backendCategoryName,
    );

    if (existingVoteIndex !== -1) {
      allVotos[existingVoteIndex] = currentVote;
    } else {
      allVotos.push(currentVote);
    }

    sessionStorage.setItem("feiramakerVotos", JSON.stringify(allVotos));
    displayVoteMessage(
      voteMessage,
      `Voto na categoria registrado com sucesso. Redirecionando...`,
    );

    const isLastCategory = nextCategoryPage === "/agradecimento";
    if (isLastCategory) {
      displayVoteMessage(
        voteMessage,
        "Enviando todos os votos. Por favor, aguarde...",
      );
      try {
        const finalPayload = {
          eleitorId: voterId,
          votos: allVotos,
        };

        const response = await fetch("http://localhost:3000/votacao", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao registrar votos:", errorData);
          displayVoteMessage(
            voteMessage,
            `Erro ao finalizar votação: ${errorData.message || response.statusText}`,
            true,
          );
          sessionStorage.removeItem("feiramakerVotos");
          return;
        }

        displayVoteMessage(
          voteMessage,
          "Todos os seus votos foram registrados com sucesso!",
          false,
        );
        sessionStorage.removeItem("feiramakerVotos");

        setTimeout(() => {
          window.location.href = `/agradecimento?voterId=${encodeURIComponent(voterId)}`;
        }, 2000);
      } catch (error) {
        console.error("Erro de rede ao finalizar votação:", error);
        displayVoteMessage(
          voteMessage,
          "Não foi possível conectar ao servidor para finalizar a votação. Tente novamente.",
          true,
        );
        sessionStorage.removeItem("feiramakerVotos");
      }
    } else {
      setTimeout(() => {
        window.location.href = `${nextCategoryPage}?voterId=${encodeURIComponent(voterId)}`;
      }, 1500);
    }
  });
}
