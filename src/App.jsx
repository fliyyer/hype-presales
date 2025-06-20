import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const WALLET_ADDRESS = '0x8254a986319461bf29ae35940a96786e507ad9ac'
const HYPE_SYMBOL = 'HYPE'

function App() {
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 18 })

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        setWalletAddress(accounts[0])
      } catch (error) {
        console.error('Wallet connection failed:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  useEffect(() => {
    const target = new Date()
    target.setDate(target.getDate() + 1)
    target.setHours(target.getHours() + 18)

    const interval = setInterval(() => {
      const now = new Date()
      const diff = target - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      setTimeLeft({ days, hours })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl border border-green-500 p-8 rounded-lg space-y-6 bg-black/60 backdrop-blur-md shadow-lg">

        {/* Title */}
        <h1 className="text-5xl text-center border-b border-green-500 pb-4">🚀 PRESALE</h1>

        {/* Subtitle */}
        <p className="text-center text-xl">Join us now and grab your $HYPE early!</p>

        {/* Amount input */}
        <div className="space-y-2">
          <label className="text-sm">Amount ({HYPE_SYMBOL})</label>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full p-2 border border-green-400 bg-black text-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Connect Wallet */}
        <button
          className={`w-full p-3 rounded font-bold transition ${walletAddress
            ? 'bg-green-700 text-white cursor-default'
            : 'bg-green-400 hover:bg-green-300 text-black'
            }`}
          onClick={connectWallet}
          disabled={!!walletAddress}
        >
          {walletAddress ? '✅ Wallet Connected' : '🔗 Connect Wallet'}
        </button>

        {/* Wallet Info */}
        {walletAddress && (
          <div className="bg-green-900/50 border border-green-400 rounded p-4 text-sm space-y-1">
            <p><strong>Wallet:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            {amount && <p><strong>Amount:</strong> {amount} {HYPE_SYMBOL}</p>}
          </div>
        )}

        {/* Manual Send */}
        <div className="pt-4">
          <p className="text-sm mb-1">Or send manually to:</p>
          <code className="block p-2 text-sm bg-green-800/40 border border-green-400 rounded break-all">
            {WALLET_ADDRESS}
          </code>
        </div>

        {/* Countdown */}
        <div className="text-center text-2xl border-t border-green-500 pt-4">
          ⏳ {timeLeft.days} Days <span className="ml-4">{timeLeft.hours} Hours</span>
        </div>
      </div>
    </div>
  )
}

export default App
