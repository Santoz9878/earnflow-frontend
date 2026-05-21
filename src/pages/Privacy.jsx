import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>

          <div className="flex items-center space-x-3 mb-6">
            <Shield size={32} className="text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="card space-y-6 text-gray-300 leading-relaxed">
            <p className="text-gray-400 text-sm">Last updated: January 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Email address during registration</li>
                <li>M-Pesa phone number for withdrawals</li>
                <li>ID number and KYC documents for verification</li>
                <li>Transaction history and earning records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To process your registration and payments</li>
                <li>To verify your identity (KYC)</li>
                <li>To send withdrawal confirmations</li>
                <li>To improve our platform and services</li>
                <li>To detect and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Protection</h2>
              <p>We implement security measures to protect your personal information including encryption and secure servers.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Payment processors (M-Pesa) for transactions</li>
                <li>Law enforcement if required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Contact</h2>
              <p>For privacy concerns, contact us at privacy@earnflow.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Privacy