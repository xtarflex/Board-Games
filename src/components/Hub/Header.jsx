import { useRef } from 'react';
import { Shield, Settings, Terminal, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { importNerdFile } from '../../utils/fileSystem.js';
import { deserializeGame } from '../../utils/gameSecurity.js';

const Header = ({ p1Wins, aiWins, onImportMatch }) => {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await importNerdFile(file);
      if (text) {
        const gameData = deserializeGame(text);
        if (gameData.error) {
          alert(`Import failed: ${gameData.error}`);
        } else if (onImportMatch) {
          onImportMatch(gameData);
        } else {
          console.log("Imported data:", gameData);
          alert("Imported successfully! Check console for data.");
        }
      }
    } catch (error) {
      console.error("Error handling file upload:", error);
      alert("Failed to read file.");
    }

    // Reset input so the same file can be selected again
    event.target.value = null;
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3 group cursor-pointer">
        <motion.div 
          whileHover={{ rotate: 180 }} 
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Shield className="w-8 h-8 text-indigo-500 group-hover:text-rose-500 transition-colors" />
        </motion.div>
        <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
          NERD HUB
        </h1>
      </div>
      
      <div className="flex items-center space-x-8">
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <div className="flex flex-col items-center">
            <span className="text-obsidian-400 text-xs uppercase tracking-widest">P1 Wins</span>
            <span className="text-indigo-400 font-mono text-lg">{p1Wins}</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-obsidian-400 text-xs uppercase tracking-widest">AI Wins</span>
            <span className="text-rose-400 font-mono text-lg">{aiWins}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".nerd"
            style={{ display: 'none' }}
          />
          <button
            onClick={handleImportClick}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-indigo-400 relative group"
          >
            <Code className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-obsidian-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Import</span>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-indigo-400 relative group">
            <Settings className="w-5 h-5" />
          </button>
          <button className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <Terminal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
