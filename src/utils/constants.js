export const PLATFORM_NAME = 'EarnFlow'
export const MIN_WITHDRAWAL = 550
export const REGISTRATION_FEE = 500
export const SIGNUP_BONUS = 100
export const REFERRAL_BONUS = 200
export const DAILY_EARNING_LIMIT = 60

export const WEEKLY_SCHEDULE = {
  monday: {
    day: 'Monday',
    icon: 'Youtube',
    color: 'red',
    title: 'YouTube Videos',
    tasks: [
      { id: 'mon-1', type: 'video', platform: 'youtube', title: 'YouTube Video 1', reward: 20, duration: 30 },
      { id: 'mon-2', type: 'video', platform: 'youtube', title: 'YouTube Video 2', reward: 20, duration: 30 },
      { id: 'mon-3', type: 'video', platform: 'youtube', title: 'YouTube Video 3', reward: 20, duration: 30 },
    ],
    totalTasks: 3,
    rewardPerTask: 20,
    description: 'Watch 3 YouTube videos, earn Ksh 20 each'
  },
  tuesday: {
    day: 'Tuesday',
    icon: 'ClipboardCheck',
    color: 'blue',
    title: 'Surveys & Polls',
    tasks: [
      { id: 'tue-1', type: 'survey', title: 'Customer Feedback Survey', reward: 12, duration: 120 },
      { id: 'tue-2', type: 'survey', title: 'Product Preference Poll', reward: 12, duration: 90 },
      { id: 'tue-3', type: 'survey', title: 'Market Research Survey', reward: 12, duration: 150 },
      { id: 'tue-4', type: 'survey', title: 'User Experience Survey', reward: 12, duration: 100 },
      { id: 'tue-5', type: 'survey', title: 'Brand Awareness Poll', reward: 12, duration: 80 },
    ],
    totalTasks: 5,
    rewardPerTask: 12,
    description: 'Complete 5 surveys, earn Ksh 12 each'
  },
  wednesday: {
    day: 'Wednesday',
    icon: 'Music2',
    color: 'pink',
    title: 'TikTok Videos',
    tasks: [
      { id: 'wed-1', type: 'video', platform: 'tiktok', title: 'TikTok Video 1', reward: 15, duration: 25 },
      { id: 'wed-2', type: 'video', platform: 'tiktok', title: 'TikTok Video 2', reward: 15, duration: 25 },
      { id: 'wed-3', type: 'video', platform: 'tiktok', title: 'TikTok Video 3', reward: 15, duration: 25 },
      { id: 'wed-4', type: 'video', platform: 'tiktok', title: 'TikTok Video 4', reward: 15, duration: 25 },
    ],
    totalTasks: 4,
    rewardPerTask: 15,
    description: 'Watch 4 TikTok videos, earn Ksh 15 each'
  },
  thursday: {
    day: 'Thursday',
    icon: 'MousePointerClick',
    color: 'amber',
    title: 'Click Ads (PTC)',
    tasks: [
      { id: 'thu-1', type: 'ad', title: 'Sponsored Ad 1', reward: 10, duration: 10 },
      { id: 'thu-2', type: 'ad', title: 'Sponsored Ad 2', reward: 10, duration: 10 },
      { id: 'thu-3', type: 'ad', title: 'Sponsored Ad 3', reward: 10, duration: 10 },
      { id: 'thu-4', type: 'ad', title: 'Sponsored Ad 4', reward: 10, duration: 10 },
      { id: 'thu-5', type: 'ad', title: 'Sponsored Ad 5', reward: 10, duration: 10 },
      { id: 'thu-6', type: 'ad', title: 'Sponsored Ad 6', reward: 10, duration: 10 },
    ],
    totalTasks: 6,
    rewardPerTask: 10,
    description: 'View 6 ads, earn Ksh 10 each'
  },
  friday: {
    day: 'Friday',
    icon: 'Brain',
    color: 'purple',
    title: 'Trivia Quiz',
    tasks: [
      { id: 'fri-1', type: 'trivia', title: 'Trivia Round 1', reward: 20, questions: 5 },
      { id: 'fri-2', type: 'trivia', title: 'Trivia Round 2', reward: 20, questions: 5 },
      { id: 'fri-3', type: 'trivia', title: 'Trivia Round 3', reward: 20, questions: 5 },
    ],
    totalTasks: 3,
    rewardPerTask: 20,
    description: 'Complete 3 trivia rounds, earn Ksh 20 each'
  },
  saturday: null,
  sunday: null,
}