// js/resultsDisplay.js

const categoryIdMap = {
  votacao1: "categoria1",
  votacao2: "categoria2",
  votacao3: "categoria3",
  votacao4: "categoria4",
};

let dadosMaisVotados = {}; // Mantenha isso aqui para os resultados

export async function loadVotingResults() {
  try {
    const response = await fetch("http://localhost:3000/votacao/mais-votados");
    dadosMaisVotados = await response.json();
    renderCategoria(1); // Exibe a primeira categoria por padrão
  } catch (error) {
    console.error("Erro ao carregar resultados:", error);
    const topProjects = document.getElementById("topProjects");
    if (topProjects) {
      topProjects.innerHTML = `<p style="color:red;">Erro ao carregar resultados. Tente novamente mais tarde.</p>`;
    }
  }
}

export function renderCategoria(categoriaNumero) {
  const backendCategoryName = categoryIdMap[`votacao${categoriaNumero}`];
  const resultados = dadosMaisVotados[backendCategoryName];

  if (!resultados) return;

  const categoryTitle = document.getElementById("categoryTitle");
  if (categoryTitle) {
    categoryTitle.innerHTML = `<h2>🏆 Resultados da ${categoriaNumero}ª Categoria</h2>`;
  }

  const topProjects = document.getElementById("topProjects");
  if (topProjects) {
    topProjects.innerHTML = "";

    const medalhas = ["🥇", "🥈", "🥉"];
    const cores = ["#f9f9f9", "#f0f0f0", "#e9e9e9"];

    resultados.forEach((projeto, index) => {
      const div = document.createElement("div");
      div.className = "project podium";
      div.style.background = cores[index];
      div.style.padding = "1rem";
      div.style.borderRadius = "8px";
      div.style.marginBottom = "1rem";
      div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

      div.innerHTML = `
                <h3>${medalhas[index]} ${index + 1}º Lugar: Projeto #${projeto.projetoId}</h3>
                <p>Total de Votos: ${projeto.totalVotos}</p>
            `;
      topProjects.appendChild(div);
    });
  }
}

export function setupCategoryNavigation() {
  document.querySelectorAll(".category-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      const categoriaNumero = button.getAttribute("data-category");
      renderCategoria(categoriaNumero);
    });
  });
}

export async function loadVotingResultsDetails() {
  try {
    if (!document.getElementById("resultsPageContainer")) {
      return;
    }

    const maisVotadosResponse = await fetch(
      "http://localhost:3000/votacao/mais-votados",
    );
    const maisVotados = await maisVotadosResponse.json();

    const totalVotosResponse = await fetch(
      "http://localhost:3000/votacao/total-votos",
    );
    const totalVotos = await totalVotosResponse.json();

    const frontendCategoryNames = {
      categoria1: "Categoria Maker Starter",
      categoria2: "Categoria Plus",
      categoria3: "Categoria Senior",
      categoria4: "Categoria Master",
    };

    const mainContainer = document.querySelector("main");
    if (!mainContainer) return;

    for (const backendId of Object.values(categoryIdMap)) {
      const projetoVencedor = maisVotados[backendId];
      const votosCategoria = totalVotos.find(
        (item) => item.categoriaId === backendId,
      );

      if (!projetoVencedor || !votosCategoria) {
        console.warn(`Dados incompletos para categoria: ${backendId}`);
        continue;
      }

      const section = document.createElement("section");
      section.className = "voting-section";

      const h2 = document.createElement("h2");
      h2.textContent = frontendCategoryNames[backendId] || backendId;
      section.appendChild(h2);

      const pProjeto = document.createElement("p");
      const strongProjeto = document.createElement("strong");
      strongProjeto.textContent = "Projeto Vencedor: ";
      const spanProjeto = document.createElement("span");
      spanProjeto.style.color = "#4CAF50";
      spanProjeto.textContent = `#${projetoVencedor.projetoId}`;

      pProjeto.appendChild(strongProjeto);
      pProjeto.appendChild(spanProjeto);
      section.appendChild(pProjeto);

      const pVotos = document.createElement("p");
      const strongVotos = document.createElement("strong");
      strongVotos.textContent = "Total de Votos: ";
      pVotos.appendChild(strongVotos);
      pVotos.appendChild(document.createTextNode(projetoVencedor.totalVotos));
      section.appendChild(pVotos);

      const divEleitores = document.createElement("div");
      divEleitores.className = "eleitor-list";

      const h3Eleitores = document.createElement("h3");
      h3Eleitores.textContent = "Eleitores:";
      divEleitores.appendChild(h3Eleitores);

      const table = document.createElement("table");
      table.className = "votos-table";
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";
      table.style.marginTop = "10px";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      ["Eleitor", "Projeto"].forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.border = "1px solid #ccc";
        th.style.padding = "8px";
        th.style.backgroundColor = "#f2f2f2";
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      const votosAgrupados = {};
      votosCategoria.votos.forEach((voto) => {
        if (!votosAgrupados[voto.projetoId]) {
          votosAgrupados[voto.projetoId] = [];
        }
        votosAgrupados[voto.projetoId].push(voto.eleitorId);
      });

      Object.entries(votosAgrupados).forEach(([projetoId, eleitores]) => {
        eleitores.forEach((eleitorId, index) => {
          const row = document.createElement("tr");

          const tdEleitor = document.createElement("td");
          tdEleitor.textContent = `#${eleitorId}`;
          tdEleitor.style.border = "1px solid #ccc";
          tdEleitor.style.padding = "8px";

          const tdProjeto = document.createElement("td");
          tdProjeto.textContent = index === 0 ? `#${projetoId}` : "";
          tdProjeto.style.border = "1px solid #ccc";
          tdProjeto.style.padding = "8px";

          row.appendChild(tdEleitor);
          row.appendChild(tdProjeto);
          tbody.appendChild(row);
        });
      });

      table.appendChild(tbody);
      divEleitores.appendChild(table);
      section.appendChild(divEleitores);

      mainContainer.appendChild(section);
    }
  } catch (error) {
    console.error("Erro ao carregar os dados da votação:", error);
    const errorSection = document.createElement("section");
    errorSection.className = "error-message";

    const h2 = document.createElement("h2");
    h2.textContent = "Erro ao carregar os resultados";
    errorSection.appendChild(h2);

    const p = document.createElement("p");
    p.textContent =
      "Não foi possível carregar os dados da votação. Por favor, tente recarregar a página.";
    errorSection.appendChild(p);

    document.querySelector("main").appendChild(errorSection);
  }
}

export function setupCountdown() {
  const countdownElement = document.getElementById("countdown");
  if (countdownElement) {
    let timeLeft = 5;
    countdownElement.textContent = timeLeft;

    const timerInterval = setInterval(() => {
      timeLeft--;
      countdownElement.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        window.location.href = "/index";
      }
    }, 1000);
  }
}
