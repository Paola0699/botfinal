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
// IMPORTANTE: Define el ID de tu cuenta de WhatsApp Business aquí o como variable de entorno.
// Por ejemplo, en tu archivo .env: WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "1059010216443313"; // <--- ¡REEMPLAZA ESTO!
const API_VERSION = 'v22.0';
const FACEBOOK_GRAPH_API_BASE_URL = `https://graph.facebook.com/${API_VERSION}`;


// Endpoint para obtener plantillas existentes de Facebook
app.get("/api/get-templates", async (req, res) => {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || WHATSAPP_BUSINESS_ACCOUNT_ID === "YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID_HERE") {
    return res.status(500).json({ error: "WHATSAPP_BUSINESS_ACCOUNT_ID no configurado en el backend." });
  }
  if (!FB_BEARER_TOKEN) {
    return res.status(500).json({ error: "FB_BEARER_TOKEN no configurado en el backend." });
  }

  try {
    const fbRes = await fetch(
      `${FACEBOOK_GRAPH_API_BASE_URL}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
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
      return res.status(fbRes.status).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Network error fetching templates:", err);
    return res.status(500).json({ error: "Network error" });
  }
});

// NUEVO ENDPOINT: Crear plantilla de mensaje en Facebook
app.post("/api/create-template", async (req, res) => {
  const templatePayload = req.body; // El payload JSON construido por el frontend

  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || WHATSAPP_BUSINESS_ACCOUNT_ID === "YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID_HERE") {
    return res.status(500).json({ error: "WHATSAPP_BUSINESS_ACCOUNT_ID no configurado en el backend." });
  }
  if (!FB_BEARER_TOKEN) {
    return res.status(500).json({ error: "FB_BEARER_TOKEN no configurado en el backend." });
  }
  if (!templatePayload) {
    return res.status(400).json({ error: "Payload de plantilla no proporcionado." });
  }

  console.log("Received template payload from frontend:", JSON.stringify(templatePayload, null, 2));

  try {
    const fbRes = await fetch(
      `${FACEBOOK_GRAPH_API_BASE_URL}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FB_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      }
    );

    const data = await fbRes.json();

    if (!fbRes.ok) {
      console.error("Error creating template on Facebook:", data);
      return res.status(fbRes.status).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Network error creating template:", err);
    return res.status(500).json({ error: "Network error" });
  }
});


// Endpoint existente: Enviar mensaje de WhatsApp
app.post("/api/send-message", async (req, res) => {
  const { recipientId, message, imageUrl } = req.body;

  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || WHATSAPP_BUSINESS_ACCOUNT_ID === "YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID_HERE") {
    return res.status(500).json({ error: "WHATSAPP_BUSINESS_ACCOUNT_ID no configurado en el backend." });
  }
  if (!FB_BEARER_TOKEN) {
    return res.status(500).json({ error: "FB_BEARER_TOKEN no configurado en el backend." });
  }
  if (!recipientId || (!message && !imageUrl)) {
    return res.status(400).json({ error: "recipientId y message o imageUrl son requeridos." });
  }

  try {
    let payload;

    if (imageUrl) {
      payload = {
        messaging_product: "whatsapp",
        to: recipientId,
        type: "image",
        image: {
          link: imageUrl, // ⚠️ debe ser pública y accesible
        },
      };
    } else {
      payload = {
        messaging_product: "whatsapp",
        to: recipientId,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      };
    }
    const fbRes = await fetch(
      `${FACEBOOK_GRAPH_API_BASE_URL}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FB_BEARER_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await fbRes.json();
    console.log(data);

    if (!fbRes.ok) {
      console.error("Error sending message to WhatsApp:", data);
      return res.status(fbRes.status).json({ error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Network error sending message to WhatsApp:", err);
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