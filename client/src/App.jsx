// my-fullstack-project/client/src/App.tsx
import { Outlet } from "react-router-dom";
import "./App.css"; // Asegúrate de que este archivo CSS exista o bórralo si no lo usas
import { Box, CssBaseline, Toolbar } from "@mui/material";
import NavBar from "./common/NavBar";
const drawerWidth = 240;

function App() {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <NavBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet /> {/* Aquí se renderizarán las rutas hijas */}
      </Box>
    </Box>
  );
}
export default App;
