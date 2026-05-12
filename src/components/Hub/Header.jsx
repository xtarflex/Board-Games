import { useRef, useState, useEffect } from 'react';
import { Shield, Settings, Terminal, Code, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { importNerdFile } from '../../utils/fileSystem.js';
import { deserializeGame } from '../../utils/gameSecurity.js';
import { saveUserProfile, getUserProfile } from '../../utils/persistence.js';

const Header = ({ p1Wins, aiWins, onImportMatch }) => {
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState({ username: 'Nerd', avatarData: null });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getUserProfile();
      if (data) {
        setProfile({
          username: data.username || 'Nerd',
          avatarData: data.avatarData || null
        });
      }
    };
    loadProfile();
  }, []);

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

    event.target.value = null;
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      const newProfile = { ...profile, avatarData: base64Data };
      setProfile(newProfile);
      await saveUserProfile(newProfile);
    };
    reader.readAsDataURL(file);
    event.target.value = null;
  };

  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value;
    const newProfile = { ...profile, username: newUsername };
    setProfile(newProfile);
    await saveUserProfile(newProfile);
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center">
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
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-indigo-400 relative group"
            >
              {profile.avatarData ? (
                <img src={profile.avatarData} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <Settings className="w-5 h-5" />
              )}
            </button>
            <button className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
              <Terminal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-obsidian-800 border border-indigo-500/30 p-6 rounded-3xl w-full max-w-md shadow-deep relative"
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-indigo-400">OPERATOR PROFILE</h2>

              <div className="flex flex-col items-center gap-4 mb-6">
                <div
                  className="w-24 h-24 rounded-full border-4 border-obsidian-700 overflow-hidden bg-obsidian-900 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {profile.avatarData ? (
                    <img src={profile.avatarData} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-sm">Upload</span>
                  )}
                </div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <p className="text-xs text-slate-400">Click to change avatar</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-obsidian-400 uppercase tracking-wider mb-2">
                    Callsign
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={handleUsernameChange}
                    className="w-full bg-obsidian-900 border border-obsidian-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Enter callsign..."
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
