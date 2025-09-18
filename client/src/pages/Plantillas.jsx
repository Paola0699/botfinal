import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  TableContainer, // Nuevo
  Table, // Nuevo
  TableHead, // Nuevo
  TableBody, // Nuevo
  TableRow, // Nuevo
  TableCell, // Nuevo
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define las categorías disponibles, incluyendo "TODOS"
const categories = ["TODOS", "MARKETING", "MARKETING LITE", "UTILITY"];
// Define los estados disponibles, incluyendo "TODOS"
const statuses = ["TODOS", "APPROVED", "REJECTED", "PENDING"];

// 🔹 Helper para mapear el status de Meta a colores
const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    case "PENDING":
      return "warning";
    default:
      return "default";
  }
};

// 🔹 Helper para mapear la categoría a colores que combinen
const getCategoryColor = (category) => {
  switch (category) {
    case "MARKETING":
      return {
        bgcolor: "#D9EDF7", // Un azul claro suave
        color: "#0C5460", // Un azul oscuro para el texto
      };
    case "MARKETING LITE":
      return {
        bgcolor: "#F8D7DA", // Un rosa claro suave
        color: "#721C24", // Un rojo oscuro para el texto
      };
    case "UTILITY":
      return {
        bgcolor: "#FFF3CD", // Un amarillo claro suave
        color: "#856404", // Un marrón/amarillo oscuro para el texto
      };
    default:
      return {
        bgcolor: "#E0E0E0", // Gris claro por defecto
        color: "#424242", // Gris oscuro para el texto por defecto
      };
  }
};

// 🔹 Helper para transformar la respuesta de Meta a tu formato
const transformarTemplates = (templates) => {
  return templates.map((tpl) => ({
    nombre: tpl.name,
    // Nota: La API de Meta no devuelve la fecha de creación en el formato que esperas.
    // Para propósitos de demostración, se usa la fecha actual.
    // Si la API proporciona una fecha, deberías usarla aquí.
    fechaCreacion: new Date(),
    status: tpl.status,
    language: tpl.language,
    categoria: tpl.category,
    id: tpl.id,
    header: tpl.components.find((c) => c.type === "HEADER")?.text || "",
    body: tpl.components.find((c) => c.type === "BODY")?.text || "",
  }));
};

const Plantillas = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]);
  const [allPlantillas, setAllPlantillas] = useState([]);
  const [filteredPlantillas, setFilteredPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessageTemplates = async () => {
    try {
      const res = await fetch("/api/get-templates", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Error al obtener templates");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error en fetchMessageTemplates:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      const data = await fetchMessageTemplates();
      if (data?.data) {
        const transformadas = transformarTemplates(data.data);
        setAllPlantillas(transformadas);
      }
      setLoading(false);
    };

    loadTemplates();
  }, []);

  useEffect(() => {
    let currentFiltered = allPlantillas;

    if (selectedCategory !== "TODOS") {
      currentFiltered = currentFiltered.filter(
        (plantilla) => plantilla.categoria === selectedCategory
      );
    }

    if (selectedStatus !== "TODOS") {
      currentFiltered = currentFiltered.filter(
        (plantilla) => plantilla.status === selectedStatus
      );
    }

    setFilteredPlantillas(currentFiltered);
  }, [selectedCategory, selectedStatus, allPlantillas]);

  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  return (
    <>
      <Box p={5}>
        <Paper
          sx={{
            height: "100%",
            overflowY: "auto",
            boxShadow: "none",
            padding: 4,
            background: "transparent",
          }}
        >
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Lista de Plantillas
          </Typography>
          <Typography color="text.secondary" mb={2}>
            Para enviar cadenas masivas debes crear una plantilla, y esta deberá
            ser aprobada por META. Cada tipo de plantilla tiene un costo
            diferente. Aquí puedes ver el precio exacto en META.
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Filtrar por Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Filtrar por Estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Link to={"/plantilla-nueva"}>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  background: "linear-gradient(45deg, #6A11CB, #2575FC)",
                  textTransform: "capitalize",
                }}
              >
                + Nueva plantilla
              </Button>
            </Link>
          </Box>
          <Divider />
        </Paper>

        {filteredPlantillas.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="lista de plantillas">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Cuerpo del Mensaje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlantillas.map((plantilla) => (
                  <TableRow
                    key={plantilla.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {plantilla.nombre}
                    </TableCell>
                    <TableCell>{plantilla.id}</TableCell>
                    <TableCell>
                      {dayjs(plantilla.fechaCreacion).format(
                        "DD/MM/YYYY hh:mm A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plantilla.categoria}
                        size="small"
                        sx={{
                          ...getCategoryColor(plantilla.categoria),
                          fontWeight: "bold",
                          borderRadius: "4px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plantilla.status}
                        color={getStatusColor(plantilla.status)}
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {plantilla.body || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            mt={4}
          >
            No se encontraron plantillas para la categoría y/o estado
            seleccionados.
          </Typography>
        )}
      </Box>
    </>
  );
};

export default Plantillas;
