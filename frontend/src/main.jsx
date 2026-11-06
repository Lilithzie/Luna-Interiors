import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store'
import axios from 'axios'
import { ThemeProvider, createTheme } from '@mui/material/styles'
axios.defaults.withCredentials = true   // send the login cookie

// MUI wood theme
const muiTheme = createTheme({
  palette: { primary: { main: '#8B5A2B', dark: '#6B4423' } },
  typography: { fontFamily: "'Poppins', 'Segoe UI', sans-serif" },
})

createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <ThemeProvider theme={muiTheme}>
      <App />
    </ThemeProvider>
  </Provider>

)
