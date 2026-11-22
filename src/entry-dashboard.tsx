import { createRoot } from 'react-dom/client'
import './styles.css'
import { DashboardPage } from './views/DashboardPage'
import { ToastHost } from './components/Toast'

createRoot(document.getElementById('root')!).render(
  <>
    <DashboardPage />
    <ToastHost />
  </>,
)
