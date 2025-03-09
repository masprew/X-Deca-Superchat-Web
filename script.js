let messages = JSON.parse(localStorage.getItem("messages")) || [];
let likedMessages = new Set(JSON.parse(localStorage.getItem("likedMessages")) || []);
let usedNames = new Set(messages.map(msg => msg.user.replace(" 👑", ""))); // Simpan nama yang sudah digunakan tanpa mahkota

const adminNames = ["Deca", "deca", "Zavier", "zavier", "Yopan", "yopan"]; // Daftar nama yang mendapatkan mahkota
const crownEmoji = "👑";

// Fungsi untuk menghapus emoji dari nama (mencegah pengguna lain menambahkan emoji di nama)
function removeEmojis(text) {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
}

function sendMessage() {
  let username = document.getElementById("username").value.trim();
  const message = document.getElementById("message").value.trim();
  
  if (!username || !message) {
    alert("Nama dan pesan tidak boleh kosong!");
    return;
  }
  
  // Hapus emoji dari nama
  username = removeEmojis(username);
  
  // Cek apakah nama sudah digunakan
  if (usedNames.has(username)) {
    alert("Nama sudah digunakan! Silakan gunakan nama lain.");
    return;
  }
  
  // Jika nama ada di daftar adminNames, tambahkan emoji mahkota
  if (adminNames.includes(username)) {
    username += ` ${crownEmoji}`;
  }
  
  usedNames.add(username.replace(" 👑", "")); // Simpan nama tanpa mahkota
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  
  const newMessage = {
    id: Date.now(),
    user: username || "Anonim",
    text: message,
    likes: 0,
    date: formattedDate
  };
  
  messages.push(newMessage);
  localStorage.setItem("messages", JSON.stringify(messages));
  document.getElementById("message").value = "";
  displayMessages();
  updateLeaderboard();
}

function likeMessage(id) {
  if (likedMessages.has(id)) {
    alert("Anda sudah memberi like pada pesan ini!");
    return;
  }
  
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.likes++;
    likedMessages.add(id);
    localStorage.setItem("messages", JSON.stringify(messages));
    localStorage.setItem("likedMessages", JSON.stringify(Array.from(likedMessages)));
    displayMessages();
    updateLeaderboard();
  }
}

function deleteMessage(id) {
  const msgIndex = messages.findIndex(m => m.id === id);
  if (msgIndex !== -1) {
    let messageUser = messages[msgIndex].user.replace(" 👑", ""); // Ambil nama tanpa mahkota
    if (adminNames.includes(messageUser)) {
      usedNames.delete(messageUser); // Hapus nama dari daftar yang sudah dipakai
      messages.splice(msgIndex, 1);
      localStorage.setItem("messages", JSON.stringify(messages));
      displayMessages();
      updateLeaderboard();
    }
  }
}

function displayMessages() {
  const messageList = document.getElementById("messageList");
  messageList.innerHTML = "";
  
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<strong>${msg.user || "Anonim"}:</strong> ${msg.text} <br>
                         <span class="date">${msg.date}</span> <br>
                         <button class="like-btn" onclick="likeMessage(${msg.id})" ${likedMessages.has(msg.id) ? "disabled" : ""}>❤️ ${msg.likes}</button>`;
    
    // Hanya admin yang bisa menghapus pesan mereka sendiri
    let messageUser = msg.user.replace(" 👑", "");
    if (adminNames.includes(messageUser)) {
      div.innerHTML += ` <button class="delete-btn" onclick="deleteMessage(${msg.id})">🗑 Hapus</button>`;
    }
    
    messageList.appendChild(div);
  });
}

function updateLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";
  
  const sortedMessages = [...messages]
    .filter(msg => msg.likes > 0)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);
  
  if (sortedMessages.length === 0) {
    leaderboard.innerHTML = "<p>Belum ada top global like</p>";
    return;
  }
  
  sortedMessages.forEach((msg, index) => {
    const div = document.createElement("div");
    div.classList.add("leaderboard-item");
    
    // Nama di leaderboard akan berkilau jika memiliki emoji mahkota
    if (msg.user.includes(crownEmoji)) {
      div.style.animation = "shine 1.5s infinite alternate";
    }
    
    div.innerHTML = `#${index + 1} ${msg.user || "Anonim"} - ${msg.likes} Like`;
    leaderboard.appendChild(div);
  });
}

// Tambahkan animasi berkilau di CSS
const style = document.createElement("style");
style.innerHTML = `
    @keyframes shine {
        0% { text-shadow: 0 0 5px gold, 0 0 10px gold; }
        100% { text-shadow: 0 0 10px gold, 0 0 20px gold; }
    }
`;
document.head.appendChild(style);

function clearAllMessages() {
  localStorage.removeItem("messages");
  localStorage.removeItem("likedMessages");
  location.reload();
}

displayMessages();
updateLeaderboard();