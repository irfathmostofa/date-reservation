import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateInvite from './pages/CreateInvite.jsx'
import RespondInvite from './pages/RespondInvite.jsx'
import Home from './pages/Home.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateInvite />} />
        <Route path="/:slug" element={<RespondInvite />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
