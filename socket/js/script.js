const socket = io("http://localhost:3000", { path: "/socket" });

const username = localStorage.getItem("username");
const room = localStorage.getItem("room");

// Jika tidak ada data, kembali ke halaman login
if (!username || !room) {
    window.location.href = "client.html";
}

// Tampilkan nama room di header
document.getElementById("room-name").textContent = `Room: ${room}`;

// Gabung ke room setelah masuk ke chat
socket.emit("join-room", { username, room });

// **Kirim pesan teks ke server**
function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();

    if (message) {
        socket.emit("chat-room", { username, room, message });
        messageInput.value = ""; // Kosongkan input setelah kirim
    }
}

// **Auto-scroll ke bawah saat pesan masuk**
function scrollToBottom() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

// **Tampilkan pesan di layar chat**
function displayMessage(sender, message, type) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    if (type === "other") {
        messageElement.innerHTML = `<span class="sender">${sender}</span><br>${message}`;
    } else {
        messageElement.innerHTML = `${message}`;
    }

    chatBox.appendChild(messageElement);
    scrollToBottom(); // Scroll otomatis ke pesan terbaru
}

// **Terima pesan dari server dan tampilkan hanya satu kali**
socket.on("room-message", (data) => {
    displayMessage(data.username, data.message, data.username === username ? "self" : "other");
});

// **Preview Gambar Sebelum Dikirim**
function previewImage() {
    const file = document.getElementById("image-input").files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("preview-img").src = e.target.result;
            document.getElementById("image-modal").style.display = "flex"; // Tampilkan modal
        };
        reader.readAsDataURL(file);
    }
}

// **Batalkan Pengiriman Gambar**
function cancelImage() {
    document.getElementById("image-modal").style.display = "none"; // Sembunyikan modal
    document.getElementById("image-input").value = ""; // Reset input file
}

// **Kirim Gambar ke Server**
function sendImage() {
    const imageSrc = document.getElementById("preview-img").src;

    if (imageSrc) {
        socket.emit("chat-image", { username, room, image: imageSrc });
        cancelImage(); // Tutup modal
    }
}

// **Tampilkan Gambar di Chat**
function displayImage(sender, imageSrc, type) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    if (type === "other") {
        messageElement.innerHTML = `<span class="sender">${sender}</span><br><img src="${imageSrc}" class="chat-image">`;
    } else {
        messageElement.innerHTML = `<img src="${imageSrc}" class="chat-image">`;
    }

    chatBox.appendChild(messageElement);
    scrollToBottom(); // Scroll otomatis ke pesan terbaru
}

// **Terima Gambar dari Server**
socket.on("room-image", (data) => {
    displayImage(data.username, data.image, data.username === username ? "self" : "other");
});

// **Tombol Enter untuk Kirim Pesan**
document.getElementById("message").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Fungsi keluar dari chat
function exitChat() {
    const username = localStorage.getItem("username");
    const room = localStorage.getItem("room");

    if (username && room) {
        socket.emit("leave-room", { username, room });
    }

    // Hapus data dari localStorage dan kembali ke halaman utama
    localStorage.removeItem("username");
    localStorage.removeItem("room");
    window.location.href = "client.html";
}

function updateTime() {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
}
setInterval(updateTime, 1000);
updateTime();