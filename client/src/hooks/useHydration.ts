import { useState, useEffect } from 'react';

export function useHydration() {
     const [mounted, setMounted] = useState(false);

     useEffect(() => {
          setMounted(true);
     }, []);

     return mounted;
}

export function useClientOnly() {
     const [isClient, setIsClient] = useState(false);

     useEffect(() => {
          setIsClient(true);
     }, []);

     return isClient;
} 