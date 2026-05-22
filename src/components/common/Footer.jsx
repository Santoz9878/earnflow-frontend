import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <img src="/logo.png" alt="EarnFlow" className="w-8 h-8 rounded-lg object-cover" />
        <span className="text-lg font-bold text-white">EarnFlow</span>
      </div>
      <p className="text-gray-500">&copy; {new Date().getFullYear()} EarnFlow. All rights reserved.</p>
      <div className="flex justify-center space-x-6 mt-4">
        <Link to="/stats" className="text-gray-400 hover:text-white text-sm transition-colors">Stats</Link>
        <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
        <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
      </div>
    </div>
  </footer>
)

export default Footer