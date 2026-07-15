import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { initializeIdentity, getPublicKeyB64 } from '../mesh/Encryption';
import { getIdentityValue } from '../db/database';
import MeshManager from '../mesh/MeshManager';
import SyncBridge from '../sync/SyncBridge';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [myNodeId, setMyNodeId]     = useState(null);
  const [peers, setPeers]           = useState([]);
  const [messages, setMessages]     = useState([]);
  const [syncStatus, setSyncStatus] = useState({ status: 'offline', detail: '' });
  const [lowPowerMode, setLowPowerModeState] = useState(false);
  const [isReady, setIsReady]       = useState(false);

  useEffect(() => {
    async function boot() {
      try {
        const nodeId = await initializeIdentity();
        setMyNodeId(nodeId);

        await MeshManager.initialize(nodeId, {
          onPeersUpdate:    setPeers,
          onMessageReceived: (msg) => setMessages(prev => [msg, ...prev.slice(0, 499)]),
        });

        SyncBridge.start(setSyncStatus);
        setIsReady(true);
        console.log('[App] Boot complete. Node:', nodeId);
      } catch (e) {
        console.error('[App] Boot error:', e);
        Alert.alert('Initialization Error', e.message);
      }
    }
    boot();

    return () => {
      MeshManager.destroy();
      SyncBridge.stop();
    };
  }, []);

  const toggleLowPowerMode = useCallback((value) => {
    setLowPowerModeState(value);
    MeshManager.setLowPowerMode(value);
  }, []);

  return (
    <AppContext.Provider
      value={{
        myNodeId,
        peers,
        messages,
        syncStatus,
        lowPowerMode,
        toggleLowPowerMode,
        isReady,
        sendMessage: MeshManager.sendMessage.bind(MeshManager),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
