const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const segments = [
  { text: "Cannette", color: "#F9C80E", weight: 32 },
  { text: "1 Pilon", color: "#F86624", weight: 22 },
  { text: "1 Donuts", color: "#355cea", weight: 16 },
  { text: "1 Saucisse", color: "#F9C80E", weight: 12 },
  { text: "2 Ailes", color: "#F86624", weight: 9 },
  { text: "Dessert", color: "#43BCCD", weight: 5 },
  { text: "Barquette", color: "#EA3546", weight: 4 }
];

const total = segments.reduce((sum, s) => sum + s.weight, 0);
const arc = (2 * Math.PI) / segments.length;
const center = canvas.width / 2;
const radius = center;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let i = 0; i < segments.length; i++) {
    const angle = i * arc;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + arc);
    ctx.closePath();
    ctx.fillStyle = segments[i].color;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle + arc / 2);

    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.beginPath();
    ctx.roundRect(64, -22, 110, 44, 14);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "900 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 4;
    ctx.fillText(segments[i].text, 119, 0);

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(center, center, radius - 12, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 4;
  ctx.stroke();

  for(let i = 0; i < segments.length; i++) {
    const angle = i * arc + arc / 2;
    const x = center + Math.cos(angle) * (radius - 20);
    const y = center + Math.sin(angle) * (radius - 20);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }
}

drawWheel();

function weightedRandom() {
  let rand = Math.random() * total;

  for(let item of segments) {
    if(rand < item.weight) return item;
    rand -= item.weight;
  }
}

let spinning = false;
let currentRotation = 0;

// --- INITIALISATION DU SYNTHÉTISEUR DE SONS NATIFS ---
const audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();

// Génère un bruit sec mécanique (Le "Tick" de la roulette)
function playNativeTick() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(580, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.04);
  
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.04);
}

// Génère une mélodie de victoire ascendante (La fanfare Pouletos)
function playNativeWin() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const now = audioCtx.currentTime;
  const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.50]; 
  const duration = 0.11; 
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + (index * duration));
    
    gain.gain.setValueAtTime(0.18, now + (index * duration));
    gain.gain.exponentialRampToValueAtTime(0.01, now + (index * duration) + 0.22);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now + (index * duration));
    osc.stop(now + (index * duration) + 0.25);
  });
}

// ajout vicotr pour sureté
// --- SÉCURITÉ CASE À COCHER / BOUTON GOOGLE ---
const googleButton = document.querySelector(".google-btn");

googleButton.addEventListener("click", function() {
  // Dès qu'on clique sur le bouton Google, on active la case à cocher
  checkbox.removeAttribute("disabled");
});





// 1. Récupération des 3 éléments de formulaire et du bouton pour verif et dégrisé spin-btn
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const checkbox = document.getElementById("check");
const spinButton = document.getElementById("spin-btn");



// modif pour couleurs
function checkFormValidity() {
  const nameValue = inputName.value.trim();
  const emailValue = inputEmail.value.trim();
  const isChecked = checkbox.checked;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(emailValue);

  // --- GESTION DYNAMIQUE DES COULEURS : PRÉNOM ---
  if (nameValue === "") {
    inputName.classList.remove("valid-name");
  } else {
    inputName.classList.add("valid-name");
  }

  // --- GESTION DYNAMIQUE DES COULEURS : EMAIL ---
  if (emailValue === "") {
    inputEmail.classList.remove("invalid-email", "valid-email");
  } else if (isEmailValid) {
    inputEmail.classList.remove("invalid-email");
    inputEmail.classList.add("valid-email");
  } else {
    inputEmail.classList.remove("valid-email");
    inputEmail.classList.add("invalid-email");
  }

  // --- ACTIVATION DU BOUTON ---
  if (nameValue !== "" && isEmailValid && isChecked) {
    spinButton.removeAttribute("disabled"); 
  } else {
    spinButton.setAttribute("disabled", "true"); 
  }
}



// 3. On écoute les changements en temps réel et à la perte de focus
inputName.addEventListener("input", checkFormValidity);
inputEmail.addEventListener("input", checkFormValidity);
checkbox.addEventListener("change", checkFormValidity);

// Force la vérification (et le maintien du rouge) quand on clique ailleurs
inputEmail.addEventListener("blur", checkFormValidity);

function spinWheel() {
  if(spinning) return;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const checked = document.getElementById("check").checked;

  if(!name || !email) {
    alert("Merci de remplir les champs.");
    return;
  }

  if(!checked) {
    alert("Merci de confirmer que vous avez laissé un avis Google.");
    return;
  }

  spinning = true;

  const winner = weightedRandom();
  const index = segments.findIndex(s => s.text === winner.text);
  
  const degreesPerSegment = 360 / segments.length;
  const targetAngle = 270 - (index * degreesPerSegment) - (degreesPerSegment / 2);
  const randomExtraTurns = 6 * 360;

  const currentNormalizedRotation = currentRotation % 360;
  currentRotation += randomExtraTurns + ((targetAngle - currentNormalizedRotation + 360) % 360);

  canvas.style.transform = `rotate(${currentRotation}deg)`;

  // --- GESTION ET CALCUL DU RALENTISSEMENT DES TICS AUDIO ---
  let currentTickAngle = 0;
  const totalRotationDuration = 5200; // Calé sur la transition CSS
  const startTime = performance.now();

  function trackTicks(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalRotationDuration, 1);
    
    // Reproduit la courbe d'amortissement de la roulette
    const easeProgress = 1 - Math.pow(1 - progress, 3); 
    const animatedAngle = easeProgress * (randomExtraTurns + ((targetAngle - currentNormalizedRotation + 360) % 360));

    // Si on franchit la distance d'un segment, on émet le son
    if (animatedAngle - currentTickAngle >= degreesPerSegment) {
      playNativeTick();
      currentTickAngle = animatedAngle;
    }

    if (progress < 1) {
      requestAnimationFrame(trackTicks);
    }
  }
  requestAnimationFrame(trackTicks);
  // ----------------------------------------------------------

  setTimeout(() => {
    // Déclenchement de la musique de victoire
    playNativeWin();

    const code =
      "POULETOS-" +
      Math.random().toString(36).substring(2,8).toUpperCase();

    const resultBox = document.getElementById("result");
    resultBox.style.display = "block";

    resultBox.innerHTML = `
      🎉 Bravo ${name} !<br><br>
      Tu as gagné : <strong>${winner.text}</strong><br><br>
      Code unique : <strong>${code}</strong><br><br>
      📩 Ton lot vient de t'être envoyé à l'adresse <em>${email}</em>.<br><br>
      ⚠️ <strong>Rappel :</strong> Le lot ne peut PAS être récupéré aujourd’hui.<br>
      Il est valable à partir de demain pendant 1 mois,<br>
      avec condition d’achat.
    `;

    spinning = false;

  }, totalRotationDuration);
}