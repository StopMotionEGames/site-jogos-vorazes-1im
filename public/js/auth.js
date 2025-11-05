class Auth {
  constructor(containerId) {
    // Container principal onde o formulário será inserido
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container com id "${containerId}" não encontrado.`);
    }

    // Cria o formulário
    this.form = document.createElement("form");
    this.form.id = "auth-form";
    this.form.style.display = "flex";
    this.form.style.flexDirection = "column";
    this.form.style.gap = "10px";
    this.form.style.maxWidth = "300px";
    this.form.style.margin = "0 auto";
    this.form.style.padding = "20px";
    this.form.style.border = "1px solid #ccc";
    this.form.style.borderRadius = "10px";
    this.form.style.background = "#fff";
    this.form.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";

    // Campos
    this.nameInput = this.createInput("text", "name", "Nome");
    this.emailInput = this.createInput("email", "email", "E-mail");
    this.passwordInput = this.createInput("password", "password", "Senha");

    // Botão
    this.submitButton = document.createElement("button");
    this.submitButton.type = "submit";
    this.submitButton.textContent = "Cadastrar";
    this.submitButton.style.padding = "10px";
    this.submitButton.style.border = "none";
    this.submitButton.style.borderRadius = "5px";
    this.submitButton.style.background = "#007bff";
    this.submitButton.style.color = "#fff";
    this.submitButton.style.cursor = "pointer";
    this.submitButton.style.fontSize = "16px";

    // Mensagem de status
    this.message = document.createElement("div");
    this.message.style.textAlign = "center";
    this.message.style.marginTop = "5px";
    this.message.style.fontSize = "14px";

    // Adiciona tudo ao form
    this.form.append(
      this.nameInput,
      this.emailInput,
      this.passwordInput,
      this.submitButton,
      this.message
    );

    // Adiciona o form ao container
    this.container.appendChild(this.form);

    // Evento de envio
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  // Cria inputs
  createInput(type, id, placeholder) {
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.name = id; // importante para forms
    input.placeholder = placeholder;
    input.required = true;
    input.style.padding = "10px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "5px";
    input.style.fontSize = "16px";
    return input;
  }

  // Envia o formulário
  async handleSubmit(e) {
    e.preventDefault();

    const name = this.nameInput.value.trim();
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value.trim();

    if (!name || !email || !password) {
      this.showMessage("Preencha todos os campos!", "red");
      return;
    }

    this.showMessage("Enviando...", "black");

    try {
      const res = await fetch("/register", {
        // endpoint ajustado
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        this.showMessage(data.error || "Erro ao cadastrar!", "red");
      } else {
        this.showMessage(`Usuário ${data.name} cadastrado!`, "green");
        this.form.reset();
        localStorage.setItem("userId", data.id); // apenas id
      }
    } catch (err) {
      this.showMessage("Erro de conexão com o servidor.", "red");
      console.error(err);
    }
  }

  showMessage(text, color) {
    this.message.textContent = text;
    this.message.style.color = color;
  }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new Auth("form-container");
});
