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

let numeroAtual = null;

// Ícones modernos para os títulos (usando estrelas para representar os tamanhos)
const iconStar = '<span class="material-icons-round" style="font-size: 1.3em;">star_rate</span>';

// DEFINIÇÃO DOS BLOCOS COM ÍCONES MODERNOS NA STRING HTML
const blocos = [
    { inicio: 1, fim: 20, titulo: `${iconStar} Fralda P + Mimo (01 ao 20)` },
    { inicio: 21, fim: 90, titulo: `${iconStar}${iconStar} Fralda M + Mimo (21 ao 90)` },
    { inicio: 91, fim: 120, titulo: `${iconStar}${iconStar}${iconStar} Fralda G + Mimo (91 ao 120)` }
];

// --- MÁSCARA WHATSAPP ---
const inputTelefone = document.getElementById('telefone');
if(inputTelefone) {
    inputTelefone.addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (x.length > 10) e.target.value = x.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        else if (x.length > 6) e.target.value = x.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        else if (x.length > 2) e.target.value = x.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        else e.target.value = x;
    });
}

// --- MODAIS ---
window.fecharModais = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-sucesso').style.display = 'none';
}

function abrirModalSucesso(numero) {
    fecharModais();
    document.getElementById('sucesso-numero').innerText = numero.toString().padStart(3, '0');
    document.getElementById('modal-sucesso').style.display = 'flex'; 
}

window.onclick = (event) => {
    if (event.target.classList.contains('modal')) window.fecharModais();
}

// --- CRIAÇÃO DOS GRIDS SEPARADOS ---
function criarGrid() {
    const containerPrincipal = document.getElementById('rifa-container');
    if(!containerPrincipal) return; 
    containerPrincipal.innerHTML = ''; 

    blocos.forEach(bloco => {
        // 1. Cria o Título da Seção (usando innerHTML para renderizar os ícones)
        const titulo = document.createElement('h3');
        titulo.className = 'titulo-secao';
        titulo.innerHTML = bloco.titulo; // innerHTML permite as tags dos ícones
        containerPrincipal.appendChild(titulo);

        // 2. Cria o Grid desta seção
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid-rifa';

        for (let i = bloco.inicio; i <= bloco.fim; i++) {
            const div = document.createElement('div');
            div.classList.add('numero');
            div.id = `num-${i}`;
            div.textContent = i.toString().padStart(3, '0');
            div.onclick = () => abrirModal(i);
            gridDiv.appendChild(div);
        }
        
        containerPrincipal.appendChild(gridDiv);
    });
}

// Escuta Firebase
onSnapshot(collection(db, "rifa"), (snapshot) => {
    snapshot.forEach((doc) => {
        const dados = doc.data();
        const el = document.getElementById(`num-${doc.id}`);
        if (el) { 
            if (dados.status !== 'livre') {
                el.classList.remove('livre', 'reservado', 'pago');
                el.classList.add(dados.status);
            } else {
                el.classList.remove('reservado', 'pago');
                el.classList.add('livre');
            }
        }
    });
});

window.abrirModal = (n) => {
    const el = document.getElementById(`num-${n}`);
    if (el.classList.contains('reservado') || el.classList.contains('pago')) {
        alert("Número já escolhido! Por favor, escolha outro."); 
        return;
    }
    numeroAtual = n;
    
    let textoFralda = "";
    if (n <= 20) textoFralda = "Fralda P + Mimo";
    else if (n <= 90) textoFralda = "Fralda M + Mimo";
    else textoFralda = "Fralda G + Mimo";
    
    document.getElementById('tipo-fralda').innerText = textoFralda;
    document.getElementById('num-selecionado').innerText = n.toString().padStart(3, '0');
    
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('modal').style.display = "flex"; 
}

window.confirmarReserva = async () => {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const botao = document.querySelector('#modal .btn-confirmar');

    if (!nome || telefone.length < 14) { 
        alert("Preencha seu nome e WhatsApp corretamente!");
        return;
    }

    botao.disabled = true;
    // Ícone de loading no botão
    botao.innerHTML = '<span class="material-icons-round animation-spin">sync</span> Aguarde...';

    try {
        await setDoc(doc(db, "rifa", String(numeroAtual)), {
            nome: nome,
            telefone: telefone,
            status: "reservado",
            data: new Date().toISOString()
        });
        abrirModalSucesso(numeroAtual);
    } catch (e) {
        console.error(e);
        alert("Erro ao reservar. Tente novamente.");
    } finally {
        botao.disabled = false;
        botao.innerText = "Confirmar Reserva";
    }
}

criarGrid();