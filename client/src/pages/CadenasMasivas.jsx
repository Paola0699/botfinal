import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const data = [
  {
    nombre: "Enviar mensaje copy",
    comenzar: "5 Sep 2025, 14:50 (UTC -06:00)",
    enviado: 756,
    entregado: "535 (70.77%)",
    leer: "362 (67.66%)",
    clic: "0 (0.00%)",
  },
  {
    nombre: "Enviar mensaje",
    comenzar: "5 Sep 2025, 14:47 (UTC -06:00)",
    enviado: 1,
    entregado: "1 (100.00%)",
    leer: "0 (0.00%)",
    clic: "0 (0.00%)",
  },
  {
    nombre: "Enviar mensaje",
    comenzar: "5 Sep 2025, 14:38 (UTC -06:00)",
    enviado: 41,
    entregado: "39 (95.12%)",
    leer: "35 (89.74%)",
    clic: "n/a",
  },
  {
    nombre: "Enviar mensaje",
    comenzar: "4 Sep 2025, 18:06 (UTC -06:00)",
    enviado: 693,
    entregado: "512 (73.88%)",
    leer: "394 (76.95%)",
    clic: "n/a",
  },
  {
    nombre: "Ronda dos feria mexic...",
    comenzar: "4 Sep 2025, 18:00 (UTC -06:00)",
    enviado: 1219,
    entregado: "933 (76.54%)",
    leer: "688 (73.74%)",
    clic: "0 (0.00%)",
  },
];

const Broadcasts = () => {
  return (
    <Box display="flex" height="100vh">
      {/* Contenido principal */}
      <Box flex={1} p={4} bgcolor="#f9fafb">
        {/* Encabezado */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight="bold">
            Broadcasts
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              sx={{
                borderRadius: 2,
                background: "linear-gradient(45deg, #6A11CB, #2575FC)",
                textTransform: "capitalize",
              }}
            >
              Nuevo Broadcast
            </Button>
          </Box>
        </Box>

        {/* Historial */}
        <Typography variant="subtitle1" fontWeight="medium" mb={2}>
          Historial
        </Typography>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 2 }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell>Escribir</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Comenzar</TableCell>
                <TableCell>Enviado</TableCell>
                <TableCell>Entregado (%)</TableCell>
                <TableCell>Leer (%)</TableCell>
                <TableCell>Se le hizo clic (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <WhatsAppIcon sx={{ color: "#25D366" }} />
                  </TableCell>
                  <TableCell>{row.nombre}</TableCell>
                  <TableCell>{row.comenzar}</TableCell>
                  <TableCell>{row.enviado}</TableCell>
                  <TableCell>{row.entregado}</TableCell>
                  <TableCell>{row.leer}</TableCell>
                  <TableCell>{row.clic}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box textAlign="center" mt={2}>
          <Button variant="outlined">Ver Todo 27 Mensajes</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Broadcasts;
