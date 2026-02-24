// src/polyfills.ts

/**
 * Polyfill completo para Web Locks API
 * Fix para NavigatorLockAcquireTimeoutError en Supabase + Ionic
 */

// Guardar referencia original si existe
const originalLocks = (navigator as any).locks;

// Sobrescribir completamente navigator.locks
Object.defineProperty(navigator, 'locks', {
    value: {
        request: function (
            name: string,
            optionsOrCallback: any,
            callback?: any
        ): Promise<any> {
            // Determinar cuál es el callback
            const actualCallback = typeof optionsOrCallback === 'function'
                ? optionsOrCallback
                : callback;

            // Ejecutar callback inmediatamente sin lock
            const lockGranted = {
                name: name,
                mode: 'exclusive',
            };

            try {
                const result = actualCallback(lockGranted);
                return Promise.resolve(result);
            } catch (error) {
                return Promise.reject(error);
            }
        },

        query: function (): Promise<any> {
            return Promise.resolve({
                held: [],
                pending: []
            });
        }
    },
    writable: false,
    configurable: true
});

