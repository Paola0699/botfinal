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
} from "@mui/material";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const LeadsColumn = ({ title, leads, color }) => {
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
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        height: "100%",
        minHeight: "80vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box style={{ width: "22rem" }}>
        <Typography
          variant="h6"
          p={2}
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: color,
          }}
        >
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {paginatedLeads.length > 0 ? (
          paginatedLeads.map((lead, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                m: 2,
                borderRadius: 2,
                transition: "transform 0.2s",
                ":hover": { transform: "scale(1.02)" },
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {lead.nombre}
                </Typography>
                {lead?.telefono && (
                  <Link>
                    <Typography variant="body2">📞 {lead.telefono}</Typography>
                  </Link>
                )}
                <Typography variant="caption" sx={{ color: "#888" }}>
                  Último mensaje:{" "}
                  {dayjs(lead.ultimoMensaje).format("DD/MM/YYYY hh:mm A")}
                </Typography>
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
        <Box display="flex" justifyContent="center" py={2}>
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
