import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>

          <div className="flex items-center space-x-3 mb-6">
            <FileText size={32} className="text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
          </div>

          <div className="card space-y-6 text-gray-300 leading-relaxed">
            <p className="text-gray-400 text-sm">Last updated: January 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By registering on EarnFlow, you agree to these Terms & Conditions. If you do not agree, please do not use our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Registration & Payments</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Registration requires a one-time fee of Ksh 500 paid via M-Pesa.</li>
                <li>Upon successful payment, a Ksh 100 signup bonus is credited to your account.</li>
                <li>All payments are final and non-refundable.</li>
                <li>You must provide accurate information during registration.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Earning Tasks</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Tasks are available Monday through Friday only.</li>
                <li>Maximum daily earnings from tasks is Ksh 60.</li>
                <li>Tasks must be completed genuinely. Use of bots or automation will result in account suspension.</li>
                <li>EarnFlow reserves the right to modify task rewards at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. MMF Investments</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>MMF investments are subject to the terms of each plan.</li>
                <li>Early withdrawal from MMF plans incurs a 10% penalty and loss of accrued interest.</li>
                <li>Returns are calculated based on the plan selected (24h, 48h, or weekly).</li>
                <li>EarnFlow is not liable for market fluctuations affecting MMF returns.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Referral Program</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You earn Ksh 200 for each successful referral.</li>
                <li>Referral bonuses are credited automatically upon the referred user's registration.</li>
                <li>Self-referrals and fake accounts are prohibited and will result in account termination.</li>
                <li>Agents' referrals are subject to admin approval before bonus credit.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Withdrawals</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Minimum withdrawal amount is Ksh 550.</li>
                <li>Withdrawals are processed to your registered M-Pesa number.</li>
                <li>Processing time may vary from instant to 24 hours.</li>
                <li>EarnFlow reserves the right to verify your identity before processing withdrawals.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Account Suspension</h2>
              <p>EarnFlow reserves the right to suspend or terminate accounts for:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Fraudulent activity</li>
                <li>Use of bots or automation</li>
                <li>Multiple accounts from the same user</li>
                <li>Violation of any platform rules</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
              <p>EarnFlow is provided "as is" without warranties. We are not liable for any losses arising from use of the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
              <p>For questions about these terms, contact us at support@earnflow.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms