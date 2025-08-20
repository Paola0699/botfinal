import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
const NuevaPlantilla = () => {
  const [templateName, setTemplateName] = useState("prueba");
  const [category, setCategory] = useState("Marketing");
  const [message, setMessage] = useState(
    "hola esta es una prueba de la plantilla"
  );
  const [footer, setFooter] = useState(
    'Escribe "baja" si ya no quieres recibir estos mensajes'
  );
  const [buttonText, setButtonText] = useState("Google");
  const [buttonUrl, setButtonUrl] = useState("google.com");
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box display="flex" gap={4} p={4}>
      {/* Formulario */}
      <Box flex={1}>
        <Typography variant="h6" mb={2}>
          Crear plantilla
        </Typography>

        <TextField
          label="Nombre de plantilla"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Categoría de plantillas</InputLabel>
          <Select
            value={category}
            label="Categoría de plantillas"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Transaccional">Transaccional</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="subtitle1" mt={2}>
          Encabezado
        </Typography>
        <Button variant="outlined" component="label">
          Subir imagen
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>

        <TextField
          label="Mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        <TextField
          label="Pie de página"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Typography variant="subtitle1" mt={2}>
          Botón URL
        </Typography>
        <TextField
          label="Texto del botón"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="URL del botón"
          value={buttonUrl}
          onChange={(e) => setButtonUrl(e.target.value)}
          fullWidth
          margin="dense"
        />

        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Enviar a revisión
        </Button>
      </Box>

      {/* Vista previa de WhatsApp */}
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
              Preview Plantilla
            </Typography>
          </Box>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: "100%", height: "auto" }}
            />
          )}
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
                <Typography variant="body2">{message}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {footer}
              </Typography>
            </Box>
            <Box mt={2}>
              <Button
                variant="outlined"
                fullWidth
                href={`https://${buttonUrl}`}
                target="_blank"
              >
                {buttonText}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NuevaPlantilla;
