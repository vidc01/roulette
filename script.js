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

// --- SYNTHÉTISEUR DE SONS NATIFS ---
const audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();

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

// --- BOUTON GOOGLE ---
const googleButton = document.querySelector(".google-btn");
googleButton.addEventListener("click", function() {
  checkbox.removeAttribute("disabled");
});

// --- FORMULAIRE ---
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const checkbox = document.getElementById("check");
const spinButton = document.getElementById("spin-btn");

function checkFormValidity() {
  const nameValue = inputName.value.trim();
  const emailValue = inputEmail.value.trim();
  const isChecked = checkbox.checked;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(emailValue);

  if (nameValue === "") {
    inputName.classList.remove("valid-name");
  } else {
    inputName.classList.add("valid-name");
  }

  if (emailValue === "") {
    inputEmail.classList.remove("invalid-email", "valid-email");
  } else if (isEmailValid) {
    inputEmail.classList.remove("invalid-email");
    inputEmail.classList.add("valid-email");
  } else {
    inputEmail.classList.remove("valid-email");
    inputEmail.classList.add("invalid-email");
  }

  if (nameValue !== "" && isEmailValid && isChecked) {
    spinButton.removeAttribute("disabled"); 
  } else {
    spinButton.setAttribute("disabled", "true"); 
  }
}

inputName.addEventListener("input", checkFormValidity);
inputEmail.addEventListener("input", checkFormValidity);
checkbox.addEventListener("change", checkFormValidity);
inputEmail.addEventListener("blur", checkFormValidity);

// --- ENVOI DE MAIL VIA LA FONCTION SÉCURISÉE ---
async function sendConfirmationEmail(nomClient, emailClient, lot, code) {
  try {
    const reponse = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailClient, nomClient, lot, code })
    });

    if (!reponse.ok) {
      console.error("Erreur lors de l'envoi du mail de confirmation.");
    }
  } catch (err) {
    console.error("Impossible de contacter la fonction d'envoi :", err);
  }
}

// --- ROULETTE ---
function spinWheel() {
  if (spinning) return;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const checked = document.getElementById("check").checked;

  if (!name || !email) {
    alert("Merci de remplir les champs.");
    return;
  }

  if (!checked) {
    alert("Merci de confirmer que vous avez laissé un avis Google.");
    return;
  }

  // --- VÉRIFICATION 24H PAR EMAIL ---
  const storageKey = "pouletos_spin_" + email.toLowerCase();
  const existingEntry = localStorage.getItem(storageKey);

  if (existingEntry) {
    const { timestamp } = JSON.parse(existingEntry);
    const elapsed = Date.now() - timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (elapsed < twentyFourHours) {
      const remaining = twentyFourHours - elapsed;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      alert(`⏳ Tu as déjà joué avec cette adresse email.\nReviens dans ${hours}h ${minutes}min ou utilise une autre adresse.`);
      return;
    }
  }

  spinning = true;
  spinButton.setAttribute("disabled", "true");

  const winner = weightedRandom();
  const index = segments.findIndex(s => s.text === winner.text);

  const degreesPerSegment = 360 / segments.length;
  const targetAngle = 270 - (index * degreesPerSegment) - (degreesPerSegment / 2);
  const randomExtraTurns = 6 * 360;

  const currentNormalizedRotation = currentRotation % 360;
  currentRotation += randomExtraTurns + ((targetAngle - currentNormalizedRotation + 360) % 360);

  canvas.style.transform = `rotate(${currentRotation}deg)`;

  // --- TICKS AUDIO ---
  let currentTickAngle = 0;
  const totalRotationDuration = 5200;
  const startTime = performance.now();

  function trackTicks(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalRotationDuration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const animatedAngle = easeProgress * (randomExtraTurns + ((targetAngle - currentNormalizedRotation + 360) % 360));

    if (animatedAngle - currentTickAngle >= degreesPerSegment) {
      playNativeTick();
      currentTickAngle = animatedAngle;
    }

    if (progress < 1) requestAnimationFrame(trackTicks);
  }
  requestAnimationFrame(trackTicks);

  setTimeout(() => {
    playNativeWin();

    // --- ENREGISTREMENT EN LOCALSTORAGE ---
    localStorage.setItem(storageKey, JSON.stringify({
      timestamp: Date.now(),
      name: name,
      prize: winner.text
    }));

    const code = "POULETOS-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // --- ENVOI DU MAIL DE CONFIRMATION ---
    sendConfirmationEmail(name, email, winner.text, code);

    const resultBox = document.getElementById("result");
    resultBox.style.display = "block";

    resultBox.innerHTML = `
      🎉 Bravo ${name} !<br><br>
      Tu as gagné : <strong>${winner.text}</strong><br><br>
      Code unique : <strong>${code}</strong><br><br>
      📩 Ton lot vient de t'être envoyé à l'adresse <em>${email}</em>.<br><br>
      ⚠️ <strong>Rappel :</strong> Le lot ne peut PAS être récupéré aujourd'hui.<br>
      Il est valable à partir de demain pendant 1 mois,<br>
      avec condition d'achat.
    `;

    spinning = false;
    // Le bouton reste désactivé volontairement

  }, totalRotationDuration);
}