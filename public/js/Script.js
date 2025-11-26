const toggleButton = document.getElementById("toggle-theme");
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.getElementById("cabecalho").classList.toggle("dark-mode");

  document.querySelectorAll("#nav li a").forEach((link) => {
    link.classList.toggle("dark-mode");
  });

  toggleButton.textContent = document.body.classList.contains("dark-mode") ? " Tema Claro" : " Tema Escuro";
});

if (localStorage.getItem("userId")) {
  document.getElementById("admin-button").textContent = "Sair";

  document.getElementById("admin-button").addEventListener("click", () => {
    localStorage.removeItem("userId");
    location.reload();
  });
} else
  document.getElementById("admin-button").addEventListener("click", (e) => {
    location.href = "/adm_login.html";
  });
