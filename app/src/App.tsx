import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Docs from './pages/Docs'
import ProposalPage from './pages/Proposal/[id]'
import NewProposalPage from './pages/Proposal/new'
import ResultsPage from './pages/Results/[id]'
import CommunityPage from './pages/Community/[id]'
import NewCommunityPage from './pages/Community/new'
import { RPC_URL } from './utils/constants'
import '@solana/wallet-adapter-react-ui/styles.css'
import './styles/globals.css'
import './styles/covenant.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5000, retry: 2 },
  },
})

export default function App() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/"                element={<Home />} />
                <Route path="/docs"            element={<Docs />} />
                <Route path="/community/new"   element={<NewCommunityPage />} />
                <Route path="/community/:id"   element={<CommunityPage />} />
                <Route path="/proposal/new"    element={<NewProposalPage />} />
                <Route path="/proposal/:id"    element={<ProposalPage />} />
                <Route path="/results/:id"     element={<ResultsPage />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
