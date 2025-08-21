import {
  Box,
  Button,
  Card,
  CardContent,
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
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define las categorías disponibles, incluyendo "TODOS"
const categories = ["TODOS", "MARKETING", "MARKETING LITE", "UTILITY"];

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
      return "primary"; // Un color azul/púrpura
    case "MARKETING LITE":
      return "secondary"; // Un color púrpura/rosa
    case "UTILITY":
      return "warning"; // Un color azul claro
    default:
      return "default"; // Color por defecto si la categoría no coincide
  }
};

// 🔹 Helper para transformar la respuesta de Meta a tu formato
const transformarTemplates = (templates) => {
  return templates.map((tpl) => ({
    nombre: tpl.name,
    fechaCreacion: new Date(), // Meta no devuelve fecha, se usa ahora
    status: tpl.status,
    language: tpl.language,
    categoria: tpl.category, // Esta es la propiedad por la que filtraremos
    id: tpl.id,
    header: tpl.components.find((c) => c.type === "HEADER")?.text || "",
    body: tpl.components.find((c) => c.type === "BODY")?.text || "",
  }));
};

const Plantillas = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Estado para la categoría seleccionada, inicializado en "TODOS"
  const [allPlantillas, setAllPlantillas] = useState([]); // Almacena todas las plantillas obtenidas
  const [filteredPlantillas, setFilteredPlantillas] = useState([]); // Almacena las plantillas después de aplicar el filtro
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
      return data; // 👈 Aquí vienen los templates desde Facebook
    } catch (error) {
      console.error("Error en fetchMessageTemplates:", error);
      return null;
    }
  };

  // Efecto para cargar las plantillas inicialmente
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true); // Establece loading a true antes de la llamada a la API
      const data = await fetchMessageTemplates();
      if (data?.data) {
        const transformadas = transformarTemplates(data.data);
        setAllPlantillas(transformadas);
        setFilteredPlantillas(transformadas); // Inicialmente, muestra todas las plantillas
      }
      setLoading(false);
    };

    loadTemplates();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Efecto para filtrar las plantillas cada vez que cambia la categoría seleccionada o la lista de todas las plantillas
  useEffect(() => {
    if (selectedCategory === "TODOS") {
      setFilteredPlantillas(allPlantillas);
    } else {
      const filtered = allPlantillas.filter(
        (plantilla) => plantilla.categoria === selectedCategory
      );
      setFilteredPlantillas(filtered);
    }
  }, [selectedCategory, allPlantillas]); // Dependencias para que el efecto se re-ejecute

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
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Categoría</InputLabel>{" "}
              {/* Etiqueta actualizada */}
              <Select
                value={selectedCategory}
                label="Filtrar por Categoría" // Etiqueta actualizada
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

        <Stack spacing={2} mt={1}>
          {filteredPlantillas.length > 0 ? (
            filteredPlantillas.map((plantilla, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 6px 16px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    📄 {plantilla.nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    ID: {plantilla.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de creación:{" "}
                    {dayjs(plantilla.fechaCreacion).format(
                      "DD/MM/YYYY hh:mm A"
                    )}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    Categoría:{" "}
                    <Chip
                      label={plantilla.categoria}
                      color={getCategoryColor(plantilla.categoria)} // Aquí se aplica el color dinámico
                    />{" "}
                    {/* Muestra la categoría de la plantilla */}
                  </Typography>
                  {plantilla.body && (
                    <Typography variant="body2" mt={1}>
                      {plantilla.body}
                    </Typography>
                  )}
                  <Box mt={1}>
                    <Chip
                      label={plantilla.status}
                      color={getStatusColor(plantilla.status)}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              mt={4}
            >
              No se encontraron plantillas para la categoría seleccionada.
            </Typography>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default Plantillas;
