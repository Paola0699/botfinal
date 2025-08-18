import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Pagination,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FlagIcon from "@mui/icons-material/Flag";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const LeadsColumn = ({ title, leads }) => {
  const [page, setPage] = useState(1);

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  const paginatedLeads = leads.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%", // Esta propiedad es clave para que ocupe el 100% de la altura de su padre (el Grid item)
        // minHeight: "80vh", // ¡ELIMINA ESTA LÍNEA! Esto es lo que causaba la disparidad.
        display: "flex",
        flexDirection: "column",
        width: "20vw",
      }}
    >
      {/* Añadimos flexGrow: 1 a este Box para que el contenido principal crezca y empuje la paginación hacia abajo */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          p={3}
          sx={{
            textAlign: "left",
            fontWeight: "bold",
            color: "#333",
            letterSpacing: "0.5px",
            pb: 1,
          }}
        >
          {title}
        </Typography>
        <Divider sx={{ mb: 2, mx: 2 }} />
        {paginatedLeads.length > 0 ? (
          paginatedLeads.map((lead, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                m: 2,
                borderRadius: 3,
                backgroundColor: "#fff",
                transition: "all 0.2s ease",
                border: "1px solid #e0e0e0",
                ":hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  "&:last-child": { pb: 2 },
                }}
              >
                <Avatar
                  sx={{ bgcolor: "#e0e0e0", mr: 2, width: 40, height: 40 }}
                >
                  <PersonIcon sx={{ color: "#757575" }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {lead.nombre}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    {lead?.tag && (
                      <Typography variant="body2" sx={{ color: "#757575" }}>
                        {lead.tag}
                      </Typography>
                    )}
                    <FlagIcon sx={{ fontSize: 16, color: lead.flagColor }} />
                  </Box>
                  {lead?.telefono && (
                    <Link href={`tel:${lead.telefono}`} underline="none">
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        📞 {lead.telefono}
                      </Typography>
                    </Link>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ color: "#999", mt: 0.5, display: "block" }}
                  >
                    Último mensaje:{" "}
                    {dayjs(lead.ultimoMensaje).format("DD/MM/YYYY hh:mm A")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 4, color: "#999" }}
          >
            Sin registros
          </Typography>
        )}
      </Box>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" py={2} mt="auto">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Paper>
  );
};

export default LeadsColumn;
