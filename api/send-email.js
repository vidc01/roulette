// api/send-email.js
// Fonction sécurisée hébergée sur Vercel — la clé API Brevo n'est JAMAIS visible côté client

export default async function handler(req, res) {
  // On n'accepte que les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { emailClient, nomClient, lot, code } = req.body;

  // Vérification basique des données reçues
  if (!emailClient || !nomClient || !lot || !code) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, // Clé cachée en sécurité dans les variables Vercel
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Pouletos",
          email: "roulette.pouletos@gmail.com"
        },
        to: [
          {
            email: emailClient,
            name: nomClient
          }
        ],
        templateId: 1, 
        params: {
          prenom: nomClient,
          lot: lot,
          code: code
        }
      })
    });

    if (response.ok) {
      return res.status(200).json({ message: "Mail envoyé avec succès !" });
    } else {
      const errData = await response.json();
      console.error("Erreur Brevo :", errData);
      return res.status(500).json({ error: "Erreur lors de l'envoi Brevo" });
    }

  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ error: "Erreur serveur interne" });
  }
}