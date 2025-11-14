"use client";

import { X } from 'lucide-react';
import { useState } from 'react';

interface AdBannerProps {
  onUpgrade?: () => void;
}

export function AdBanner({ onUpgrade }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 relative">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold text-lg mb-1">
            🎯 Anúncio - Apoie o Pendências Pro!
          </p>
          <p className="text-sm opacity-90">
            Remova anúncios e tenha acesso ilimitado por apenas R$ 9,99
          </p>
        </div>
        
        <button
          onClick={onUpgrade}
          className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
        >
          Assinar Premium
        </button>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 text-white hover:bg-white/20 p-1 rounded-full transition-colors"
          aria-label="Fechar anúncio"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
