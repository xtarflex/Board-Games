import { useState } from 'react'
import Header from './components/Hub/Header'
import ConnectFour from './components/Engines/ConnectFour'
import './App.css'

function App() {
  const [p1Wins, setP1Wins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [activeGame, setActiveGame] = useState(null)

  // This state is just to demonstrate receiving imported data for now.
  // In a real VCR, we would pass this to a ReplayViewer component.
  const [importedGameInfo, setImportedGameInfo] = useState(null)

  const handleWin = (player) => {
    if (player === 1) setP1Wins(prev => prev + 1)
    if (player === 2) setAiWins(prev => prev + 1)
  }

  const handleImportMatch = (gameData) => {
    console.log("Imported Match Data:", gameData);
    setImportedGameInfo(gameData);
    setActiveGame(null); // Clear active game if any
  }

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Header p1Wins={p1Wins} aiWins={aiWins} onImportMatch={handleImportMatch} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4 tracking-tighter">
            CHOOSE YOUR <span className="text-indigo-500">BATTLE</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Test your logic against our Minimax AI or record your gameplay into high-quality MP4s.
          </p>

          {/* Game Selection Buttons */}
          <div className="flex justify-center gap-4">
             <button
                onClick={() => { setActiveGame('C4'); setImportedGameInfo(null); }}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  activeGame === 'C4'
                    ? 'bg-indigo-600 shadow-neon-indigo'
                    : 'bg-obsidian-800 hover:bg-obsidian-700 border border-indigo-500/20'
                }`}
              >
                Play Connect Four
             </button>
             {/* Other games would go here */}
          </div>
        </section>

        {/* Game Area */}
        {activeGame === 'C4' && (
          <ConnectFour onWin={handleWin} />
        )}

        {/* Placeholder if no game is selected */}
        {!activeGame && !importedGameInfo && (
           <div className="glass-panel min-h-[400px] flex items-center justify-center border-2 border-dashed border-indigo-500/20 rounded-4xl mt-12">
            <div className="text-center text-slate-500 font-mono">
              SYSTEM STANDBY
            </div>
          </div>
        )}

        {/* Basic display for imported match data (for testing) */}
        {importedGameInfo && (
          <div className="glass-panel p-8 border border-rose-500/20 rounded-4xl mt-12 w-full max-w-2xl mx-auto text-left">
             <h3 className="text-2xl font-bold text-rose-400 mb-4">MATCH IMPORTED SUCCESSFULLY</h3>
             <pre className="bg-obsidian-800 p-4 rounded-xl text-xs font-mono overflow-auto border border-white/5">
               {JSON.stringify(importedGameInfo, null, 2)}
             </pre>
             <button
                onClick={() => setImportedGameInfo(null)}
                className="mt-4 px-6 py-2 bg-obsidian-700 hover:bg-obsidian-600 rounded-lg text-sm"
              >
               Dismiss
             </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
