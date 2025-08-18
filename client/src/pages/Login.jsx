import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import welcomeImage from "./welcome_image.png";
import LogoBlack from "./logo_negro.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/cadenas");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Grid container sx={{ height: "100vh", width: "100%" }}>
      {/* Logo en la esquina */}
      <Box
        component="img"
        src={LogoBlack} // Cambia esto por la ruta real de tu logo
        alt="Logo"
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 120,
          height: 100,
        }}
      />
      {/* Sección Izquierda */}
      <Grid
        item
        xs={12}
        md={6}
        size={6}
        sx={{
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 7,
            width: "100%",
            maxWidth: 400,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Inicia sesión con el correo y contraseña proporcionados por el
            equipo de Mejora.
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Mínimo 8 caracteres"
            />

            <Typography
              variant="body2"
              sx={{
                textAlign: "right",
                color: "primary.main",
                cursor: "pointer",
                mt: 1,
              }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                background: "linear-gradient(45deg, #6A11CB, #2575FC)",
                fontWeight: "bold",
                textTransform: "none",
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Iniciar sesión
            </Button>

            {/*     <Divider sx={{ my: 3 }}>OR</Divider>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                textTransform: "none",
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
              }}
            >
              <GoogleIcon style={{ marginRight: "1rem" }} />
              Iniciar sesión con Google
            </Button> */}
          </Box>
          {/* 
          <Typography variant="body2" align="center" mt={3}>
            Don’t have an account?{" "}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Register
            </Box>
          </Typography> */}
        </Paper>
      </Grid>

      {/* Sección Derecha */}
      <Grid
        item
        size={6}
        xs={12}
        md={6}
        sx={{
          background: "linear-gradient(135deg, #6A11CB, #2575FC)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          p: 4,
        }}
      >
        <Typography variant="h6" mb={1}>
          Encantado de verte de nuevo
        </Typography>
        <Typography variant="h3" fontWeight="bold" mb={3}>
          Bienvenido de nuevo
        </Typography>
        <img
          src={welcomeImage}
          alt="Welcome Illustration"
          style={{ width: "100%", maxWidth: "600px" }}
        />
      </Grid>
    </Grid>
  );
};

export default Login;
