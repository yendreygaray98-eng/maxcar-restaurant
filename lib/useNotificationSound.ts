'use client';

import { useEffect, useRef } from 'react';

export type NotificationType = 'nueva-orden' | 'orden-lista' | 'orden-cobrada';

// Sonidos usando Web Audio API (no requieren archivos externos)
const createBeep = (frequency: number, duration: number, volume: number = 0.3) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const playNotificationSound = (type: NotificationType) => {
  try {
    switch (type) {
      case 'nueva-orden':
        // Sonido de alerta para chef (dos beeps rápidos)
        createBeep(800, 0.15, 0.4);
        setTimeout(() => createBeep(800, 0.15, 0.4), 150);
        break;
      
      case 'orden-lista':
        // Sonido de notificación para cajero (tres beeps ascendentes)
        createBeep(600, 0.1, 0.3);
        setTimeout(() => createBeep(700, 0.1, 0.3), 100);
        setTimeout(() => createBeep(800, 0.15, 0.3), 200);
        break;
      
      case 'orden-cobrada':
        // Sonido de éxito para mesero (beep largo)
        createBeep(900, 0.3, 0.3);
        break;
    }
  } catch (error) {
    console.error('Error al reproducir sonido:', error);
  }
};

export const useNotificationSound = () => {
  const previousCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  const checkForNewItems = (currentCount: number, type: NotificationType) => {
    // Esperar un ciclo antes de empezar a detectar cambios
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
  };

  const playSound = (type: NotificationType) => {
    playNotificationSound(type);
  };

  const reset = () => {
    isInitializedRef.current = false;
    previousCountRef.current = 0;
  };

  return { checkForNewItems, playSound, reset };
};
