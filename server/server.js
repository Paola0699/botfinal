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

app.use(cors()); 
app.use(express.json()); 

// 🔑 Variables de entorno
const FB_BEARER_TOKEN = process.env.FB_BEARER_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";

const API_VERSION = "v22.0";
const FACEBOOK_GRAPH_API_BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

console.log("📌 PHONE_NUMBER_ID:", WHATSAPP_PHONE_NUMBER_ID);
console.log("📌 BUSINESS_ACCOUNT_ID:", WHATSAPP_BUSINESS_ACCOUNT_ID);

// ---------------- GET templates ----------------
app.get("/api/get-templates", async (req, res) => {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
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
          Authorization: `Bearer ${FB_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await fbRes.json();

    if (!fbRes.ok) {
      console.error("❌ Error fetching templates:", data);
      return res.status(fbRes.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("🌐 Network error fetching templates:", err);
    return res.status(500).json({ error: "Network error" });
  }
});

// ---------------- CREATE template ----------------
app.post("/api/create-template", async (req, res) => {
  const templatePayload = req.body;

  if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
    return res.status(500).json({ error: "WHATSAPP_BUSINESS_ACCOUNT_ID no configurado en el backend." });
  }
  if (!FB_BEARER_TOKEN) {
    return res.status(500).json({ error: "FB_BEARER_TOKEN no configurado en el backend." });
  }
  if (!templatePayload) {
    return res.status(400).json({ error: "Payload de plantilla no proporcionado." });
  }

  console.log("📤 Payload recibido:", JSON.stringify(templatePayload, null, 2));

  try {
    const fbRes = await fetch(
      `${FACEBOOK_GRAPH_API_BASE_URL}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FB_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      }
    );

    const data = await fbRes.json();

    if (!fbRes.ok) {
      console.error("❌ Error creating template:", data);
      return res.status(fbRes.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("🌐 Network error creating template:", err);
    return res.status(500).json({ error: "Network error" });
  }
});

// ---------------- SEND message ----------------
app.post("/api/send-message", async (req, res) => {
  const { recipientId, message, imageUrl } = req.body;

  if (!WHATSAPP_PHONE_NUMBER_ID) {
    return res.status(500).json({ error: "WHATSAPP_PHONE_NUMBER_ID no configurado en el backend." });
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
        image: { link: imageUrl },
      };
    } else {
      payload = {
        messaging_product: "whatsapp",
        to: recipientId,
        type: "text",
        text: { preview_url: false, body: message },
      };
    }

    const fbRes = await fetch(
      `${FACEBOOK_GRAPH_API_BASE_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
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
    console.log("📩 Respuesta Meta:", data);

    if (!fbRes.ok) {
      console.error("❌ Error sending message:", data);
      return res.status(fbRes.status).json({ error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("🌐 Network error sending message:", err);
    return res.status(500).json({ error: "Network error" });
  }
});

// ---------------- SERVE frontend (production) ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.resolve(__dirname, "../dist/client");

  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
