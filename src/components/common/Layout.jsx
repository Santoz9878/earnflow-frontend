import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import LiveFeed from './LiveFeed'
import Footer from './Footer'

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-gray-950">
    <Navbar />
    <LiveFeed />
    <main className="flex-1"><Outlet /></main>
    <Footer />
  </div>
)

export default Layout
