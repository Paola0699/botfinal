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

// Tu endpoint de API
app.post("/api/send-message", async (req, res) => {
  const { recipientId, message } = req.body;

  if (!recipientId || !message) {
    return res
      .status(400)
      .json({ error: "recipientId y message son requeridos." });
  }

  try {
    // Aquí iría tu lógica real para enviar mensajes, por ejemplo, a la API de Facebook
    // Por ahora, simularemos una respuesta
    console.log(`Received message for ${recipientId}: "${message}"`);
    // const fbResponse = await fetch(
    //   `https://graph.facebook.com/v22.0/me/messages?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       recipient: { id: recipientId },
    //       messaging_type: "RESPONSE",
    //       message: { text: message },
    //     }),
    //   }
    // );
    // const data = await fbResponse.json();
    // if (!fbResponse.ok) {
    //   return res.status(fbResponse.status).json({ error: data });
    // }

    return res.status(200).json({
      success: true,
      data: {
        messageId: "mock_message_id_123",
        status: "sent",
        received: { recipientId, message },
      },
    });
  } catch (error) {
    console.error("Error en proxy:", error);
    res.status(500).json({ error: "Error interno en el servidor" });
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