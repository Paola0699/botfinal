// my-fullstack-project/server/server.js
import express from "express";
import fetch from "node-fetch"; // Para node-fetch@2.x.x
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config(); // Carga variables de entorno desde .env

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // Permite solicitudes desde tu frontend (en desarrollo)
app.use(express.json()); // Parsear JSON en body de las peticiones

const FB_BEARER_TOKEN = process.env.VITE_FB_BEARER_TOKEN || ""; 
app.get("/api/get-templates", async (req, res) => {
  try {
    const fbRes = await fetch(
      "https://graph.facebook.com/v23.0/1059010216443313/message_templates",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${FB_BEARER_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await fbRes.json();

    if (!fbRes.ok) {
      console.error("Error fetching templates from Facebook:", data);
      return res.status(500).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Network error fetching templates:", err);
    return res.status(500).json({ error: "Network error" });
  }
});


// Tu endpoint de API
app.post("/api/send-message", async (req, res) => {
  const { recipientId, message } = req.body;

  if (!recipientId || !message) {
    return res
      .status(400)
      .json({ error: "recipientId y message son requeridos." });
  }

  try {
    const fbRes = await fetch(
      "https://graph.facebook.com/v22.0/me/messages?access_token=EAAKHaPNHhhwBO22Lu72iyakHKww9mpYXJh3ZAqqWQZCXl5I3dyPijBetTkcqXBWogeP0RcgFdAAdtRjeX2DkMHHdZCpb0nA4aHt4IVnzQJQaV0QNztj9UPWYQGuFJhR5gGAKZAiIVkwcpKp2qdH0ZAolkF1qXAne1Hd9wNFSk8oaogYdgs8dFWcdSuO0grqjGaPDHrqaoLQZDZD",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId, // 👈 usamos el que vino del frontend
          },
          messaging_type: "RESPONSE",
          message: {
            text: message,
          },
        }),
      }
    );

    const data = await fbRes.json();

    if (!fbRes.ok) {
      console.error("Error sending message to Facebook:", data);
      return res.status(500).json({ error: data });
    }

    // si todo salió bien
    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("Network error sending message to Facebook:", err);
    return res.status(500).json({ error: "Network error" });
  }
});


// 🌐 SERVIR FRONTEND EN PRODUCCIÓN
// __dirname y __filename para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  // La carpeta 'dist' se crea en la raíz del proyecto, no dentro de 'server'
  const clientBuildPath = path.resolve(__dirname, '../dist/client');
  
  app.use(express.static(clientBuildPath));

  // Catch-all para servir el index.html de tu aplicación React
  // Esto es crucial para el routing del lado del cliente (React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});