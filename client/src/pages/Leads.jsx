import { Box, Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import LeadsColumn from "../leads/LeadsColumn";

const API_KEY =
  "patEpPGZwM0wqagdm.20e5bf631e702ded9b04d6c2fed3e41002a8afc9127a57cff9bf8c3b3416dd02";
const BASE_ID = "appbT7f58H1PLdY11";
const TABLE_NAME = "chat-crm";

const Leads = () => {
  const [usersList, setUsersList] = useState([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAirtableRecords = async () => {
      try {
        const response = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Error al obtener leads");

        const data = await response.json();
        setUsersList(data.records);
      } catch (error) {
        console.error("Error al obtener leads:", error);
      }
    };

    fetchAirtableRecords();
  }, []);

  // Clasificar los leads según temperatura
  const leadsClasificados = {
    frio: [],
    tibio: [],
    caliente: [],
  };

  usersList.forEach((record) => {
    const fields = record.fields;
    const temperatura = fields.temperatura || "";
    const nombre = fields.nombre || fields.username || "Sin nombre";
    const telefono = fields.telefono || "";
    const ultimoMensaje = fields["created date"] || record.createdTime || "";

    const leadData = { nombre, telefono, ultimoMensaje };

    if (temperatura.includes("Frío")) {
      leadsClasificados.frio.push(leadData);
    } else if (temperatura.includes("Tibio")) {
      leadsClasificados.tibio.push(leadData);
    } else if (temperatura.includes("Caliente")) {
      leadsClasificados.caliente.push(leadData);
    } else {
      // Si no tiene temperatura o es otra cosa, lo ponemos en frío por defecto
      leadsClasificados.frio.push(leadData);
    }
  });

  return (
    <Box sx={{ p: 3, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title="Lead frío"
            leads={leadsClasificados.frio}
            color="#607D8B"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title="Lead tibio"
            leads={leadsClasificados.tibio}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title="Lead caliente"
            leads={leadsClasificados.caliente}
            color="#F44336"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Leads;
