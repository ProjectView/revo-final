
import React, { useState, useEffect, useRef } from 'react';
import {
  HardHat, CheckSquare, Calendar, BarChart3, Users, MapPin, Shield, Smartphone,
  ArrowRight, ChevronDown, Star, Zap, Clock, Eye, FileText, Bell,
  ChevronRight, Menu, X, Play, TrendingUp, Target, Layers, Lock,
  Building2, Wrench, ClipboardCheck, LayoutDashboard, GripVertical
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

// ─── Animated counter hook ───
const useCountUp = (target: number, duration: number = 2000, startOnView: boolean = true) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

// ─── Fade-in on scroll component ───
const FadeInSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const stat1 = useCountUp(500, 2000);
  const stat2 = useCountUp(98, 2000);
  const stat3 = useCountUp(12000, 2500);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─── FEATURES DATA ───
  const features = [
    {
      icon: <HardHat size={28} />,
      title: 'Gestion de chantier complète',
      desc: 'Centralisez chaque chantier avec son budget, ses dates, son équipe et ses documents. Vue liste, Kanban ou carte pour un suivi de projets adapté à votre méthode de travail.',
      color: 'from-emerald-500 to-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      icon: <CheckSquare size={28} />,
      title: 'Checklist qualité intégrée',
      desc: 'Créez vos modèles de checklist par type d\'installation : électricité, peinture, sécurité. Suivez la progression en temps réel avec identification des points critiques.',
      color: 'from-blue-500 to-blue-700',
      bg: 'bg-blue-50',
    },
    {
      icon: <Calendar size={28} />,
      title: 'Calendrier & planification',
      desc: 'Planifiez vos projets et prestations sur un calendrier interactif. Déplacez vos chantiers par glisser-déposer, ajustez les durées visuellement. Zéro conflit de planning.',
      color: 'from-violet-500 to-violet-700',
      bg: 'bg-violet-50',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Pipeline commerciale',
      desc: 'Suivez chaque opportunité de la prise de contact à la signature. Visualisez votre pipeline de projets, convertissez les leads en chantier en un clic.',
      color: 'from-amber-500 to-amber-700',
      bg: 'bg-amber-50',
    },
    {
      icon: <Users size={28} />,
      title: 'Gestion d\'équipe & rôles',
      desc: 'Attribuez des rôles sur mesure : conducteur de travaux, technicien, sous-traitant. Chaque membre ne voit que les chantiers qui le concernent.',
      color: 'from-rose-500 to-rose-700',
      bg: 'bg-rose-50',
    },
    {
      icon: <Smartphone size={28} />,
      title: 'Application mobile (PWA)',
      desc: 'Installez REVO comme une application native sur votre téléphone. Accédez à vos chantiers même hors connexion, directement sur le terrain.',
      color: 'from-cyan-500 to-cyan-700',
      bg: 'bg-cyan-50',
    },
  ];

  // ─── BENEFITS DATA ───
  const benefits = [
    { icon: <Clock size={22} />, title: 'Gagnez 5h par semaine', desc: 'Plus de fichiers Excel, plus de WhatsApp éparpillés. Tout le suivi de vos projets en un seul endroit.' },
    { icon: <Eye size={22} />, title: 'Visibilité totale', desc: 'Tableau de bord en temps réel : nombre de chantiers actifs, budget pipeline, planning de la semaine.' },
    { icon: <Shield size={22} />, title: 'Conformité assurée', desc: 'Checklist de sécurité, traçabilité des actions, habilitations nucléaire/chimie/électrique suivies automatiquement.' },
    { icon: <Bell size={22} />, title: 'Notifications intelligentes', desc: 'Votre équipe est notifiée automatiquement à chaque changement de statut, assignation ou mise à jour de chantier.' },
    { icon: <FileText size={22} />, title: 'Documents centralisés', desc: 'Photos, plans, devis, factures : tous les documents de vos projets au même endroit, liés au bon chantier.' },
    { icon: <MapPin size={22} />, title: 'Vue cartographique', desc: 'Visualisez tous vos chantiers sur une carte interactive. Idéal pour le suivi multi-sites et l\'optimisation des déplacements.' },
  ];

  // ─── FAQ DATA (SEO optimized) ───
  const faqItems = [
    {
      q: 'Comment REVO facilite le suivi de chantier au quotidien ?',
      a: 'REVO centralise toutes les informations de chaque chantier : planning, budget, checklist qualité, documents et équipe assignée. Grâce au tableau de bord en temps réel, vous avez une vue d\'ensemble instantanée de tous vos projets en cours. Les notifications automatiques garantissent que rien n\'échappe à votre suivi.',
    },
    {
      q: 'Puis-je gérer mes checklist d\'installation directement sur le terrain ?',
      a: 'Oui. REVO fonctionne comme une application mobile installable (PWA). Vos techniciens peuvent cocher les éléments de leur checklist directement depuis leur smartphone sur le chantier, même sans connexion internet. Les données se synchronisent automatiquement dès le retour en ligne.',
    },
    {
      q: 'Comment fonctionne le suivi des projets et de la pipeline commerciale ?',
      a: 'La pipeline commerciale REVO est un tableau Kanban personnalisable. Chaque lead passe par vos étapes (prise de contact, devis envoyé, négociation, signé). Quand un prospect devient client, vous convertissez le lead en chantier ou prestation en un clic. Le suivi du budget pipeline est automatique.',
    },
    {
      q: 'REVO est-il adapté aux sous-traitants et entreprises multi-sites ?',
      a: 'Absolument. Le rôle "Utilisateur Externe" permet d\'inviter vos sous-traitants en leur donnant accès uniquement aux chantiers qui les concernent. Pour les entreprises multi-sites, la vue carte et le calendrier multi-projets offrent un suivi global de tous vos chantiers simultanés.',
    },
    {
      q: 'Quelles sont les fonctionnalités de checklist et contrôle qualité ?',
      a: 'Créez des modèles de checklist réutilisables par type d\'installation (électricité, peinture, sécurité). Chaque élément peut être marqué comme critique. La progression est calculée automatiquement en pourcentage, et le système enregistre qui a validé chaque point, avec horodatage.',
    },
  ];

  // ─── PRICING DATA ───
  const plans = [
    {
      name: 'Artisan Solo',
      tagline: 'Pour débuter',
      price: 0,
      period: '',
      features: ['3 clients', '5 chantiers', '1 utilisateur', 'Support email', 'Checklist de base'],
      cta: 'Commencer gratuitement',
      popular: false,
      color: 'border-slate-200',
    },
    {
      name: 'Chantier Pro',
      tagline: 'Pour grandir',
      price: 50,
      period: '/mois',
      features: ['Clients illimités', 'Chantiers illimités', '3 utilisateurs', 'Support prioritaire', 'Pipeline personnalisée', 'Toutes les checklist'],
      cta: 'Essayer Chantier Pro',
      popular: true,
      color: 'border-emerald-500',
    },
    {
      name: 'Multi-Sites Premium',
      tagline: 'Pour les équipes',
      price: 150,
      period: '/mois',
      features: ['Tout illimité', 'Utilisateurs illimités', 'Support premium 24/7', 'Rôles personnalisés', 'Statuts sur-mesure', 'Habilitations & conformité'],
      cta: 'Passer Premium',
      popular: false,
      color: 'border-slate-200',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════ */}
      {/* NAVBAR */}
      {/* ════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-900/20">
                R
              </div>
              <span className="text-xl font-black tracking-tight">REVO</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Fonctionnalités</button>
              <button onClick={() => scrollToSection('benefits')} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Avantages</button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Tarifs</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">FAQ</button>
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={onGoToLogin}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={onGoToLogin}
                className="bg-emerald-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
              >
                Démarrer gratuitement
              </button>
            </div>

            {/* Mobile burger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-2xl animate-fade-in">
            <div className="px-6 py-6 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-sm font-semibold text-slate-600 py-2">Fonctionnalités</button>
              <button onClick={() => scrollToSection('benefits')} className="block w-full text-left text-sm font-semibold text-slate-600 py-2">Avantages</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-sm font-semibold text-slate-600 py-2">Tarifs</button>
              <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-sm font-semibold text-slate-600 py-2">FAQ</button>
              <hr className="border-slate-100" />
              <button onClick={onGoToLogin} className="block w-full text-left text-sm font-bold text-slate-700 py-2">Se connecter</button>
              <button onClick={onGoToLogin} className="w-full bg-emerald-900 text-white py-3 rounded-xl text-sm font-bold">
                Démarrer gratuitement
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 lg:pt-44 pb-20 lg:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Plateforme BTP nouvelle génération</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Le suivi de vos{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">chantiers</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 lg:h-4 bg-emerald-200/50 -z-0 rounded-full"></span>
              </span>
              {' '}n'a jamais été aussi simple
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Gérez vos <strong className="text-slate-700">projets</strong>, planifiez vos <strong className="text-slate-700">installations</strong>,
              validez vos <strong className="text-slate-700">checklist</strong> qualité et assurez le <strong className="text-slate-700">suivi</strong> de
              chaque chantier depuis une seule plateforme.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={onGoToLogin}
                className="group w-full sm:w-auto bg-emerald-900 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider shadow-2xl shadow-emerald-900/30 hover:bg-emerald-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Démarrer gratuitement
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="group w-full sm:w-auto bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
              >
                <Play size={18} className="text-emerald-600" />
                Voir la démo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}
                <span className="ml-2 font-semibold">4.9/5</span>
              </div>
              <span className="hidden sm:block">|</span>
              <span className="font-semibold">Adopté par <strong className="text-slate-600">+500 entreprises BTP</strong></span>
              <span className="hidden sm:block">|</span>
              <span className="font-semibold">Gratuit, sans carte bancaire</span>
            </div>
          </div>

          {/* ─── Hero Visual: App Preview ─── */}
          <div className="mt-16 lg:mt-24 relative max-w-5xl mx-auto" id="demo">
            <div className="absolute -inset-4 bg-gradient-to-b from-emerald-200/20 to-transparent rounded-[3rem] blur-2xl"></div>
            <div className="relative bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-900/40 border border-slate-700/50 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-6 py-4 bg-slate-800/80 border-b border-slate-700/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-xs text-slate-400 font-mono">app.revo-btp.fr</div>
                </div>
              </div>
              {/* App Preview Content */}
              <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Mini Dashboard Preview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Chantiers actifs', value: '12', icon: <HardHat size={18} />, c: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Projets pipeline', value: '8', icon: <TrendingUp size={18} />, c: 'text-blue-600 bg-blue-50' },
                    { label: 'Checklist validées', value: '94%', icon: <CheckSquare size={18} />, c: 'text-violet-600 bg-violet-50' },
                    { label: 'Équipe terrain', value: '24', icon: <Users size={18} />, c: 'text-amber-600 bg-amber-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.c}`}>{stat.icon}</div>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {/* Mini Kanban Preview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['Nouveau', 'En cours', 'En révision', 'Terminé'].map((status, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">{status}</div>
                      {[0, 1].map((j) => (
                        <div key={j} className={`bg-white rounded-xl p-3 shadow-sm border border-slate-100 ${j === 1 && i > 1 ? 'opacity-40' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${['bg-blue-500','bg-orange-500','bg-purple-500','bg-emerald-500'][i]}`}></div>
                            <span className="text-[11px] font-bold text-slate-700 truncate">
                              {['Rénovation Bureau', 'Install. Élec.', 'Peinture T3', 'Chantier Lyon', 'Salle de bain', 'Cuisine Pro', 'Extension', 'Terrasse'][i * 2 + j]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${['bg-blue-500','bg-orange-500','bg-purple-500','bg-emerald-500'][i]}`} style={{width: `${[30,65,80,100][i]}%`}}></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{[30,65,80,100][i]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TRUSTED BY / STATS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div ref={stat1.ref}>
              <div className="text-4xl lg:text-5xl font-black text-emerald-900">{stat1.count}+</div>
              <div className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">Entreprises BTP utilisent REVO</div>
            </div>
            <div ref={stat2.ref}>
              <div className="text-4xl lg:text-5xl font-black text-emerald-900">{stat2.count}%</div>
              <div className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">Taux de satisfaction client</div>
            </div>
            <div ref={stat3.ref}>
              <div className="text-4xl lg:text-5xl font-black text-emerald-900">{stat3.count.toLocaleString('fr-FR')}+</div>
              <div className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">Chantiers suivis sur la plateforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* FEATURES SECTION */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
                <Layers size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Fonctionnalités</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
                Tout ce qu'il faut pour piloter vos <span className="text-emerald-700">projets</span> BTP
              </h2>
              <p className="text-lg text-slate-500">
                De la prospection au suivi de chantier, REVO couvre l'ensemble du cycle de vie de vos projets d'installation et de construction.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <div className={`bg-gradient-to-br ${f.color} bg-clip-text text-transparent`}>
                      {React.cloneElement(f.icon, { className: `text-current` })}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-6">
                <Target size={14} className="text-violet-600" />
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Comment ça marche</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
                Opérationnel en <span className="text-emerald-700">3 minutes</span>
              </h2>
              <p className="text-lg text-slate-500">
                Pas de formation, pas de configuration complexe. Créez votre compte et commencez le suivi de vos chantiers immédiatement.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: <Building2 size={28} />,
                title: 'Créez votre espace',
                desc: 'Inscrivez votre société, invitez vos collaborateurs et personnalisez vos statuts de chantier en quelques clics.',
              },
              {
                step: '02',
                icon: <HardHat size={28} />,
                title: 'Ajoutez vos chantiers',
                desc: 'Créez vos projets avec budget, dates, checklist d\'installation et assignez votre équipe terrain sur chaque chantier.',
              },
              {
                step: '03',
                icon: <LayoutDashboard size={28} />,
                title: 'Pilotez en temps réel',
                desc: 'Suivez l\'avancement de vos projets, validez vos checklist qualité et gérez tout depuis votre tableau de bord.',
              },
            ].map((s, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="relative text-center lg:text-left">
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-12 left-[calc(100%_-_1rem)] w-[calc(100%_-_4rem)] h-[2px] bg-gradient-to-r from-emerald-300 to-emerald-100 z-0"></div>
                  )}
                  <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-lg border border-slate-100 mb-6">
                    <div className="text-emerald-700">{s.icon}</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-white text-xs font-black">{s.step}</div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* BENEFITS SECTION */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section id="benefits" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <FadeInSection>
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
                  <TrendingUp size={14} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Avantages</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
                  Pourquoi les pros du BTP choisissent <span className="text-emerald-700">REVO</span>
                </h2>
                <p className="text-lg text-slate-500 mb-10">
                  Fini les tableaux Excel, les photos perdues et les groupes WhatsApp interminables.
                  REVO centralise le suivi de vos projets de chantier dans un outil conçu pour le terrain.
                </p>
                <button
                  onClick={onGoToLogin}
                  className="group bg-emerald-900 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-[0.98] inline-flex items-center gap-3"
                >
                  Essayer REVO maintenant
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </FadeInSection>

            {/* Right: Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <FadeInSection key={i} delay={i * 80}>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3">
                      {b.icon}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">{b.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* CHECKLIST SHOWCASE (SEO-rich section) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-32 bg-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Checklist visual */}
            <FadeInSection>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardCheck size={24} className="text-emerald-300" />
                  <h4 className="text-white font-black text-lg">Checklist : Installation Électrique</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Vérification du tableau de répartition', critical: true, checked: true },
                    { label: 'Test de continuité de la terre', critical: true, checked: true },
                    { label: 'Vérification de l\'étiquetage des circuits', critical: false, checked: true },
                    { label: 'Conformité des prises et interrupteurs', critical: false, checked: true },
                    { label: 'Test différentiel 30mA', critical: true, checked: false },
                    { label: 'Fixation des appareillages', critical: false, checked: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.checked ? 'bg-emerald-400/10' : 'bg-white/5'}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${item.checked ? 'bg-emerald-400 border-emerald-400' : 'border-white/30'}`}>
                        {item.checked && <span className="text-white text-xs font-black">&#10003;</span>}
                      </div>
                      <span className={`text-sm ${item.checked ? 'text-white/80 line-through' : 'text-white font-semibold'}`}>{item.label}</span>
                      {item.critical && <span className="ml-auto text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase">Critique</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{width: '66%'}}></div>
                  </div>
                  <span className="text-sm font-black text-emerald-300">66%</span>
                </div>
              </div>
            </FadeInSection>

            {/* Right: Text */}
            <FadeInSection delay={200}>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
                  <CheckSquare size={14} className="text-emerald-300" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Contrôle Qualité</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-6 text-white">
                  Des checklist sur mesure pour chaque type d'installation
                </h2>
                <p className="text-lg text-emerald-200/70 mb-8 leading-relaxed">
                  Électricité, peinture, plomberie, sécurité... Créez vos modèles de checklist une fois,
                  appliquez-les sur tous vos chantiers. Chaque point critique est identifié, chaque validation
                  est horodatée. Le suivi qualité de vos projets d'installation devient automatique.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Modèles de checklist réutilisables',
                    'Points critiques signalés visuellement',
                    'Progression en % sur chaque chantier',
                    'Traçabilité complète (qui, quand)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                        <span className="text-emerald-400 text-xs">&#10003;</span>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGoToLogin}
                  className="group bg-white text-emerald-900 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl hover:bg-emerald-50 transition-all active:scale-[0.98] inline-flex items-center gap-3"
                >
                  Créer ma première checklist
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
                Ils gèrent leurs <span className="text-emerald-700">chantiers</span> avec REVO
              </h2>
              <p className="text-lg text-slate-500">
                Des artisans aux entreprises multi-sites, découvrez comment REVO transforme le suivi de leurs projets au quotidien.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Depuis que j\'utilise REVO, le suivi de mes chantiers est devenu un jeu d\'enfant. Les checklist d\'installation me font gagner un temps fou sur le contrôle qualité.',
                name: 'Marc Delattre',
                role: 'Électricien indépendant',
                initials: 'MD',
                color: 'bg-blue-500',
              },
              {
                quote: 'La pipeline commerciale et le calendrier sont parfaits pour nos 15 projets simultanés. On ne perd plus aucune opportunité et le suivi budgétaire est impeccable.',
                name: 'Sophie Girard',
                role: 'Directrice, BG Construction',
                initials: 'SG',
                color: 'bg-emerald-500',
              },
              {
                quote: 'L\'application mobile est un game-changer. Mes techniciens remplissent les checklist directement sur le chantier. Le suivi en temps réel a transformé notre organisation.',
                name: 'Thomas Renaud',
                role: 'Conducteur de travaux',
                initials: 'TR',
                color: 'bg-violet-500',
              },
            ].map((t, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-xs font-black`}>{t.initials}</div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* PRICING SECTION */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
                <Zap size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tarifs transparents</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
                Un plan adapté à chaque <span className="text-emerald-700">chantier</span>
              </h2>
              <p className="text-lg text-slate-500">
                Commencez gratuitement. Évoluez à votre rythme. Pas d'engagement, pas de surprise.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className={`relative bg-white rounded-3xl p-8 border-2 ${plan.color} hover:shadow-xl transition-all h-full flex flex-col ${plan.popular ? 'shadow-xl scale-[1.02]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                      Le plus populaire
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{plan.tagline}</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{plan.name}</div>
                  </div>
                  <div className="mb-8">
                    <span className="text-5xl font-black text-slate-900">{plan.price === 0 ? 'Gratuit' : `${plan.price}\u00A0\u20AC`}</span>
                    {plan.period && <span className="text-sm text-slate-400 font-bold"> HT{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <span className="text-emerald-600 text-xs">&#10003;</span>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onGoToLogin}
                    className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all active:scale-[0.98] ${
                      plan.popular
                        ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* FAQ SECTION (SEO-rich) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
                Questions fréquentes
              </h2>
              <p className="text-lg text-slate-500">
                Tout ce que vous devez savoir sur le suivi de chantier et la gestion de projets avec REVO.
              </p>
            </div>
          </FadeInSection>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FadeInSection key={i} delay={i * 50}>
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-sm font-bold text-slate-900 pr-4">{item.q}</span>
                    <ChevronDown size={20} className={`text-slate-400 shrink-0 transition-transform duration-300 ${activeAccordion === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === i ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                    <p className="px-6 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInSection>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-6">
              Prêt à révolutionner le suivi de vos chantiers ?
            </h2>
            <p className="text-lg text-emerald-200/70 mb-10 max-w-2xl mx-auto">
              Rejoignez les +500 entreprises BTP qui utilisent REVO pour gérer leurs projets,
              leurs checklist d'installation et le suivi de leurs équipes terrain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGoToLogin}
                className="group w-full sm:w-auto bg-white text-emerald-900 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-wider shadow-2xl hover:bg-emerald-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Créer mon compte gratuit
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto bg-white/10 text-white px-10 py-5 rounded-2xl text-sm font-bold border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                Se connecter
              </button>
            </div>
            <p className="text-sm text-emerald-300/50 mt-6 font-semibold">Gratuit. Sans carte bancaire. Configuration en 3 minutes.</p>
          </FadeInSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* FOOTER (SEO-rich) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg">R</div>
                <span className="text-xl font-black text-white">REVO</span>
              </div>
              <p className="text-sm leading-relaxed">
                La plateforme de suivi de chantier et gestion de projets BTP conçue pour les professionnels du bâtiment.
              </p>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Gestion de chantier</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Checklist qualité</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Suivi de projets</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Planification d'installation</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Tarifs</button></li>
              </ul>
            </div>

            {/* Col 3: Use cases */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Cas d'usage</h4>
              <ul className="space-y-2 text-sm">
                <li><span>Suivi de chantier BTP</span></li>
                <li><span>Gestion de projets multi-sites</span></li>
                <li><span>Checklist d'installation</span></li>
                <li><span>Pipeline commerciale BTP</span></li>
                <li><span>Suivi d'équipe terrain</span></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><span>Mentions légales</span></li>
                <li><span>Politique de confidentialité</span></li>
                <li><span>CGU</span></li>
                <li><span>Contact</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} REVO - Logiciel de suivi de chantier et gestion de projets BTP. Tous droits réservés.
            </p>
            <p className="text-xs text-slate-600">
              Chantier &bull; Projets &bull; Suivi &bull; Installation &bull; Checklist
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
