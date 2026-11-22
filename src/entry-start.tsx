import { createRoot } from 'react-dom/client'
import './styles.css'
import { StartPage } from './views/StartPage'
import { ToastHost } from './components/Toast'

createRoot(document.getElementById('root')!).render(
  <>
    <StartPage />
    <ToastHost />
  </>,
)
