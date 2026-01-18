import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyACBB_r8sPsXaIy7L9k2CkMd2rwk3wUrYc",
  authDomain: "rifa-7c72f.firebaseapp.com",
  projectId: "rifa-7c72f",
  storageBucket: "rifa-7c72f.firebasestorage.app",
  messagingSenderId: "1004880007031",
  appId: "1:1004880007031:web:19746f53c62691d9eb9b72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const totalNumeros = 150; 
const grid = document.getElementById('grid-rifa');
let numeroAtual = null;

// --- FUNÇÕES VISUAIS ---
window.fecharModais = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-sucesso').style.display = 'none';
}

function abrirModalSucesso(numero) {
    document.getElementById('modal').style.display = 'none'; // fecha o de compra
    document.getElementById('sucesso-numero').innerText = numero;
    document.getElementById('modal-sucesso').style.display = 'block'; // abre o de sucesso
}

// Fecha clicando fora
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) window.fecharModais();
}

// --- LÓGICA DO GRID ---
function criarGrid() {
    if(!grid) return; 
    grid.innerHTML = ''; 
    for (let i = 1; i <= totalNumeros; i++) {
        const div = document.createElement('div');
        div.classList.add('numero');
        div.id = `num-${i}`;
        
        // Formata número (01, 02... 150)
        let numFormatado = i.toString();
        if (i < 10) numFormatado = '0' + i;
        if (i < 100) numFormatado = '0' + numFormatado; // Ajuste simples para 3 digitos se necessario, mas 01-99 e 100+ funciona bem.
        if (i < 100) numFormatado = i.toString().padStart(2, '0'); // garante 01, 09, 10
        if (totalNumeros >= 100) numFormatado = i.toString().padStart(3, '0'); // garante 001, 050, 150

        div.textContent = numFormatado;
        div.onclick = () => abrirModal(i);
        grid.appendChild(div);
    }
}

onSnapshot(collection(db, "rifa"), (snapshot) => {
    snapshot.forEach((doc) => {
        const dados = doc.data();
        const el = document.getElementById(`num-${doc.id}`);
        if (el) {
            el.classList.remove('livre', 'reservado', 'pago');
            el.classList.add(dados.status);
        }
    });
});

window.abrirModal = (n) => {
    const el = document.getElementById(`num-${n}`);
    if (el.classList.contains('reservado') || el.classList.contains('pago')) {
        // Você pode criar um modal de "Indisponível" aqui se quiser, mas alert é ok para erro
        alert("Este número já foi escolhido por outra pessoa!"); 
        return;
    }
    numeroAtual = n;
    document.getElementById('num-selecionado').innerText = n.toString().padStart(3, '0');
    document.getElementById('modal').style.display = "block";
}

window.confirmarReserva = async () => {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const botao = document.querySelector('#modal button');

    if (!nome || !telefone) {
        alert("Preencha seu nome e WhatsApp!");
        return;
    }

    botao.disabled = true;
    botao.innerText = "Reservando...";

    try {
        await setDoc(doc(db, "rifa", String(numeroAtual)), {
            nome: nome,
            telefone: telefone,
            status: "reservado",
            data: new Date().toISOString()
        });
        
        abrirModalSucesso(numeroAtual);
        
        // Limpa formulário
        document.getElementById('nome').value = '';
        document.getElementById('telefone').value = '';

    } catch (e) {
        console.error(e);
        alert("Erro ao reservar. Tente novamente.");
    } finally {
        botao.disabled = false;
        botao.innerText = "Confirmar Reserva";
    }
}

criarGrid();