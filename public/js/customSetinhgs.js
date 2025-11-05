const apiUrl = "http://localhost:8443/api/settings/theme";
//const userId = localStorage.getItem("userId");
const userId = 1125;// valor fixo para teste (pode vir do login)
const toggleButton = document.getElementById("toggle-theme");

// Checa se o botão e o userId existem
if (!toggleButton) {
  console.error("Botão de alternar tema não encontrado.");
}
if (!userId) {
  console.error("User ID não encontrado no localStorage.");
}

// Função principal
async function initTheme() {
  await loadSettings();
  updateButtonText();
}

// Evento de clique no botão
toggleButton.addEventListener("click", async () => {
  toggleTheme();
  const theme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";
  await saveSettings(userId, theme);
  updateButtonText();
});

// Alterna o tema no frontend
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  document.getElementById("cabecalho")?.classList.toggle("dark-mode");

  document.querySelectorAll("#nav li a").forEach((link) => {
    link.classList.toggle("dark-mode");
  });
}

// Atualiza texto do botão conforme o tema atual
function updateButtonText() {
  toggleButton.textContent = document.body.classList.contains("dark-mode")
    ? " Tema Claro"
    : " Tema Escuro";
}

// Aplica um tema específico (sem alternar)
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  document.getElementById("cabecalho")?.classList.toggle("dark-mode", isDark);

  document.querySelectorAll("#nav li a").forEach((link) => {
    link.classList.toggle("dark-mode", isDark);
  });
}

// Salva configurações no backend
async function saveSettings(userId, theme) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(userId, 10),
        theme,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar as configurações");
    }

    const data = await response.json();
    console.log("Configurações salvas:", data);
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
  }
}

// Carrega configurações do backend
async function loadSettings() {
  if (!userId) return;

  try {
    const response = await fetch(`${apiUrl}/${userId}`);
    if (!response.ok) {
      throw new Error("Erro ao carregar as configurações");
    }

    const data = await response.json();
    console.log("Configurações carregadas:", data);

    if (data.theme === "dark") {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
}

// Executa no carregamento da página
initTheme();
