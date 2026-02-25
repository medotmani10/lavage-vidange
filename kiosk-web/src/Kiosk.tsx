import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, type Ticket, type Service } from './supabase';
import {
    Car, Droplets, Sparkles, Zap, CheckCircle, Clock, Hash,
    ChevronRight, Phone, User, Ticket as TicketIcon, RefreshCw,
    Star, ShieldCheck, Award,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' });
}

const SERVICE_ICONS = [Droplets, Sparkles, Zap, Car, ShieldCheck, Star];

// ─── Main Kiosk Page ─────────────────────────────────────────────────────────

export function KioskPage() {
    const [step, setStep] = useState<'home' | 'form' | 'ticket'>('home');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myTicket, setMyTicket] = useState<{ number: string; position: number } | null>(null);
    const [now, setNow] = useState(new Date());

    const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    // Clock
    useEffect(() => {
        const iv = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(iv);
    }, []);

    // Load services once
    useEffect(() => {
        supabase
            .from('services')
            .select('*')
            .eq('active', true)
            .order('name')
            .then(({ data }) => { if (data) setServices(data as Service[]); });
    }, []);

    // Real-time queue
    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('queue_tickets')
                .select('id, ticket_number, status, created_at')
                .in('status', ['pending', 'in_progress'])
                .order('created_at');
            if (data) setActiveTickets(data as Ticket[]);
        };

        load();

        const channel = supabase
            .channel('queue-kiosk')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'queue_tickets',
            }, () => load())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const currentServing = activeTickets.find(t => t.status === 'in_progress');
    const pending = activeTickets.filter(t => t.status === 'pending');

    const handleGetTicket = useCallback(async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            // Upsert customer
            let customerId: string;
            const phone_ = phone.trim() || `KIOSK-${Date.now()}`;
            const { data: existing } = await supabase
                .from('customers')
                .select('id')
                .eq('phone', phone_)
                .maybeSingle();

            if (existing) {
                customerId = existing.id;
            } else {
                const { data: newCust } = await supabase
                    .from('customers')
                    .insert({
                        full_name: name.trim(),
                        phone: phone_,
                        credit_limit: 0,
                        current_balance: 0,
                        loyalty_points: 0,
                        notes: 'Client Kiosque',
                    })
                    .select('id')
                    .single();
                customerId = newCust!.id;
            }

            // Generate ticket number
            const ticketNumber = `K${String(pending.length + 1).padStart(3, '0')}`;

            // Insert ticket
            await supabase.from('queue_tickets').insert({
                ticket_number: ticketNumber,
                customer_id: customerId,
                vehicle_id: customerId, // placeholder
                status: 'pending',
                priority: 'normal',
                subtotal: 0,
                tax_rate: 0,
                tax_amount: 0,
                discount: 0,
                total_amount: 0,
                paid_amount: 0,
                notes: 'Ticket Kiosque',
                service_ids: [],
                product_items: [],
            });

            setMyTicket({ number: ticketNumber, position: pending.length + 1 });
            setStep('ticket');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [name, phone, pending]);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'Inter',sans-serif" }}>

            {/* ── HEADER ── */}
            <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px #f9731640' }}>
                            <Car size={20} color="#fff" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 900, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>Centre de Lavage</p>
                            <p style={{ fontSize: 10, color: '#f97316', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>& Vidange Pro</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                            {now.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
                            {now.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </header>

            {/* ── LIVE STRIP ── */}
            <div style={{ background: 'linear-gradient(90deg,#ea580c,#f97316,#f59e0b)', padding: '10px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%' }} className="animate-pulse" />
                        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,.9)', textTransform: 'uppercase' }}>EN DIRECT</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                        {[
                            { label: 'En cours', val: currentServing ? `#${currentServing.ticket_number}` : '--' },
                            { label: 'En attente', val: String(pending.length) },
                            { label: 'Total', val: String(activeTickets.length) },
                        ].map(({ label, val }, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                                <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{val}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>
                        <RefreshCw size={12} className="animate-spin-slow" />
                        Temps réel
                    </div>
                </div>
            </div>

            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 72 }}>

                {/* ── SECTION 1: QUEUE MONITOR ── */}
                <section>
                    <SectionHead sub="File d'attente" title="Moniteur de Queue" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginTop: 32 }}>

                        {/* Current */}
                        <Card style={{ textAlign: 'center', padding: 40, background: 'linear-gradient(135deg,rgba(249,115,22,.15),rgba(249,115,22,.05))', border: '1px solid rgba(249,115,22,.3)' }}>
                            <p style={{ fontSize: 11, color: '#f97316', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Servi actuellement</p>
                            <p style={{ fontSize: 80, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                {currentServing ? `#${currentServing.ticket_number}` : '--'}
                            </p>
                            {currentServing ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                                    <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} className="animate-pulse" />
                                    <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>En cours de traitement</span>
                                </div>
                            ) : (
                                <p style={{ color: 'rgba(255,255,255,.3)', marginTop: 12, fontSize: 13 }}>Aucun véhicule en cours</p>
                            )}
                        </Card>

                        {/* Queue list */}
                        <Card style={{ padding: 24 }}>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={12} /> Prochains
                            </p>
                            {pending.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, color: 'rgba(255,255,255,.2)' }}>
                                    <CheckCircle size={36} style={{ marginBottom: 8 }} />
                                    <p style={{ fontWeight: 700, fontSize: 13 }}>Aucune attente !</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                                    {pending.slice(0, 8).map((t, i) => (
                                        <div key={t.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                            borderRadius: 12,
                                            background: i === 0 ? 'rgba(249,115,22,.12)' : 'rgba(255,255,255,.03)',
                                            border: i === 0 ? '1px solid rgba(249,115,22,.3)' : '1px solid rgba(255,255,255,.05)',
                                        }}>
                                            <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, background: i === 0 ? '#f97316' : 'rgba(255,255,255,.1)', color: i === 0 ? '#fff' : 'rgba(255,255,255,.4)', flexShrink: 0 }}>{i + 1}</span>
                                            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>#{t.ticket_number}</span>
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginLeft: 'auto' }}>{fmt(t.created_at)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </section>

                {/* ── SECTION 2: TICKET DISPENSER ── */}
                <section>
                    <SectionHead sub="Rapide & facile" title="Prenez votre ticket" desc="Entrez vos informations et obtenez votre numéro en quelques secondes." />
                    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>

                        {step === 'home' && (
                            <Btn onClick={() => setStep('form')} big>
                                <TicketIcon size={26} />
                                <span>Prendre un Ticket</span>
                                <ChevronRight size={20} />
                            </Btn>
                        )}

                        {step === 'form' && (
                            <Card style={{ width: '100%', maxWidth: 440, padding: 32 }} className="fade-in">
                                <Field label="Votre Prénom" icon={<User size={13} />}>
                                    <input
                                        type="text" value={name} onChange={e => setName(e.target.value)}
                                        placeholder="Ex: Mohamed"
                                        style={inputStyle}
                                    />
                                </Field>
                                <Field label="Téléphone (Optionnel)" icon={<Phone size={13} />} style={{ marginTop: 16 }}>
                                    <input
                                        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        style={inputStyle}
                                    />
                                </Field>

                                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 14 }}>
                                    <Clock size={18} color="#f97316" style={{ flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: 10, color: '#f97316', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Attente estimée</p>
                                        <p style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginTop: 2 }}>
                                            {pending.length === 0 ? 'Vous êtes le prochain !' : `~${pending.length * 15} min (${pending.length} véh. avant vous)`}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                    <button onClick={() => setStep('home')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'rgba(255,255,255,.5)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                        Retour
                                    </button>
                                    <button
                                        onClick={handleGetTicket}
                                        disabled={!name.trim() || isSubmitting}
                                        style={{ flex: 2, padding: '12px', borderRadius: 12, background: 'linear-gradient(90deg,#f97316,#f59e0b)', color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!name.trim() || isSubmitting) ? .5 : 1 }}
                                    >
                                        {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <><TicketIcon size={16} /> Confirmer</>}
                                    </button>
                                </div>
                            </Card>
                        )}

                        {step === 'ticket' && myTicket && (
                            <Card style={{ width: '100%', maxWidth: 400, padding: 48, textAlign: 'center', background: 'linear-gradient(135deg,rgba(249,115,22,.18),rgba(245,158,11,.06))', border: '1px solid rgba(249,115,22,.4)' }} className="fade-in">
                                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <CheckCircle size={30} color="#4ade80" />
                                </div>
                                <p style={{ fontSize: 11, color: '#f97316', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>Votre ticket</p>
                                <p style={{ fontSize: 96, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>#{myTicket.number}</p>
                                <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 14, marginTop: 16 }}>
                                    {myTicket.position === 1 ? '🎉 Vous êtes le prochain !' : `${myTicket.position - 1} véhicule(s) avant vous`}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: 'rgba(255,255,255,.3)', fontSize: 12 }}>
                                    <Hash size={12} />
                                    <span>Surveillez le numéro sur l'écran du moniteur</span>
                                </div>
                                <button onClick={() => { setStep('home'); setMyTicket(null); setName(''); setPhone(''); }} style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                    Nouveau ticket
                                </button>
                            </Card>
                        )}
                    </div>
                </section>

                {/* ── SECTION 3: SERVICES ── */}
                <section>
                    <SectionHead sub="Ce que nous offrons" title="Nos Services" desc="Des prestations professionnelles pour votre véhicule" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginTop: 32 }}>
                        {services.map((s, i) => {
                            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                            return (
                                <Card key={s.id} style={{ padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16, transition: 'transform .2s,border-color .2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,.3)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}
                                >
                                    <div style={{ width: 48, height: 48, background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={22} color="#f97316" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 900, color: '#fff', fontSize: 15 }}>{s.name}</p>
                                        {s.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4, lineHeight: 1.5 }}>{s.description}</p>}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                                            <span style={{ fontWeight: 900, color: '#f97316', fontSize: 16 }}>{s.price.toLocaleString()} DZD</span>
                                            {s.duration_minutes > 0 && (
                                                <span style={{ fontSize: 11, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', padding: '3px 8px', borderRadius: 8, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>~{s.duration_minutes} min</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* ── TRUST BADGES ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                    {[
                        { icon: ShieldCheck, title: 'Qualité Garantie', desc: 'Produits professionnels certifiés' },
                        { icon: Clock, title: 'Service Rapide', desc: 'Prise en charge immédiate' },
                        { icon: Award, title: 'Expérience', desc: 'Des années de savoir-faire' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <Card key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 20 }}>
                            <div style={{ width: 46, height: 46, background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={22} color="#f97316" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 900, fontSize: 14, color: '#fff' }}>{title}</p>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '20px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
                    © {new Date().getFullYear()} Centre de Lavage & Vidange — Système de file d'attente numérique
                </p>
            </footer>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHead({ sub, title, desc }: { sub: string; title: string; desc?: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#f97316', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{sub}</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{title}</h2>
            {desc && <p style={{ color: 'rgba(255,255,255,.35)', marginTop: 8, fontSize: 14 }}>{desc}</p>}
        </div>
    );
}

function Card({ children, style, className, onMouseEnter, onMouseLeave }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onMouseEnter?: React.MouseEventHandler; onMouseLeave?: React.MouseEventHandler }) {
    return (
        <div
            className={className}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, ...style }}
        >
            {children}
        </div>
    );
}

function Btn({ children, onClick, big }: { children: React.ReactNode; onClick?: () => void; big?: boolean }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'linear-gradient(135deg,#f97316,#f59e0b)',
                color: '#fff', fontWeight: 900,
                fontSize: big ? 20 : 14,
                padding: big ? '20px 44px' : '12px 24px',
                borderRadius: big ? 20 : 12,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 40px rgba(249,115,22,.4)',
                transition: 'transform .2s,box-shadow .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04) translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
        >
            {children}
        </button>
    );
}

function Field({ label, icon, children, style }: { label: string; icon?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={style}>
            <label style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {icon}{label}
            </label>
            {children}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 14, fontWeight: 500,
    outline: 'none', fontFamily: 'inherit',
};
