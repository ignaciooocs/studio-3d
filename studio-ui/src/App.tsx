import { Box } from '@mui/material'
import { EditorProvider } from './context/EditorContext'
import { ThemeProvider } from './context/ThemeProvider'
import TopBar from './components/TopBar'
import EditorCanvas from './components/EditorCanvas/EditorCanvas'
import Sidebar from './components/Sidebar/Sidebar'

function App() {
  return (
    <ThemeProvider>
      <EditorProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopBar /> 
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <EditorCanvas />
            <Sidebar />
          </Box>
        </Box>
      </EditorProvider>
    </ThemeProvider>
  )
}

export default App
