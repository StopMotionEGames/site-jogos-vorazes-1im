const toggleButton = document.getElementById("toggle-theme");
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.getElementById("cabecalho").classList.toggle("dark-mode");

  document.querySelectorAll("#nav li a").forEach((link) => {
    link.classList.toggle("dark-mode");
  });

  toggleButton.textContent = document.body.classList.contains("dark-mode")
    ? " Tema Claro"
    : " Tema Escuro";
});
