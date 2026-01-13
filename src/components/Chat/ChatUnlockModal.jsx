import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deriveKeyFromPassword, decryptWithAesKey } from '../../config/passwordEncrypt';
import { setPrivateKeyInIdb } from '../../config/IndexDb';

const ChatUnlockModal = ({ isOpen, encryptedKey, iv, onUnlock }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Derive key from entered password
            const passwordKey = await deriveKeyFromPassword(password);

            // 2. Try to decrypt the private key
            const decryptedPrivateKey = await decryptWithAesKey(encryptedKey, iv, passwordKey);

            // 3. Store in IndexedDB
            await setPrivateKeyInIdb(decryptedPrivateKey);

            // 4. Success callback
            onUnlock();
        } catch (err) {
            console.error('Unlock failed:', err);
            setError('Invalid password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card p-8 w-full max-w-md"
                    >
                        <h2 className="text-2xl font-display font-bold text-text-main mb-4 text-center">🔐 Unlock Secure Chat</h2>
                        <p className="text-text-muted mb-6 text-center text-sm">
                            Enter your TeamBond password to unlock your personal secure chats. This is required only once per browser.
                        </p>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 text-text-main border border-border focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all hover:bg-white/80 placeholder-text-muted/50"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-xs mt-1 text-center font-medium">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !password}
                                className={`w-full py-3 bg-gradient-to-r from-accent to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Unlocking...' : 'Unlock Chat'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChatUnlockModal;
