'use client';

import { useRef, useCallback } from 'react';

export type NotificationType = 'nueva-orden' | 'orden-lista' | 'orden-cobrada';

// Función para reproducir sonido usando Web Audio API
const playNotificationSound = (type: NotificationType) => {
  try {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    
    // Configurar sonido según el tipo
    switch (type) {
      case 'nueva-orden':
        // Dos beeps para chef
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        
        // Segundo beep
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'sine';
          osc2.frequency.value = 800;
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.15);
        }, 150);
        break;
      
      case 'orden-lista':
        // Tres beeps ascendentes para cajero
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'sine';
          osc2.frequency.value = 700;
          gain2.gain.setValueAtTime(0.25, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.1);
        }, 100);
        
        setTimeout(() => {
          const osc3 = audioContext.createOscillator();
          const gain3 = audioContext.createGain();
          osc3.connect(gain3);
          gain3.connect(audioContext.destination);
          osc3.type = 'sine';
          osc3.frequency.value = 800;
          gain3.gain.setValueAtTime(0.25, audioContext.currentTime);
          gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          osc3.start(audioContext.currentTime);
          osc3.stop(audioContext.currentTime + 0.15);
        }, 200);
        break;
      
      case 'orden-cobrada':
        // Beep largo para mesero
        oscillator.frequency.value = 900;
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  } catch (error) {
    console.error('Error al reproducir sonido:', error);
  }
};

export const useNotificationSound = () => {
  const previousCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  const checkForNewItems = useCallback((currentCount: number, type: NotificationType) => {
    // En la primera carga, solo guardar el valor sin reproducir sonido
    if (!isInitializedRef.current) {
      previousCountRef.current = currentCount;
      isInitializedRef.current = true;
      return;
    }

    // Si hay más items que antes, reproducir sonido
    if (currentCount > previousCountRef.current) {
      playNotificationSound(type);
    }

    previousCountRef.current = currentCount;
  }, []);

  const playSound = useCallback((type: NotificationType) => {
    playNotificationSound(type);
  }, []);

  const reset = useCallback(() => {
    isInitializedRef.current = false;
    previousCountRef.current = 0;
  }, []);

  return { checkForNewItems, playSound, reset };
};
