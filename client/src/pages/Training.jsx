import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";

const procesos = [
  "Responder dudas iniciales",
  "Conectar necesidades con...",
  "Agendar una cita",
];

const Training = () => {
  const [proceso, setProceso] = useState(procesos[0]);
  const [text, setText] = useState("");
  const [systemMessage, setSystemMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [chat, setChat] = useState([]);

  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!userMessage.trim()) return;
    const message = userMessage.trim();
    setChat((prev) => [
      ...prev,
      { sender: "Usuario", message },
      {
        sender: "IA",
        message: `¡Hola! Gracias por tu interés. Con gusto te apoyo con "${message}". ¿Hay algo más que te gustaría saber? 😉`,
      },
    ]);
    setUserMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function sendDataToWebhook() {
    const url =
      "https://mejoramkt.app.n8n.cloud/webhook-test/ddffee6b-e2f8-4924-88d6-a71a70ad1e31";

    const payload = {
      promp: systemMessage,
      type: "system",
      userName: "paola",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json(); // o .text() si el response no es JSON
      console.log("Respuesta del webhook:", data);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  }
  return (
    <>
      <Toolbar />
      <Box p={5} width={"80vw"}>
        <Paper
          sx={{
            height: "100%",
            overflowY: "auto",
            boxShadow: "none",
            padding: 5,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Configuración y entrenamiento del bot 🤖{" "}
          </Typography>
          <Divider />
          <FormControl fullWidth margin="normal">
            <InputLabel>Selecciona un proceso</InputLabel>
            <Select
              value={proceso}
              label="Selecciona un proceso"
              onChange={(e) => setProceso(e.target.value)}
            >
              {procesos.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Grid container spacing={0} mt={2} p={3}>
          {/* Columna izquierda - Configuración */}
          <Grid item sx={{ width: 400, borderRight: "1px solid #ccc", pr: 3 }}>
            <Typography variant="h6" gutterBottom>
              🛠 Configuración del Prompt
            </Typography>
            <TextField
              label="Texto de entrada"
              multiline
              rows={5}
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Mensaje del sistema"
              multiline
              rows={5}
              fullWidth
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              margin="normal"
            />
            <Button fullWidth variant="contained" onClick={sendDataToWebhook}>
              Guardar
            </Button>
          </Grid>

          {/* Columna derecha - Chat estilo Messenger */}
          <Grid item sx={{ flexGrow: 1, pl: 3 }}>
            <Typography variant="h6" gutterBottom>
              💬 Simulación de conversación con cliente
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                height: 400,
                overflowY: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              {chat.map((entry, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    entry.sender === "Usuario" ? "flex-end" : "flex-start"
                  }
                >
                  <Stack
                    direction={
                      entry.sender === "Usuario" ? "row-reverse" : "row"
                    }
                    spacing={1}
                    alignItems="flex-end"
                    sx={{ maxWidth: "80%" }}
                  >
                    {entry.sender === "IA" && <Avatar>🤖</Avatar>}
                    <Box
                      sx={{
                        backgroundColor:
                          entry.sender === "Usuario" ? "#2563eb" : "#e0e0e0",
                        color: entry.sender === "Usuario" ? "white" : "black",
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <Typography variant="body2">{entry.message}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </Paper>

            <Box mt={2} display="flex" gap={1}>
              <TextField
                label="Escribe tu pregunta"
                variant="outlined"
                fullWidth
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSend}
                sx={{ backgroundColor: "#ff3200" }}
              >
                Enviar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Training;
