const API = "http://localhost:3000/posts";

const displayPosts = document.getElementById("display-posts");
const postForm = document.getElementById("postform");

// Enviar o formulário (criar post)
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(postForm);

  try {
    const response = await fetch(API, {
      method: "POST",
      body: data,
    });

    if (!response.ok) throw new Error("Falha ao criar post");

    const newPost = await response.json();

    appendPost(newPost); // Mostra o novo post
    postForm.reset(); // Limpa o formulário

    loadPosts(); // Atualiza lista completa
  } catch (error) {
    console.error("Erro:", error);
  }
});

// ⚠️ Corrigir: estava escrito "asinc", o certo é "async"
async function loadPosts() {
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error("Falha ao buscar posts");

    const posts = await response.json();
    displayPosts.innerHTML = "";

    posts.forEach(appendPost);
  } catch (error) {
    console.error("Erro:", error);
  }
}

// Função para adicionar posts na tela
function appendPost(post) {
  const postDiv = document.createElement("div");
  postDiv.classList.add("post");

  let mediaHTML = "";

  if (post.media_type === "image") {
    mediaHTML = `<img src="http://localhost:3000${post.media_url}" alt="imagem do post" width="200" />`;
  } else if (post.media_type === "video") {
    mediaHTML = `<video width="200" controls src="http://localhost:3000${post.media_url}"></video>`;
  }

  postDiv.innerHTML = `
    <p><strong>${post.user_name || "Usuário"}:</strong> ${post.content}</p>
    ${mediaHTML}
    <button onclick="deletePost(${post.id})">🗑️ Deletar</button>
    <hr>
  `;

  displayPosts.appendChild(postDiv);
}

// Função para deletar um post
async function deletePost(id) {
  if (!confirm("Tem certeza que deseja excluir este post?")) return;

  try {
    const response = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Erro ao deletar post");

    loadPosts(); // Atualiza lista após deletar
  } catch (error) {
    console.error("Erro ao deletar:", error);
  }
}

// Carrega os posts ao abrir a página
loadPosts();
