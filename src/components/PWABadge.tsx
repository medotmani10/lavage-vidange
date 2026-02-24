import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, Download } from 'lucide-react';

export function PWABadge() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    const handleInstall = async () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        if (outcome === 'accepted') {
            setInstallPromptEvent(null);
        }
    };

    if (!offlineReady && !needRefresh && !installPromptEvent) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-lg)] rounded-2xl p-4 shadow-2xl min-w-[320px]">
                <div className="space-y-4">
                    <div className="text-sm font-medium text-white">
                        {offlineReady && <span>App ready to work offline</span>}
                        {needRefresh && <span>New content available, click on reload button to update.</span>}
                        {installPromptEvent && !needRefresh && !offlineReady && (
                            <span className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-primary-500" />
                                Installer l&apos;application sur votre appareil
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {needRefresh && (
                            <button
                                className="flex-1 px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Recharger
                            </button>
                        )}
                        {installPromptEvent && !needRefresh && (
                            <button
                                className="flex-1 px-4 py-2 bg-success-500 text-white text-xs font-bold rounded-xl hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
                                onClick={handleInstall}
                            >
                                <Download className="w-3 h-3" />
                                Installer
                            </button>
                        )}
                        <button
                            className="px-4 py-2 bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-white text-xs font-bold rounded-xl border border-[var(--border)] transition-colors flex items-center justify-center"
                            onClick={close}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
                <button
                    className="absolute top-2 right-2 p-1 text-[var(--text-muted)] hover:text-white transition-colors"
                    onClick={close}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
