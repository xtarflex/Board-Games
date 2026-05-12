import { useState } from 'react'
import Header from './components/Hub/Header'
import './App.css'

function App() {
  const [p1Wins, setP1Wins] = useState(0)
  const [aiWins, setAiWins] = useState(0)

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* 1. Integrated your custom Header */}
      <Header p1Wins={p1Wins} aiWins={aiWins} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4 tracking-tighter">
            CHOOSE YOUR <span className="text-indigo-500">BATTLE</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Test your logic against our Minimax AI or record your gameplay into high-quality MP4s.
          </p>
        </section>

        {/* Placeholder for Game Board */}
        <div className="glass-panel min-h-[400px] flex items-center justify-center border-2 border-dashed border-indigo-500/20 rounded-4xl">
          <div className="text-center">
            <p className="text-indigo-400 font-mono mb-4">SYSTEM READY</p>
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-neon-indigo">
              Initialize Connect Four
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App