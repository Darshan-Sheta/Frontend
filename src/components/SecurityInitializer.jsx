import React, { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getOrCreateRSAKeys } from "../crypto/rsaKeys";
import { toBase64 } from "../crypto/chatCrypto";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * SecurityInitializer handles automatic, transparent key management.
 * It ensures RSA keys exist in IndexedDB and are registered with the backend.
 */
const SecurityInitializer = () => {
    const { user, username } = useAuth();

    useEffect(() => {
        const initializeSecurity = async () => {
            if (!user || !username) return;

            try {
                // 1. Get or create RSA keys (Stored in browser's IndexedDB)
                const { publicKey } = await getOrCreateRSAKeys();

                // 2. Export local key
                const exportedPublic = await crypto.subtle.exportKey("spki", publicKey);
                const publicB64 = toBase64(exportedPublic);

                // 3. Robust Sync: Check what the server actually has
                let serverKey = null;
                try {
                    const { data } = await axios.get(`${API_BASE}/api/users/public_key/${username}`, { withCredentials: true });
                    serverKey = data;
                } catch (e) { console.warn("Could not fetch server key for comparison", e); }

                // 4. Update if missing or mismatch
                if (!serverKey || serverKey !== publicB64) {
                    console.log("🔐 Key Mismatch detected. Updating server with fresh Public Key...");
                    await axios.post(`${API_BASE}/api/users/update_public_key`, {
                        username,
                        publicKey: publicB64
                    }, { withCredentials: true });
                    console.log("✅ Server Public Key updated.");
                } else {
                    console.log("✅ Keys are in sync with server.");
                }
            } catch (error) {
                console.error("❌ Automatic security initialization failed:", error);
            }
        };

        initializeSecurity();
    }, [user, username]);

    return null; // This is a logic-only component
};

export default SecurityInitializer;
