import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

const procesos = ["Marketing", "Marketing Lite", "Utility"];

const plantillas = [
  {
    nombre: "Campaña de bienvenida",
    fechaCreacion: "2025-07-01T10:00:00",
    status: "Cumplida",
  },
  {
    nombre: "Promoción de verano",
    fechaCreacion: "2025-07-05T12:30:00",
    status: "En progreso",
  },
  {
    nombre: "Seguimiento post-venta",
    fechaCreacion: "2025-07-10T09:45:00",
    status: "No iniciada",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Cumplida":
      return "success";
    case "En progreso":
      return "warning";
    case "No iniciada":
      return "default";
    default:
      return "default";
  }
};
const Plantillas = () => {
  const [proceso, setProceso] = useState(procesos[0]);

  return (
    <Box p={5}>
      <Paper
        sx={{
          height: "100%",
          overflowY: "auto",
          boxShadow: "none",
          padding: 5,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Lista de Plantillas
        </Typography>
        <Typography>
          Para enviar cadenas masivas debes crear una plantilla, y esta
          plantilla deberá ser aprobada por META, cada tipo de plantilla tiene
          un costo diferente. Aquí puedes ver el precio exacto de META.{" "}
        </Typography>
        <Button
          variant="contained"
          style={{ marginBottom: "1rem", marginTop: "1rem" }}
        >
          Nueva plantilla
        </Button>
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
      <Stack spacing={2} mt={1}>
        {plantillas.map((plantilla, index) => (
          <Card
            key={index}
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="medium"
                style={{ fontSize: "1rem" }}
              >
                📄 {plantilla.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha de creación:{" "}
                {dayjs(plantilla.fechaCreacion).format("DD/MM/YYYY hh:mm A")}
              </Typography>
              <Box mt={1}>
                <Chip
                  label={plantilla.status}
                  color={getStatusColor(plantilla.status)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Plantillas;
