const API = "/api/posts";

class Posts {
  constructor() {
    this.container = document.getElementById("posts-container");
    this.displayPosts = document.getElementById("display-posts");
    this.createPostsBtn = document.getElementById("to-post");

    // Formulário (inicialmente oculto)
    this.formposts = document.createElement("form");
    this.formposts.id = "form-posts";
    this.formposts.style.display = "none";
    this.formposts.style.flexDirection = "column";
    this.formposts.style.width = "300px";
    this.formposts.style.margin = "20px auto";
    this.formposts.style.padding = "20px";
    this.formposts.style.border = "1px solid #ccc";
    this.formposts.style.borderRadius = "5px";
    this.formposts.style.backgroundColor = "#f9f9f9";
    this.formposts.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";

    // Inputs
    this.titleinp = this.createInput("text", "title", "Título do post");

    this.contentinp = document.createElement("textarea");
    this.contentinp.id = "content";
    this.contentinp.placeholder = "Conteúdo do post";
    this.contentinp.rows = 5;
    this.contentinp.required = true;
    this.contentinp.style.marginBottom = "10px";
    this.contentinp.style.padding = "10px";
    this.contentinp.style.border = "1px solid #ccc";
    this.contentinp.style.borderRadius = "5px";

    // Input de mídia
    this.mediaInput = document.createElement("input");
    this.mediaInput.type = "file";
    this.mediaInput.accept = "image/*,video/*";
    this.mediaInput.style.marginBottom = "10px";

    // Botão de envio
    this.submitbtn = document.createElement("button");
    this.submitbtn.type = "submit";
    this.submitbtn.textContent = "Criar Post";
    this.submitbtn.style.padding = "10px";
    this.submitbtn.style.border = "none";
    this.submitbtn.style.borderRadius = "5px";
    this.submitbtn.style.backgroundColor = "#28a745";
    this.submitbtn.style.color = "#fff";
    this.submitbtn.style.cursor = "pointer";
    this.submitbtn.style.fontSize = "16px";

    // Mensagem de status
    this.message = document.createElement("div");
    this.message.style.textAlign = "center";
    this.message.style.marginTop = "10px";
    this.message.style.fontSize = "14px";

    // Adiciona inputs ao form
    this.formposts.append(
      this.titleinp,
      this.contentinp,
      this.mediaInput,
      this.submitbtn,
      this.message
    );

    // Adiciona form ao container
    this.container.appendChild(this.formposts);

    // Evento para mostrar/esconder formulário ao clicar no botão
    this.createPostsBtn.addEventListener("click", () => {
      this.formposts.style.display =
        this.formposts.style.display === "none" ? "flex" : "none";
    });

    // Evento de envio
    this.formposts.addEventListener("submit", (e) => this.handleSubmit(e));

    // Carrega posts existentes
    this.loadPosts();
  }

  createInput(type, id, placeholder) {
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.placeholder = placeholder;
    input.required = true;
    input.style.marginBottom = "10px";
    input.style.padding = "10px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "5px";
    return input;
  }

  /**@param {SubmitEvent} e */
  async handleSubmit(e) {
    e.preventDefault();

    const title = this.titleinp.value.trim();
    const content = this.contentinp.value.trim();
    const mediaFile = this.mediaInput.files[0];
    const userId = 1125; // valor fixo para teste (pode vir do login)

    if (!userId) {
      this.showMessage("Usuário não encontrado. Faça login.", "red");
      return;
    }

    if (!title || !content) {
      this.showMessage("Preencha todos os campos!", "red");
      return;
    }

    this.showMessage("Enviando post...", "black");

    try {
      // Cria o formData manualmente (sem reaproveitar o <form>)
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("user_id", userId);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      // Apenas para depuração — mostra o conteúdo do FormData no console
      for (let [key, value] of formData.entries()) {
        console.log(key + ":", value);
      }

      // Envia via fetch (sem headers, pois FormData define automaticamente)
      const res = await fetch(API, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        this.showMessage(data.error || "Erro ao criar post!", "red");
      } else {
        this.showMessage("Post criado com sucesso!", "green");
        this.formposts.reset();
        await this.loadPosts();
      }
    } catch (err) {
      console.error("Erro no envio:", err);
      this.showMessage("Erro de conexão com o servidor.", "red");
    }
  }

  showMessage(msg, color) {
    this.message.textContent = msg;
    this.message.style.color = color;
  }

  async loadPosts() {
    try {
      const res = await fetch(API);
      const posts = await res.json();

      this.displayPosts.innerHTML = "";
      posts.forEach((post) => this.appendPost(post));
    } catch (err) {
      console.error(err);
      this.showMessage("Erro ao carregar posts.", "red");
    }
  }

  appendPost(post) {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");
    postDiv.style.border = "1px solid #ccc";
    postDiv.style.padding = "10px";
    postDiv.style.marginBottom = "10px";
    postDiv.style.borderRadius = "5px";

    let mediaHTML = "";
    if (post.media_type === "image") {
      mediaHTML = `<img src="${post.media_url}" width="200" />`;
    } else if (post.media_type === "video") {
      mediaHTML = `<video width="200" controls src="${post.media_url}"></video>`;
    }

    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      ${mediaHTML}
      <small>Criado por: ${post.user_name || "Usuário"}</small>
      <hr>
    `;

    this.displayPosts.appendChild(postDiv);
  }
}

new Posts();
