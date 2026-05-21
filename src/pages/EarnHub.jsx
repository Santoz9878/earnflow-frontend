import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Play, ClipboardCheck, MousePointerClick, Brain, TrendingUp, Clock, Calendar, AlertCircle, Music2, CheckCircle, DollarSign } from 'lucide-react'
import { fetchTodayTasks, fetchTodayEarnings, completeTask } from '../redux/slices/tasksSlice'
import { fetchBalance } from '../redux/slices/walletSlice'
import { formatCurrency, getTodayName, isWeekday } from '../utils/formatCurrency'
import { WEEKLY_SCHEDULE, DAILY_EARNING_LIMIT } from '../utils/constants'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const EarnHub = () => {
  const dispatch = useDispatch()
  const { todayTasks, todayEarnings, completedTasks, schedule, isWeekday: isWeekdayToday, isLoading } = useSelector((state) => state.tasks)
  const { balance } = useSelector((state) => state.wallet)
  const [activeTask, setActiveTask] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isDoing, setIsDoing] = useState(false)
  const [canComplete, setCanComplete] = useState(false)
  const [triviaAnswers, setTriviaAnswers] = useState({})
  const [triviaSubmitted, setTriviaSubmitted] = useState(false)

  const today = getTodayName()
  const todaySchedule = WEEKLY_SCHEDULE[today]
  const remainingEarnings = Math.max(0, DAILY_EARNING_LIMIT - (todayEarnings || 0))

  useEffect(() => {
    dispatch(fetchTodayTasks())
    dispatch(fetchTodayEarnings())
    dispatch(fetchBalance())
  }, [dispatch])

  const startTask = (task) => {
    setActiveTask(task)
    if (task.type === 'video' || task.type === 'ad') {
      setIsDoing(true)
      setTimeLeft(task.duration || 30)
      setCanComplete(false)
    } else if (task.type === 'survey') {
      setIsDoing(true)
      setCanComplete(true)
    } else if (task.type === 'trivia') {
      setIsDoing(true)
      setTriviaAnswers({})
      setTriviaSubmitted(false)
    }
  }

  useEffect(() => {
    if (isDoing && timeLeft > 0 && (activeTask?.type === 'video' || activeTask?.type === 'ad')) {
      const timer = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); setCanComplete(true); return 0 } return prev - 1 })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isDoing, timeLeft])

  const handleComplete = async () => {
    if (!activeTask) return
    try {
      const result = await dispatch(completeTask({ task_id: activeTask.id, task_type: activeTask.type })).unwrap()
      dispatch(fetchBalance())
      dispatch(fetchTodayEarnings())
      toast.success(formatCurrency(result.reward) + ' credited!')
      closeTask()
    } catch (error) { toast.error(error || 'Failed to complete task') }
  }

  const handleTriviaSubmit = () => { setTriviaSubmitted(true); setCanComplete(true) }

  const closeTask = () => {
    setActiveTask(null); setIsDoing(false); setTimeLeft(0); setCanComplete(false)
    setTriviaAnswers({}); setTriviaSubmitted(false)
  }

  const isCompleted = (taskId) => completedTasks?.includes(taskId)
  const dailyLimitReached = (todayEarnings || 0) >= DAILY_EARNING_LIMIT

  const getDayIcon = (iconName) => {
    switch (iconName) {
      case 'Youtube': return <Play size={24} className="text-red-400" />
      case 'ClipboardCheck': return <ClipboardCheck size={24} className="text-blue-400" />
      case 'Music2': return <Music2 size={24} className="text-pink-400" />
      case 'MousePointerClick': return <MousePointerClick size={24} className="text-amber-400" />
      case 'Brain': return <Brain size={24} className="text-purple-400" />
      default: return <Play size={24} className="text-gray-400" />
    }
  }

  if (isLoading) return <LoadingSpinner text="Loading today's tasks..." />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Earn Today</h1>
        <p className="text-gray-400 mt-1">{isWeekdayToday ? todaySchedule?.day + "'s Tasks - " + todaySchedule?.description : 'Weekend - No tasks available'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center space-x-4"><div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center"><TrendingUp size={24} className="text-emerald-400" /></div><div><p className="text-gray-400 text-sm">Today's Earnings</p><p className="text-white text-xl font-bold">{formatCurrency(todayEarnings || 0)}</p></div></div>
        <div className="card flex items-center space-x-4"><div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Clock size={24} className="text-blue-400" /></div><div><p className="text-gray-400 text-sm">Daily Limit</p><p className="text-white text-xl font-bold">{formatCurrency(DAILY_EARNING_LIMIT)}</p></div></div>
        <div className="card flex items-center space-x-4"><div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center"><DollarSign size={24} className="text-amber-400" /></div><div><p className="text-gray-400 text-sm">Remaining</p><p className="text-white text-xl font-bold">{formatCurrency(remainingEarnings)}</p></div></div>
      </motion.div>

      {isWeekdayToday && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card mb-8">
          <div className="flex items-center justify-between mb-2"><span className="text-gray-400 text-sm">Daily Progress</span><span className="text-gray-400 text-sm">{Math.round(((todayEarnings || 0) / DAILY_EARNING_LIMIT) * 100)}%</span></div>
          <div className="w-full bg-gray-700 rounded-full h-3"><div className={dailyLimitReached ? 'bg-emerald-500 h-3 rounded-full transition-all' : 'bg-blue-500 h-3 rounded-full transition-all'} style={{ width: Math.min(((todayEarnings || 0) / DAILY_EARNING_LIMIT) * 100, 100) + '%' }} /></div>
        </motion.div>
      )}

      {!isWeekdayToday && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center mb-8">
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Weekend - No Tasks Available</h2>
          <p className="text-gray-400 mb-4">Tasks run Monday through Friday. Check the schedule below!</p>
        </motion.div>
      )}

      {isWeekdayToday && dailyLimitReached && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center mb-8 bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Daily Limit Reached! ??</h2>
          <p className="text-gray-400">You've earned Ksh {DAILY_EARNING_LIMIT} for today. Invest in MMF to earn more!</p>
        </motion.div>
      )}

      {isWeekdayToday && todaySchedule && !dailyLimitReached && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center">{getDayIcon(todaySchedule.icon)}</div>
            <div><h2 className="text-xl font-bold text-white">{todaySchedule.title}</h2><p className="text-gray-400 text-sm">{todaySchedule.totalTasks} tasks - Ksh {todaySchedule.rewardPerTask} each</p></div>
          </div>
          <div className="space-y-4">
            {todaySchedule.tasks.map((task, index) => {
              const completed = isCompleted(task.id)
              const canDo = !completed && (todayEarnings || 0) + task.reward <= DAILY_EARNING_LIMIT
              return (
                <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}
                  className={'card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ' + (completed ? 'border-emerald-500/30 bg-emerald-500/5' : '')}>
                  <div className="flex items-start space-x-4">
                    <div className={'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' + (completed ? 'bg-emerald-500/20' : 'bg-gray-800')}>
                      {completed ? <CheckCircle size={20} className="text-emerald-400" /> : getDayIcon(todaySchedule.icon)}
                    </div>
                    <div><h3 className="text-white font-semibold">{task.title}</h3><p className="text-gray-400 text-sm">{task.type === 'video' ? task.platform + ' video - ' + task.duration + 's' : task.type === 'ad' ? task.duration + 's view' : task.type === 'trivia' ? (task.questions || 5) + ' questions' : 'Survey'}</p></div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-emerald-400 font-bold">{formatCurrency(task.reward)}</span>
                    {completed ? <span className="badge badge-success">Done</span> : canDo ? <button onClick={() => startTask(task)} className="btn-primary text-sm">Start</button> : <span className="badge badge-warning">Limit reached</span>}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Task Schedule</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {['monday','tuesday','wednesday','thursday','friday'].map((day) => {
            const s = WEEKLY_SCHEDULE[day]
            const isToday = today === day
            return (
              <div key={day} className={'p-4 rounded-xl border ' + (isToday ? 'bg-blue-600/20 border-blue-500/50' : 'bg-gray-800/30 border-gray-700/30')}>
                <p className={'text-sm font-semibold mb-1 ' + (isToday ? 'text-blue-400' : 'text-white')}>{s.day}</p>
                <div className="flex items-center space-x-1 mb-1">{getDayIcon(s.icon)}<span className="text-xs text-gray-400">{s.totalTasks} tasks</span></div>
                <p className="text-emerald-400 text-xs font-medium">Ksh {s.rewardPerTask} each</p>
                {isToday && <span className="badge badge-info mt-2">Today</span>}
              </div>
            )
          })}
        </div>
      </motion.div>

      {activeTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">{activeTask.title}</h2>
            <p className="text-gray-400 mb-4">Reward: {formatCurrency(activeTask.reward)}</p>
            {(activeTask.type === 'video' || activeTask.type === 'ad') && (
              <div className="text-center">
                <Play size={48} className="text-gray-600 mx-auto mb-4" />
                <span className="text-3xl font-bold text-white font-mono">{timeLeft}s</span>
              </div>
            )}
            {activeTask.type === 'survey' && (
              <div className="text-center py-8">
                <ClipboardCheck size={48} className="text-blue-400 mx-auto mb-4" />
                <p className="text-white mb-2">Complete the survey to earn {formatCurrency(activeTask.reward)}</p>
              </div>
            )}
            {activeTask.type === 'trivia' && !triviaSubmitted && (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">Answer these questions:</p>
                {[1,2,3,4,5].slice(0, activeTask.questions || 5).map((q, i) => (
                  <div key={i} className="flex space-x-2"><span className="text-white w-8">{q}.</span><input type="text" className="input-field flex-1 text-sm" onChange={(e) => setTriviaAnswers(prev => ({ ...prev, [q]: e.target.value }))} /></div>
                ))}
                <button onClick={handleTriviaSubmit} className="btn-primary w-full mt-4">Submit Answers</button>
              </div>
            )}
            {activeTask.type === 'trivia' && triviaSubmitted && (
              <div className="text-center py-8"><CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" /><p className="text-white">Answers submitted!</p></div>
            )}
            <div className="flex space-x-3 mt-6">
              <button onClick={closeTask} className="flex-1 btn-outline">Cancel</button>
              <button onClick={handleComplete} disabled={!canComplete} className={'flex-1 py-3 rounded-xl font-semibold ' + (canComplete ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed')}>
                {canComplete ? 'Claim ' + formatCurrency(activeTask.reward) : 'Please wait...'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default EarnHub
