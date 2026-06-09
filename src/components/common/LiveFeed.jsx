import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchLiveFeed } from '../../redux/slices/liveFeedSlice'
import { TrendingUp } from 'lucide-react'

const LiveFeed = () => {
  const dispatch = useDispatch()
  const { feed } = useSelector((state) => state.liveFeed)

  useEffect(() => {
    dispatch(fetchLiveFeed())
    const interval = setInterval(() => dispatch(fetchLiveFeed()), 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  if (!feed || feed.length === 0) return null

  return (
    <div className="bg-gray-900 border-b border-gray-800 overflow-hidden">
      <div className="flex items-center space-x-2 px-4 py-2 max-w-7xl mx-auto">
        <TrendingUp size={16} className="text-emerald-400 flex-shrink-0" />
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-flex space-x-8">
            {[...feed, ...feed].map((item, index) => (
              <span key={index} className="text-sm text-gray-400">{item.user_name} {item.action} - </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveFeed
