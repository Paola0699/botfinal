import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

const CadenasMasivas = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("Promo Julio");
  const [selectedRecipient, setSelectedRecipient] = useState("Cliente A");

  return (
    <>
      <Toolbar />
      <Box display="flex" gap={4} p={4}>
        {/* Vista previa del mensaje (no editable) */}
        <Box flexShrink={0} width={300} height={600}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              overflow: "hidden",
              backgroundColor: "#ece5dd",
              height: "100%",
            }}
          >
            <Box
              sx={{
                height: 50,
                bgcolor: "#25D366",
                display: "flex",
                alignItems: "center",
                px: 2,
              }}
            >
              <Typography color="white" fontWeight="bold">
                Elementos Life
              </Typography>
            </Box>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "55vh",
              }}
            >
              <Box>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 2,
                    padding: 1.5,
                    mb: 1,
                    boxShadow: 1,
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body2">
                    ¡Hola! Esta es una promoción especial válida solo por hoy.
                    Aprovecha el 20% de descuento en todos nuestros productos.
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Escribe "baja" si ya no quieres recibir estos mensajes
                </Typography>
              </Box>
              <Box mt={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="https://mipromocion.com"
                  target="_blank"
                >
                  Ver promoción
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Controles de envío */}
        <Box flex={1}>
          <Typography variant="h6" mb={2}>
            Enviar plantilla
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Selecciona una plantilla</InputLabel>
            <Select
              value={selectedTemplate}
              label="Selecciona una plantilla"
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <MenuItem value="Promo Julio">Promo Julio</MenuItem>
              <MenuItem value="Recordatorio Cita">Recordatorio Cita</MenuItem>
              <MenuItem value="Nueva Colección">Nueva Colección</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Selecciona destinatario</InputLabel>
            <Select
              value={selectedRecipient}
              label="Selecciona destinatario"
              onChange={(e) => setSelectedRecipient(e.target.value)}
            >
              <MenuItem value="Cliente A">Cliente A</MenuItem>
              <MenuItem value="Cliente B">Cliente B</MenuItem>
              <MenuItem value="Cliente C">Cliente C</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Enviar Cadena
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CadenasMasivas;
