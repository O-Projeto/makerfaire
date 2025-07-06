import { displayMainMessage, clearMainMessage } from "./utils.js";

export function setupVoterIdentification() {
  const voterIdentificationForm = document.getElementById("voterForm");
  if (voterIdentificationForm && document.getElementById("voterId")) {
    voterIdentificationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const voterId = document.getElementById("voterId").value.trim();

      clearMainMessage();

      if (voterId.toLowerCase() === "N0eypf@oprojeto".toLowerCase()) {
        displayMainMessage(
          "Bem-vindo ADM! Redirecionando para a área administrativa...",
          false,
        );
        setTimeout(() => {
          window.location.href = "/6Gdboz";
        }, 1000);
        return;
      }

      displayMainMessage("Verificando ID do eleitor...", false);

      try {
        const response = await fetch(
          `http://localhost:3000/votacao/check-eleitor?id=${encodeURIComponent(voterId)}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            displayMainMessage(
              `ID de eleitor ${voterId} não encontrado.`,
              true,
            );
          } else {
            displayMainMessage(
              `Erro na verificação: ${response.statusText}`,
              true,
            );
          }
          return;
        }

        const data = await response.json();

        if (data.eleitorId === voterId && data.hasVoted === false) {
          displayMainMessage(
            `ID ${voterId} verificado. Redirecionando para a votação...`,
          );
          sessionStorage.removeItem("feiramakerVotos");
          setTimeout(() => {
            window.location.href = `/votar/junior?voterId=${encodeURIComponent(voterId)}`;
          }, 1000);
        } else if (data.eleitorId === voterId && data.hasVoted === true) {
          displayMainMessage(`${voterId} já possui voto registrado.`, true);
        } else {
          displayMainMessage(
            "Erro na resposta do servidor. Por favor, tente novamente.",
            true,
          );
        }
      } catch (error) {
        console.error("Erro ao verificar eleitor:", error);
        displayMainMessage(
          "Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.",
          true,
        );
      }
    });
  }
}
