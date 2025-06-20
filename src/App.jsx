import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const HYPER_EVM_CONFIG = {
  mainnet: {
    chainId: 999,
    chainName: 'HyperEVM Mainnet',
    rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
    explorerUrl: 'https://explorer.hyperliquid.xyz',
    nativeCurrency: {
      name: 'HYPE',
      symbol: 'HYPE',
      decimals: 18
    }
  },
  testnet: {
    chainId: 998,
    chainName: 'HyperEVM Testnet',
    rpcUrl: 'https://rpc.hyperliquid-testnet.xyz/evm',
    explorerUrl: 'https://explorer.hyperliquid-testnet.xyz',
    nativeCurrency: {
      name: 'HYPE',
      symbol: 'HYPE',
      decimals: 18
    }
  }
}

const HYPE_SYMBOL = 'HYPE'
const PRESALE_ADDRESS = '0x8254a986319461bf29ae35940a96786e507ad9ac'
const HYPER_EVM_BRIDGE_ADDRESS = '0x2222222222222222222222222222222222222222' // For transferring HYPE between HyperCore and HyperEVM

function App() {
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 18 })
  const [isMobile, setIsMobile] = useState(false)
  const [provider, setProvider] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [networkType, setNetworkType] = useState('mainnet')

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  }, [])

  const getCurrentConfig = () => HYPER_EVM_CONFIG[networkType]

  const addHyperEVMNetwork = async () => {
    const config = getCurrentConfig()
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${config.chainId.toString(16)}`,
          chainName: config.chainName,
          nativeCurrency: config.nativeCurrency,
          rpcUrls: [config.rpcUrl],
          blockExplorerUrls: [config.explorerUrl]
        }]
      })
      return true
    } catch (error) {
      console.error('Error adding HyperEVM network:', error)
      return false
    }
  }

  const switchToHyperEVM = async () => {
    const config = getCurrentConfig()
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${config.chainId.toString(16)}` }]
      })
      return true
    } catch (switchError) {
      if (switchError.code === 4902) {
        const added = await addHyperEVMNetwork()
        return added
      }
      console.error('Error switching to HyperEVM:', switchError)
      return false
    }
  }

  const checkNetwork = async (provider) => {
    const config = getCurrentConfig()
    const network = await provider.getNetwork()
    setChainId(network.chainId)
    return network.chainId === BigInt(config.chainId)
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)

        const accounts = await provider.send('eth_requestAccounts', [])
        setWalletAddress(accounts[0])

        // Check and switch to HyperEVM network
        const isCorrectNetwork = await checkNetwork(provider)
        if (!isCorrectNetwork) {
          const switched = await switchToHyperEVM()
          if (switched) {
            // Reload provider after network switch
            const newProvider = new ethers.BrowserProvider(window.ethereum)
            setProvider(newProvider)
            await checkNetwork(newProvider)
          }
        }
      } catch (error) {
        console.error('Wallet connection failed:', error)
        alert(`Wallet connection failed: ${error.message}`)
      }
    } else if (isMobile) {
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
    } else {
      alert('Please install MetaMask!')
    }
  }

  const transferHYPE = async () => {
    if (!provider || !amount) return

    try {
      const config = getCurrentConfig()
      const isCorrectNetwork = await checkNetwork(provider)
      if (!isCorrectNetwork) {
        alert(`Please switch to ${config.chainName} first`)
        return
      }

      const signer = await provider.getSigner()
      const tx = await signer.sendTransaction({
        to: PRESALE_ADDRESS,
        value: ethers.parseEther(amount)
      })

      alert(`Transaction sent: ${tx.hash}`)
      const receipt = await tx.wait()
      alert(`Transaction confirmed in block ${receipt.blockNumber}`)
    } catch (error) {
      console.error('Transfer failed:', error)
      alert(`Transfer failed: ${error.message}`)
    }
  }

  const bridgeToHyperEVM = async () => {
    if (!provider || !amount) return

    try {
      const signer = await provider.getSigner()
      const tx = await signer.sendTransaction({
        to: HYPER_EVM_BRIDGE_ADDRESS,
        value: ethers.parseEther(amount)
      })

      alert(`Bridging transaction sent: ${tx.hash}`)
    } catch (error) {
      console.error('Bridging failed:', error)
      alert(`Bridging failed: ${error.message}`)
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

        <h1 className="text-5xl text-center border-b border-green-500 pb-4">🚀 $HYPE PRESALE</h1>
        <p className="text-center text-xl">Join the HyperEVM ecosystem early!</p>

        {/* Network Selector */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setNetworkType('mainnet')}
            className={`px-4 py-2 rounded ${networkType === 'mainnet' ? 'bg-green-700' : 'bg-gray-700'}`}
          >
            Mainnet
          </button>
          <button
            onClick={() => setNetworkType('testnet')}
            className={`px-4 py-2 rounded ${networkType === 'testnet' ? 'bg-green-700' : 'bg-gray-700'}`}
          >
            Testnet
          </button>
        </div>

        {/* Network Indicator */}
        <div className={`p-2 rounded text-center ${chainId === BigInt(getCurrentConfig().chainId) ? 'bg-green-900' : 'bg-red-900'}`}>
          {chainId ? (
            chainId === BigInt(getCurrentConfig().chainId) ? (
              `Connected to ${getCurrentConfig().chainName}`
            ) : (
              `Please switch to ${getCurrentConfig().chainName}`
            )
          ) : (
            'Network not connected'
          )}
        </div>

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

        {walletAddress && (
          <div className="bg-green-900/50 border border-green-400 rounded p-4 text-sm space-y-1">
            <p><strong>Wallet:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            {amount && <p><strong>Amount:</strong> {amount} {HYPE_SYMBOL}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={transferHYPE}
            disabled={!walletAddress || !amount}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
          >
            Buy HYPE
          </button>
          <button
            onClick={bridgeToHyperEVM}
            disabled={!walletAddress || !amount}
            className="p-3 bg-purple-600 hover:bg-purple-500 rounded disabled:opacity-50"
          >
            Bridge to HyperEVM
          </button>
        </div>

        <div className="pt-4">
          <p className="text-sm mb-1">Presale Address:</p>
          <code className="block p-2 text-sm bg-green-800/40 border border-green-400 rounded break-all">
            {PRESALE_ADDRESS}
          </code>
          <p className="text-sm mt-2 mb-1">HyperEVM Bridge Address:</p>
          <code className="block p-2 text-sm bg-green-800/40 border border-green-400 rounded break-all">
            {HYPER_EVM_BRIDGE_ADDRESS}
          </code>
        </div>

        <div className="text-center text-2xl border-t border-green-500 pt-4">
          ⏳ {timeLeft.days} Days <span className="ml-4">{timeLeft.hours} Hours</span>
        </div>

        {isMobile && !walletAddress && (
          <div className="text-yellow-400 text-sm mt-4">
            <p>ℹ️ If MetaMask doesn't open automatically:</p>
            <p>1. Copy this page URL</p>
            <p>2. Open MetaMask app</p>
            <p>3. Paste URL in MetaMask browser</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App