import { PackageOpen } from 'lucide-react'

const EmptyState = ({ icon: Icon = PackageOpen, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6"><Icon size={36} className="text-gray-500" /></div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-gray-400 max-w-sm">{description}</p>}
  </div>
)

export default EmptyState
