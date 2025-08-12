import { Box, Typography } from "@mui/material";

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        bgcolor: "#3c3c3a",
        p: 3,
        width: "100vw",
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: "bold", fontSize: "6rem" }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Oops... Página no encontrada
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 400 }}>
        La página que buscas no existe o fue movida. Puedes volver al inicio y
        continuar navegando.
      </Typography>
    </Box>
  );
};

export default NotFound;
