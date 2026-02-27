import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { queueOperation } from '../lib/sync';
import {
    Car,
    Droplets,
    Sparkles,
    Zap,
    CheckCircle,
    Clock,
    Hash,
    ChevronRight,
    Phone,
    User,
    Ticket,
    RefreshCw,
    Star,
    ShieldCheck,
    Award,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('fr-DZ', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ─────────────────────────────────────────────────────────────────────
// Main Kiosk Page
// ─────────────────────────────────────────────────────────────────────

export function Kiosk() {
    const [step, setStep] = useState<'home' | 'form' | 'ticket'>('home');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myTicket, setMyTicket] = useState<{ number: string; position: number; created_at: string; name: string; phone: string; estimatedMinutes: number } | null>(null);
    const [now, setNow] = useState(new Date());

    // Auto-refresh clock
    useEffect(() => {
        const iv = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(iv);
    }, []);

    // Live queue data
    const activeTickets = useLiveQuery(async () => {
        return await db.queue_tickets
            .filter(t => t.status === 'pending' || t.status === 'in_progress')
            .sortBy('created_at');
    }) || [];

    const currentServing = activeTickets.find(t => t.status === 'in_progress');
    const pendingTickets = activeTickets.filter(t => t.status === 'pending');

    // Services
    const services = useLiveQuery(async () => {
        return await db.services.filter(s => s.active !== false).toArray();
    }) || [];

    // Ticket submission
    const handleGetTicket = useCallback(async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            // Find or create a "walk-in" customer
            let customerId: string;
            const existing = await db.customers
                .filter(c => c.phone === (phone || 'KIOSK'))
                .first();

            if (existing) {
                customerId = existing.id;
            } else {
                customerId = crypto.randomUUID();
                await queueOperation('customers', 'INSERT', {
                    id: customerId,
                    full_name: name.trim(),
                    phone: phone.trim() || 'KIOSK',
                    email: null,
                    address: null,
                    credit_limit: 0,
                    current_balance: 0,
                    loyalty_points: 0,
                    notes: 'Client Kiosque',
                    active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
            }

            // Create a pending ticket (without a vehicle — walk-in)
            const ticketId = crypto.randomUUID();
            const ticketNumber = `K${String(pendingTickets.length + (currentServing ? 1 : 0) + 1).padStart(3, '0')}`;

            await queueOperation('queue_tickets', 'INSERT', {
                id: ticketId,
                ticket_number: ticketNumber,
                customer_id: customerId,
                vehicle_id: customerId, // placeholder — same as customer for kiosk
                service_ids: [],
                product_items: [],
                status: 'pending',
                priority: 'normal',
                assigned_employee_id: null,
                subtotal: 0,
                tax_rate: 0,
                tax_amount: 0,
                discount: 0,
                total_amount: 0,
                paid_amount: 0,
                payment_method: null,
                notes: 'Ticket Kiosque',
                internal_notes: null,
                created_at: new Date().toISOString(),
                started_at: null,
                completed_at: null,
                cancelled_at: null,
                cancelled_reason: null,
            });

            const position = pendingTickets.length + 1;
            const estimatedMinutes = pendingTickets.length * 15;
            setMyTicket({ number: ticketNumber, position, created_at: new Date().toISOString(), name: name.trim(), phone: phone.trim(), estimatedMinutes });
            setStep('ticket');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [name, phone, pendingTickets, currentServing]);

    // Service icons map
    const serviceIcons = [Droplets, Sparkles, Zap, Car, ShieldCheck, Star];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white">Centre de Lavage</p>
                            <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-widest">& Vidange Professionnel</p>
                        </div>
                    </div>

                    <div className="text-right hidden sm:block">
                        <p className="text-2xl font-black text-white tabular-nums">
                            {now.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-white/40">
                            {now.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </header>

            {/* ── LIVE MONITOR STRIP ── */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-3 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/90">EN DIRECT</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">En cours</p>
                            <p className="text-2xl font-black text-white">
                                {currentServing ? `#${currentServing.ticket_number}` : '--'}
                            </p>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">En attente</p>
                            <p className="text-2xl font-black text-white">{pendingTickets.length}</p>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Véhicules</p>
                            <p className="text-2xl font-black text-white">{activeTickets.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                        <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                        Mise à jour en temps réel
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-16">

                {/* ── SECTION 1: QUEUE MONITOR ── */}
                <section>
                    <div className="text-center mb-8">
                        <p className="text-xs text-orange-400 font-black uppercase tracking-widest mb-2">File d'attente</p>
                        <h2 className="text-3xl font-black text-white">Moniteur de Queue</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current serving */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 p-8 text-center">
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
                            <p className="text-xs text-orange-400 font-black uppercase tracking-widest mb-4">Servi actuellement</p>
                            <div className="text-7xl font-black text-white mb-2 tabular-nums">
                                {currentServing ? `#${currentServing.ticket_number}` : '--'}
                            </div>
                            {currentServing && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm text-green-400 font-bold">En cours de traitement</span>
                                </div>
                            )}
                            {!currentServing && (
                                <p className="text-sm text-white/40 mt-2">Aucun véhicule en cours</p>
                            )}
                        </div>

                        {/* Queue list */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                            <p className="text-xs text-white/50 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Prochains à être servis
                            </p>
                            {pendingTickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-white/30">
                                    <CheckCircle className="w-10 h-10 mb-2" />
                                    <p className="text-sm font-bold">Aucune attente !</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {pendingTickets.slice(0, 8).map((ticket, i) => (
                                        <div key={ticket.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i === 0
                                                ? 'bg-orange-500/10 border-orange-500/30'
                                                : 'bg-white/3 border-white/5'
                                            }`}>
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50'
                                                }`}>
                                                {i + 1}
                                            </span>
                                            <span className="font-bold text-white text-sm">#{ticket.ticket_number}</span>
                                            <span className="text-xs text-white/40 ml-auto">{formatTime(ticket.created_at)}</span>
                                        </div>
                                    ))}
                                    {pendingTickets.length > 8 && (
                                        <p className="text-xs text-white/30 text-center pt-2">+ {pendingTickets.length - 8} autres</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 2: TICKET DISPENSER ── */}
                <section>
                    <div className="text-center mb-8">
                        <p className="text-xs text-orange-400 font-black uppercase tracking-widest mb-2">File d'attente rapide</p>
                        <h2 className="text-3xl font-black text-white">Prenez votre ticket</h2>
                        <p className="text-white/40 mt-2 text-sm max-w-md mx-auto">
                            Entrez vos informations et obtenez votre numéro d'attente en quelques secondes.
                        </p>
                    </div>

                    {step === 'home' && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setStep('form')}
                                className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xl px-12 py-6 rounded-2xl shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <Ticket className="w-7 h-7" />
                                    <span>Prendre un Ticket</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 space-y-5">
                            <div>
                                <label className="text-xs font-black text-white/60 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Votre Prénom
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Mohamed"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-white/60 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Numéro de Téléphone (Optionnel)
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="05xxxxxxxx"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                                />
                            </div>

                            {/* Estimated wait */}
                            <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                <Clock className="w-5 h-5 text-orange-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-orange-400 uppercase tracking-wider">Attente estimée</p>
                                    <p className="text-white font-bold text-sm">
                                        {pendingTickets.length === 0 ? 'Vous êtes le prochain !' : `Environ ${pendingTickets.length * 15} minutes (${pendingTickets.length} véhicule${pendingTickets.length > 1 ? 's' : ''} avant vous)`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setStep('home')}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:bg-white/5 transition-colors"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={handleGetTicket}
                                    disabled={!name.trim() || isSubmitting}
                                    className="flex-2 flex-grow-[2] py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Ticket className="w-4 h-4" />
                                            Confirmer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'ticket' && myTicket && (
                        <div className="max-w-md mx-auto text-center">
                            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/40 rounded-3xl p-10">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <p className="text-xs text-orange-400 font-black uppercase tracking-[0.3em] mb-3">Ticket confirmé</p>
                                    <div className="text-8xl font-black text-white mb-3 tabular-nums">#{myTicket.number}</div>
                                    <p className="text-white/40 text-sm">
                                        {myTicket.position === 1
                                            ? '🎉 Vous êtes le prochain !'
                                            : `${myTicket.position - 1} véhicule${myTicket.position > 2 ? 's' : ''} avant vous`}
                                    </p>

                                    <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                            <User className="w-4 h-4 text-orange-400" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Client</p>
                                                <p className="text-xs text-white font-semibold">{myTicket.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                            <Phone className="w-4 h-4 text-orange-400" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Téléphone</p>
                                                <p className="text-xs text-white font-semibold">{myTicket.phone || 'Non renseigné'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                            <Clock className="w-4 h-4 text-orange-400" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Heure</p>
                                                <p className="text-xs text-white font-semibold">
                                                    {new Date(myTicket.created_at).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                            <Hash className="w-4 h-4 text-orange-400" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Attente</p>
                                                <p className="text-xs text-white font-semibold">
                                                    {myTicket.estimatedMinutes > 0 ? `~${myTicket.estimatedMinutes} min` : 'Immédiat'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                                        <Hash className="w-3 h-3" />
                                        <span>Surveillez le numéro sur l'écran en haut</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setStep('home'); setMyTicket(null); setName(''); setPhone(''); }}
                                className="mt-6 text-sm text-white/40 hover:text-white/70 transition-colors font-semibold"
                            >
                                Nouveau ticket
                            </button>
                        </div>
                    )}
                </section>

                {/* ── SECTION 3: SERVICES SHOWCASE ── */}
                <section>
                    <div className="text-center mb-10">
                        <p className="text-xs text-orange-400 font-black uppercase tracking-widest mb-2">Ce que nous offrons</p>
                        <h2 className="text-3xl font-black text-white">Nos Services</h2>
                        <p className="text-white/40 mt-2 text-sm">Des prestations professionnelles pour votre véhicule</p>
                    </div>

                    {services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {services.map((service, i) => {
                                const Icon = serviceIcons[i % serviceIcons.length];
                                return (
                                    <div
                                        key={service.id}
                                        className="group relative overflow-hidden bg-white/3 hover:bg-white/6 border border-white/8 hover:border-orange-500/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                                                <Icon className="w-6 h-6 text-orange-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-white text-base">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-white/40 text-xs mt-1 leading-relaxed">{service.description}</p>
                                                )}
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-sm font-black text-orange-400">{service.price.toLocaleString()} DZD</span>
                                                    {service.duration_minutes > 0 && (
                                                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-white/30 font-medium">
                                                            ~{service.duration_minutes} min
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-white/30">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-bold">Les services seront affichés ici</p>
                        </div>
                    )}
                </section>

                {/* ── TRUST BADGES ── */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { icon: ShieldCheck, title: 'Qualité Garantie', desc: 'Produits professionnels certifiés' },
                        { icon: Clock, title: 'Service Rapide', desc: 'Prise en charge dans les meilleurs délais' },
                        { icon: Award, title: 'Expérience', desc: 'Des années de savoir-faire au service de votre véhicule' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-4 p-5 bg-white/3 border border-white/8 rounded-2xl">
                            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Icon className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="font-black text-white text-sm">{title}</p>
                                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-6 px-6 text-center">
                <p className="text-xs text-white/20">
                    © {new Date().getFullYear()} Centre de Lavage & Vidange — Système de file d'attente numérique
                </p>
            </footer>
        </div>
    );
}
