import { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useMeshyTasks } from '../../hooks/useMeshyTasks'
import MeshyTaskList from './MeshyTaskList'
import MeshyCreateTaskForm from './MeshyCreateTaskForm'

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meshy-tabpanel-${index}`}
      aria-labelledby={`meshy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

export default function MeshyPanel() {
  const [tab, setTab] = useState(0)
  const { loading, error, succeededTasks, inProgressTasks } = useMeshyTasks()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        aria-label="Meshy Tabs"
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Crear" id="meshy-tab-0" aria-controls="meshy-tabpanel-0" />
        <Tab
          label={`Modelos (${succeededTasks.length})`}
          id="meshy-tab-1"
          aria-controls="meshy-tabpanel-1"
        />
        <Tab
          label={`En Cola (${inProgressTasks.length})`}
          id="meshy-tab-2"
          aria-controls="meshy-tabpanel-2"
        />
      </Tabs>
      <Divider />
      <TabPanel value={tab} index={0}>
        <MeshyCreateTaskForm />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <MeshyTaskList tasks={succeededTasks} showStatus={false} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <MeshyTaskList tasks={inProgressTasks} showStatus={true} />
      </TabPanel>
    </Box>
  )
}
