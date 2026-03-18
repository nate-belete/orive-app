import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Closet from './pages/Closet'
import OccasionCreate from './pages/OccasionCreate'
import PlaybookView from './pages/PlaybookView'
import Feedback from './pages/Feedback'
import History from './pages/History'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/closet" element={<Closet />} />
        <Route path="/occasions/new" element={<OccasionCreate />} />
        <Route path="/playbooks/:occasionId" element={<PlaybookView />} />
        <Route path="/feedback/:occasionId/:playbookId" element={<Feedback />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Layout>
  )
}

export default App

