import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileText, Download, BarChart2, PieChart, Activity } from 'lucide-react';

export function Reports() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('month');
    const [reportType, setReportType] = useState('revenue');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('navigation.reports')}</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">Analyse et exportation des données</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border border-[var(--border-lg)] bg-[var(--bg-panel)] text-white rounded-lg focus:ring-2 focus:ring-primary-500 hover:border-primary-500/50 outline-none transition-colors cursor-pointer"
                    >
                        <option value="today">Aujourd'hui</option>
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois</option>
                        <option value="year">Cette année</option>
                    </select>

                    <Button variant="primary" className="shadow-[var(--shadow-glow-orange)]">
                        <Download className="w-4 h-4 mr-2" />
                        Exporter PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navigation / Types */}
                <div className="lg:col-span-1 space-y-3">
                    <ReportNavButton
                        active={reportType === 'revenue'}
                        onClick={() => setReportType('revenue')}
                        icon={BarChart2}
                        label="Revenus et Ventes"
                    />
                    <ReportNavButton
                        active={reportType === 'services'}
                        onClick={() => setReportType('services')}
                        icon={PieChart}
                        label="Performances des Services"
                    />
                    <ReportNavButton
                        active={reportType === 'employees'}
                        onClick={() => setReportType('employees')}
                        icon={Activity}
                        label="Productivité des Employés"
                    />
                    <ReportNavButton
                        active={reportType === 'inventory'}
                        onClick={() => setReportType('inventory')}
                        icon={FileText}
                        label="Rapport d'Inventaire"
                    />
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <Card className="h-full min-h-[500px] border-[var(--border-lg)] bg-[var(--bg-panel)] flex flex-col items-center justify-center relative overflow-hidden group">
                        {/* Decorative background element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors pointer-events-none"></div>

                        <div className="text-center relative z-10 w-full max-w-sm">
                            <div className="w-20 h-20 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <BarChart2 className="w-10 h-10 text-primary-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Génération de Rapport en Cours</h2>
                            <p className="text-sm text-[var(--text-secondary)] mb-8">
                                Le module de rapports détaillés avec graphiques interactifs sera disponible dans la prochaine mise à jour du système (Phase 10).
                            </p>

                            <div className="space-y-4">
                                <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                                    <div className="h-full bg-primary-500 w-1/3 rounded-full animate-pulse shadow-[var(--shadow-glow-orange)]"></div>
                                </div>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Acquisition des données analytiques...</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ReportNavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${active
                ? 'bg-primary-500/10 border-primary-500/30 shadow-[var(--shadow-glow-orange)]'
                : 'bg-[var(--bg-panel)] border-[var(--border-lg)] hover:border-primary-500/50 hover:bg-[var(--bg-hover)]'
                }`}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-primary-500 text-white' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`font-bold text-sm ${active ? 'text-primary-400' : 'text-white'}`}>{label}</span>
        </button>
    );
}
