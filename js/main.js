// js/main.js
import { setupVoterIdentification } from "./identification.js";
import { setupVotingCategory } from "./votingSetup.js";
import {
  loadVotingResults,
  setupCategoryNavigation,
  loadVotingResultsDetails,
  setupCountdown,
} from "./resultsDisplay.js";

document.addEventListener("DOMContentLoaded", async () => {
  const currentPath = window.location.pathname;

  // Lógica para a página index.html (Identificação)
  setupVoterIdentification();

  // Lógica para páginas de votação específicas
  if (
    currentPath.endsWith("/votar/junior") ||
    currentPath.endsWith("/votar.html")
  ) {
    if (document.getElementById("projectIdvotacao1")) {
      setupVotingCategory("votacao1", "/votar/plus");
    } else {
      console.warn(
        "Página da categoria Junior/Maker Starter detectada pela URL, mas elementos da votacao1 não encontrados. Verifique o HTML.",
      );
    }
  } else if (currentPath.endsWith("/votar/plus")) {
    if (document.getElementById("projectIdvotacao2")) {
      setupVotingCategory("votacao2", "/votar/senior");
    } else {
      console.warn(
        "Página da categoria Plus detectada pela URL, mas elementos da votacao2 não encontrados. Verifique o HTML.",
      );
    }
  } else if (currentPath.endsWith("/votar/senior")) {
    if (document.getElementById("projectIdvotacao3")) {
      setupVotingCategory("votacao3", "/votar/master");
    } else {
      console.warn(
        "Página da categoria Senior detectada pela URL, mas elementos da votacao3 não encontrados. Verifique o HTML.",
      );
    }
  } else if (currentPath.endsWith("/votar/master")) {
    if (document.getElementById("projectIdvotacao4")) {
      setupVotingCategory("votacao4", "/agradecimento");
    } else {
      console.warn(
        "Página da categoria Master detectada pela URL, mas elementos da votacao4 não encontrados. Verifique o HTML.",
      );
    }
  }

  // Lógica para a página de agradecimento
  if (currentPath.includes("/agradecimento")) {
    setupCountdown();
  }

  // Lógica para a página de resultados
  if (document.getElementById("resultsPageContainer")) {
    loadVotingResultsDetails();
  }
  // Lógica para a página de resultados com botões de navegação
  if (
    document.querySelector("main") &&
    document.querySelector("main").classList.contains("results-page")
  ) {
    loadVotingResults();
    setupCategoryNavigation();
  }
});
