const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
    {text && <p className="mt-4 text-gray-400">{text}</p>}
  </div>
)

export default LoadingSpinner
