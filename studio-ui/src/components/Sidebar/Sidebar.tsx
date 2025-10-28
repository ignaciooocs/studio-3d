import { useState } from 'react'
import { Box, Tabs, Tab, Divider, Typography, Paper, Stack } from '@mui/material'
import ObjectList from '../ObjectList'
import ObjectProperties from './ObjectProperties'
import InsertMenu from './InsertMenu'
import AlertsPanel from './AlertsPanel'
import PrinterSelector from './PrinterSelector'

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sidebar-tabpanel-${index}`}
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

// Panel lateral con herramientas y tabs (Propiedades, Insertar, Alertas)
export default function Sidebar() {
  const [tab, setTab] = useState(0)

  return (
    <Paper variant="outlined" square sx={{ width: 360, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <PrinterSelector />
          <div>
            <Typography variant="subtitle1" gutterBottom>Objetos</Typography>
            <ObjectList />
          </div>
        </Stack>
      </Box>
      <Divider />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Sidebar Tabs" variant="fullWidth">
        <Tab label="Propiedades" id="sidebar-tab-0" aria-controls="sidebar-tabpanel-0" />
        <Tab label="Insertar" id="sidebar-tab-1" aria-controls="sidebar-tabpanel-1" />
        <Tab label="Alertas" id="sidebar-tab-2" aria-controls="sidebar-tabpanel-2" />
      </Tabs>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <TabPanel value={tab} index={0}>
          <ObjectProperties />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <InsertMenu />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <AlertsPanel />
        </TabPanel>
      </Box>
    </Paper>
  )
}
