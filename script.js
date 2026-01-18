import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// SUAS CONFIGURAÇÕES (Não precisa mexer)
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
    document.getElementById('modal-sucesso').style.display = 'block'; // abre o bonito
}

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
        
        // Formata número (001, 002...)
        let numFormatado = i.toString().padStart(3, '0');
        div.textContent = numFormatado;
        
        div.onclick = () => abrirModal(i);
        grid.appendChild(div);
    }
}

// Escuta o banco de dados
onSnapshot(collection(db, "rifa"), (snapshot) => {
    snapshot.forEach((doc) => {
        const dados = doc.data();
        const el = document.getElementById(`num-${doc.id}`);
        if (el && dados.status !== 'livre') { // Só muda se não for livre
            el.classList.remove('livre', 'reservado', 'pago');
            el.classList.add(dados.status);
        } else if (el && dados.status === 'livre') {
             // Caso o admin libere, volta a ser verde
             el.classList.remove('reservado', 'pago');
             el.classList.add('livre');
        }
    });
    
    // Varredura extra para limpar números deletados (caso você delete no admin)
    // (Simplificado: Se o doc for deletado, ele não aparece no snapshot.forEach padrão
    // mas para manter simples, o admin vai mudar o status para 'livre' em vez de deletar)
});

window.abrirModal = (n) => {
    const el = document.getElementById(`num-${n}`);
    if (el.classList.contains('reservado') || el.classList.contains('pago')) {
        // Se quiser um aviso personalizado aqui também, me avise.
        // Por enquanto, alert é o menos intrusivo para erro rápido.
        alert("Este número já foi escolhido!"); 
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
        
        // AQUI ESTÁ A MUDANÇA: Chama o modal bonito em vez do alert
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