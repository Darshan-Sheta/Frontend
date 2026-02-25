import { createStore } from "idb-keyval";

export const publicKeyStore = createStore("public-key", "documents");
export const chatSecretKeyStore = createStore("chat-secret-key-store", "chat-secret-key");
