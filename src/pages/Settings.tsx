import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import {
    Settings as SettingsIcon,
    Globe,
    CreditCard,
    Printer,
    Building2,
    Bell,
    Save,
    Moon
} from 'lucide-react';

export function Settings() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000); // Simulate save
    };

    const tabs = [
        { id: 'general', icon: Building2, label: 'Général' },
        { id: 'localization', icon: Globe, label: 'Localisation' },
        { id: 'billing', icon: CreditCard, label: 'Facturation' },
        { id: 'printer', icon: Printer, label: 'Impression' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('navigation.settings')}</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">Configuration du système Lavage Vida</p>
                </div>

                <Button variant="primary" onClick={handleSave} isLoading={isSaving} className="shadow-[var(--shadow-glow-orange)]">
                    <Save className="w-4 h-4 mr-2" />
                    {t('common.save')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <Card className="p-2 border-[var(--border-lg)] bg-[var(--bg-panel)] h-fit">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white border border-transparent'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5 shrink-0" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </Card>

                {/* Content */}
                <div className="md:col-span-3">
                    <Card className="p-6 border-[var(--border-lg)] bg-[var(--bg-panel)] shadow-xl">
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                                    <div className="w-10 h-10 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-xl flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Informations de l'Établissement</h2>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Ces informations apparaîtront sur les reçus de vos clients.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input label="Nom de l'établissement" defaultValue="Lavage Vida" />
                                    <Input label="Numéro de Téléphone" defaultValue="0555 12 34 56" />
                                    <div className="sm:col-span-2">
                                        <Input label="Adresse Complète" defaultValue="Alger, Algérie" />
                                    </div>
                                    <Input label="Numéro de Registre de Commerce (RC)" defaultValue="16/00-0000000A00" />
                                    <Input label="NIF (Numéro d'Identification Fiscale)" defaultValue="000000000000000" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'localization' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                                    <div className="w-10 h-10 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-xl flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Langue et Région</h2>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Préférences régionales et monétaires.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Select
                                        label="Langue de l'interface"
                                        value={i18n.language}
                                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                                        options={[
                                            { value: 'fr', label: 'Français' },
                                            { value: 'ar', label: 'العربية' }
                                        ]}
                                    />
                                    <Select
                                        label="Devise"
                                        value="DZD"
                                        options={[
                                            { value: 'DZD', label: 'Dinar Algérien (DZD)' }
                                        ]}
                                    />
                                    <Select
                                        label="Fuseau Horaire"
                                        value="Africa/Algiers"
                                        options={[
                                            { value: 'Africa/Algiers', label: 'Heure d\'Alger (GMT+1)' }
                                        ]}
                                    />
                                </div>

                                <div className="mt-8 p-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Moon className="w-5 h-5 text-primary-500" />
                                            <div>
                                                <p className="text-sm font-bold text-white">Thème de l'interface</p>
                                                <p className="text-xs text-[var(--text-secondary)]">Le mode sombre (Dark Automotive) est activé par défaut pour réduire la fatigue oculaire et améliorer le confort.</p>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2 py-1 rounded border border-primary-500/20">
                                            Actif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                                    <div className="w-10 h-10 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Facturation et Taxes</h2>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Taux de TVA et paramètres par défaut.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input label="Taux de TVA par défaut (%)" type="number" defaultValue="19" />
                                    <Select
                                        label="Méthode de paiement par défaut"
                                        options={[
                                            { value: 'cash', label: 'Espèces' },
                                            { value: 'card', label: 'Carte Bancaire' },
                                            { value: 'credit', label: 'Crédit (Dette)' }
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'printer' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                                    <div className="w-10 h-10 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-xl flex items-center justify-center">
                                        <Printer className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Matériel et Impression</h2>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Configuration des imprimantes thermiques.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <Select
                                        label="Modèle d'imprimante thermique"
                                        options={[
                                            { value: '80mm', label: 'Imprimante 80mm' },
                                            { value: '58mm', label: 'Imprimante 58mm' }
                                        ]}
                                    />

                                    <div className="flex items-center justify-between p-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Impression automatique</h3>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">Imprimer automatiquement le reçu après un encaissement réussi.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-[var(--bg-panel)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Ouverture du tiroir-caisse</h3>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">Envoyer le signal d'ouverture au tiroir-caisse connecté lors d'un paiement en espèces.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-[var(--bg-panel)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-fade-in relative">
                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                                    <div className="w-10 h-10 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-xl flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Notifications du Système</h2>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Gérez les alertes et les notifications</p>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-6 text-center">
                                    <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                                    <p className="text-white font-bold mb-1">Module de Notifications</p>
                                    <p className="text-sm text-[var(--text-secondary)]">Les paramètres de notifications avancées seront disponibles prochainement.</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
