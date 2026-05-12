import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Users, Trophy, History, ArrowLeft, Gamepad2 } from 'lucide-react'
import Header from './components/Hub/Header'
import ConnectFour from './components/Engines/ConnectFour'
import TicTacToe from './components/Engines/TicTacToe'
import Othello from './components/Engines/Othello'
import Mancala from './components/Engines/Mancala'
import Morris from './components/Engines/Morris'
import { getMatchesByType } from './utils/persistence.js'
import './App.css'

function App() {
  const [p1Wins, setP1Wins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [activeGame, setActiveGame] = useState(null)
  const [gameMode, setGameMode] = useState('PvAI') // 'PvAI' or 'PvP'

  const [importedGameInfo, setImportedGameInfo] = useState(null)
  const [showLobby, setShowLobby] = useState(null) // gameId like 'C4'
  const [lobbyMatches, setLobbyMatches] = useState([])

  const games = [
    { id: 'C4', title: 'Connect Four', desc: 'Vertical gravity-based alignment.', color: 'indigo' },
    { id: 'TTT', title: 'Tic Tac Toe', desc: 'Neon grid. Unbeatable AI.', color: 'rose' },
    { id: 'OTH', title: 'Othello', desc: 'Positional 8x8 territory capture.', color: 'emerald' },
    { id: 'MAN', title: 'Mancala', desc: 'Mathematical sowing and harvesting.', color: 'amber' },
    { id: 'TMM', title: "Three Men's Morris", desc: 'Strategic placement and movement.', color: 'cyan' },
  ]

  const handleWin = (player) => {
    if (player === 1) setP1Wins(prev => prev + 1)
    if (player === 2) setAiWins(prev => prev + 1)
  }

  const handleImportMatch = (gameData) => {
    setImportedGameInfo(gameData);
    setActiveGame(null);
    setShowLobby(null);
  }

  const openLobby = async (gameId) => {
    setShowLobby(gameId)
    setActiveGame(null)
    const matches = await getMatchesByType(gameId)
    setLobbyMatches(matches)
  }

  const startGame = (mode) => {
    setGameMode(mode)
    setActiveGame(showLobby)
  }

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Header p1Wins={p1Wins} aiWins={aiWins} onImportMatch={handleImportMatch} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!activeGame && !showLobby && !importedGameInfo && (
          <div
            className="fixed inset-0 z-0 pointer-events-none opacity-0"
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.replace('opacity-0', 'opacity-100'); }}
            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.replace('opacity-100', 'opacity-0'); }}
            onDrop={async (e) => {
              e.preventDefault();
              e.currentTarget.classList.replace('opacity-100', 'opacity-0');
              const file = e.dataTransfer.files[0];
              if (file && file.name.endsWith('.nerd')) {
                await file.text();
                // Need to import gameSecurity here ideally, but since we are in App we can trigger via handleImportMatch if we can parse it
                // Actually, let's let the user use the header button to import for now, or just show an alert.
                alert("Drag and drop import partially implemented. Please use the Header import button for full security validation.");
              }
            }}
          >
            <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-sm border-8 border-dashed border-indigo-500/50 m-8 rounded-[3rem] flex items-center justify-center">
               <h2 className="text-4xl font-black text-indigo-400 tracking-widest drop-shadow-md">DROP .NERD FILE TO IMPORT</h2>
            </div>
          </div>
        )}
        {!activeGame && !showLobby && !importedGameInfo && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-4 tracking-tighter">
              CHOOSE YOUR <span className="text-indigo-500">BATTLE</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-12">
              Test your logic against our Minimax AI or record your gameplay into high-quality MP4s.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(game => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openLobby(game.id)}
                  className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 cursor-pointer text-left group transition-all shadow-deep"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${game.color}-500/10 flex items-center justify-center mb-4 group-hover:bg-${game.color}-500/20 transition-colors`}>
                    <Gamepad2 className={`w-6 h-6 text-${game.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{game.title}</h3>
                  <p className="text-sm text-slate-400">{game.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {showLobby && !activeGame && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <button
              onClick={() => setShowLobby(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </button>

            <div className="glass-panel p-8 rounded-[3rem] border border-indigo-500/20 shadow-deep mb-8">
              <h2 className="text-4xl font-black mb-8">{games.find(g => g.id === showLobby)?.title} LOBBY</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => startGame('PvAI')}
                  className="flex flex-col items-center justify-center p-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-neon-indigo group"
                >
                  <Play className="w-12 h-12 mb-4 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-bold text-white">vs AI</span>
                  <span className="text-indigo-200 text-sm mt-2">Test your logic</span>
                </button>

                <button
                  onClick={() => startGame('PvP')}
                  className="flex flex-col items-center justify-center p-8 rounded-2xl bg-obsidian-800 hover:bg-obsidian-700 border border-white/10 hover:border-rose-500/30 transition-colors group"
                >
                  <Users className="w-12 h-12 mb-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-bold text-white">Local PvP</span>
                  <span className="text-slate-400 text-sm mt-2">Pass and play</span>
                </button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold">Recent Replays</h3>
              </div>

              {lobbyMatches.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-sm">
                  No match history found for this game.
                </div>
              ) : (
                <div className="space-y-3">
                  {lobbyMatches.slice(0, 5).map(match => (
                    <div key={match.id} className="flex items-center justify-between p-4 rounded-xl bg-obsidian-800/50 border border-white/5 hover:border-indigo-500/20 cursor-pointer transition-colors">
                      <div className="flex items-center gap-4">
                        <Trophy className={`w-5 h-5 ${match.winner === 1 ? 'text-indigo-400' : match.winner === 2 ? 'text-rose-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-bold text-sm">{match.winner === 1 ? 'P1 Victory' : match.winner === 2 ? 'AI Victory' : 'Draw'}</p>
                          <p className="text-xs text-slate-500">{new Date(match.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Game Engines */}
        {activeGame === 'C4' && (
          <div>
            <button
              onClick={() => { setActiveGame(null); setShowLobby('C4'); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
            <ConnectFour onWin={handleWin} mode={gameMode} />
          </div>
        )}

        {activeGame === 'TTT' && (
          <div>
            <button
              onClick={() => { setActiveGame(null); setShowLobby('TTT'); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
            <TicTacToe onWin={handleWin} mode={gameMode} />
          </div>
        )}

        {activeGame === 'OTH' && (
          <div>
            <button
              onClick={() => { setActiveGame(null); setShowLobby('OTH'); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
            <Othello onWin={handleWin} mode={gameMode} />
          </div>
        )}

        {activeGame === 'MAN' && (
          <div>
            <button
              onClick={() => { setActiveGame(null); setShowLobby('MAN'); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
            <Mancala onWin={handleWin} mode={gameMode} />
          </div>
        )}

        {activeGame === 'TMM' && (
          <div>
            <button
              onClick={() => { setActiveGame(null); setShowLobby('TMM'); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
            <Morris onWin={handleWin} mode={gameMode} />
          </div>
        )}

        {/* Placeholders for other games for now */}
        {[''].includes(activeGame) && (
          <div>
            <button
              onClick={() => { setActiveGame(null); setShowLobby(activeGame); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
            <div className="glass-panel min-h-[400px] flex items-center justify-center border-2 border-dashed border-indigo-500/20 rounded-4xl">
              <div className="text-center text-slate-500 font-mono">
                ENGINE IN DEVELOPMENT
              </div>
            </div>
          </div>
        )}

        {/* Imported Data Display */}
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
