/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Participant, Language } from '../types';
import {
  CakeIllustration,
  BalloonsIllustration,
  FestiveIllustration,
  GiftIllustration,
  ClockIllustration
} from './SVGIllustrations';
import { InteractiveTicket } from './InteractiveTicket';

// Import canvas-confetti directly from a CDN or trigger standard particles if not fully loaded.
function runConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // confetti is loaded via global windows or fallback gracefully
    const win = window as any;
    if (win.confetti) {
      win.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      win.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    } else {
      // Direct JS fallback explosion
      console.log('Confetti fallback triggered');
    }
  }, 250);
}

const translations = {
  fr: {
    welcomeTitle: "Certains moments deviennent inoubliables lorsqu'ils sont partagés avec des personnes exceptionnelles.",
    welcomeDesc: "Vous êtes chaleureusement invité à découvrir une célébration très spéciale.",
    btnNext: "Suivant",
    btnDiscover: "Découvrir",
    btnParticipate: "Je souhaite participer",
    btnBackHome: "Retourner à l'accueil",
    btnConfirmReg: "Confirmer ma réservation",
    btnDownloadPdf: "Télécharger mon invitation PDF",
    
    invitationTitle: "Une invitation toute particulière",
    invitationDesc: "Josh Right serait honoré de vous compter parmi les invités de cette célébration placée sous le signe de la fraternité, de la joie et du partage.",
    
    detailsTitle: "Détails de la célébration",
    detailsVenueLabel: "Lieu",
    detailsVenueVal: "Hôtel Elisabeth",
    detailsTimeLabel: "Heure",
    detailsTimeVal: "17 h 30 (7 Juillet)",
    detailsFeeLabel: "Participation",
    detailsFeeVal: "5 USD",
    detailsDesc: "Cette contribution permettra de partager ensemble un agréable moment autour d'un repas et de quelques rafraîchissements.",
    
    confirmTitle: "Confirmez votre présence",
    confirmLabelName: "Nom complet",
    confirmLabelRole: "Adresse mail ou numéro WhatsApp",
    confirmCheckboxText: "Je confirme avoir envoyé ma participation de 5 USD via le numéro 0974156933.",
    confirmValidationErr: "Veuillez remplir tous les champs et cocher la case de confirmation financière.",
    
    successTitle: "Votre présence a été enregistrée avec succès.",
    successDesc: "Merci de faire partie de ce moment si précieux. Nous avons hâte de partager cette célébration avec vous.",
    successCountdownPrefix: "Célébration dans :",
    dayStr: "jours",
    hourStr: "heures",
    minuteStr: "minutes",
    secondStr: "secondes"
  },
  en: {
    welcomeTitle: "Some moments become unforgettable when shared with exceptional people.",
    welcomeDesc: "You are warmly invited to discover a very special celebration.",
    btnNext: "Next",
    btnDiscover: "Discover",
    btnParticipate: "I want to participate",
    btnBackHome: "Return to Home",
    btnConfirmReg: "Confirm my reservation",
    btnDownloadPdf: "Download my invitation",
    
    invitationTitle: "A very special invitation",
    invitationDesc: "Josh Right would be honored to count you among the guests of this celebration placed under the sign of brotherhood, joy and sharing.",
    
    detailsTitle: "Details of the celebration",
    detailsVenueLabel: "Venue",
    detailsVenueVal: "Elisabeth Hotel",
    detailsTimeLabel: "Time",
    detailsTimeVal: "5:30 PM (July 7)",
    detailsFeeLabel: "Symbolic fee",
    detailsFeeVal: "5 USD",
    detailsDesc: "This contribution will enable us to share a pleasant moment together around a meal and some refreshments.",
    
    confirmTitle: "Confirm your presence",
    confirmLabelName: "Full name",
    confirmLabelRole: "Email address or WhatsApp number",
    confirmCheckboxText: "I confirm having sent my participation fee of 5 USD to the number 0974156933.",
    confirmValidationErr: "Please fill in all fields and confirm your contribution payment.",
    
    successTitle: "Your presence has been successfully registered.",
    successDesc: "Thank you for being part of this precious moment. We can't wait to share this celebration with you.",
    successCountdownPrefix: "Celebration starting in:",
    dayStr: "days",
    hourStr: "hours",
    minuteStr: "minutes",
    secondStr: "seconds"
  }
};

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<Language>('fr');
  
  // Form values
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [hasPaidCheckbox, setHasPaidCheckbox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Succeeded entry row
  const [savedParticipant, setSavedParticipant] = useState<Participant | null>(null);

  // Auto-detect browser language
  useEffect(() => {
    const userLang = navigator.language || (navigator as any).userLanguage || 'fr';
    if (userLang.startsWith('en')) {
      setLang('en');
    } else {
      setLang('fr');
    }

    // Embed canvas-confetti script into the head dynamically for awesome celebrating confetti!
    const lConfetti = document.createElement('script');
    lConfetti.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    lConfetti.async = true;
    document.head.appendChild(lConfetti);
  }, []);

  // Event Destination Date: Tuesday, July 7, 2026 at 17:30 (Kinshasa local time is similar to UTC+1)
  const targetDate = new Date('2026-07-07T17:30:00').getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Convert milliseconds into days, hours, mins, secs
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const t = translations[lang];

  // Colors based on page step to trigger elegant pastel Dribbble transitions
  const bgColors = [
    'bg-[#F5EFEA]', // Step 1 Cream
    'bg-[#E6D8F2]', // Step 2 Lavender
    'bg-[#F8DDEB]', // Step 3 Rose
    'bg-[#F2EFEF]', // Step 4 Warm grey
    'bg-[#F5EFEA]', // Step 5 Cream
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else if (step === 3) {
      // Transition to confirmation form page
      setStep(4);
    }
  };

  const handleBackHome = () => {
    setStep(1);
    setFullName('');
    setRole('');
    setHasPaidCheckbox(false);
    setSavedParticipant(null);
    setErrorMsg('');
  };

  const handleSubmitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !role.trim() || !hasPaidCheckbox) {
      setErrorMsg(t.confirmValidationErr);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          role,
          hasPaid: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }

      const result = await response.json();
      setSavedParticipant(result.participant);
      setStep(5);
      
      // Delay slightly and execute amazing confetti bursts!
      setTimeout(() => {
        runConfetti();
      }, 150);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while saving your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`transition-all duration-700 min-h-screen ${bgColors[step - 1]} flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 md:px-16 md:py-12 w-full relative`}>
      
      {/* Dynamic Multi-lingual Floating Toast/Badge (Sticky top corner of the screen) */}
      <div className="absolute top-8 right-6 bg-white/40 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold text-gray-700 uppercase tracking-widest z-20 flex items-center gap-1 border border-white/50">
        <span>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
      </div>

      {/* Superior Elegant Header Bar - Glued to the absolute top of the page */}
      <header className="w-full max-w-4xl mx-auto select-none">
        <div className="status-bar h-8 text-black/60 flex justify-between items-center">
          <span className="text-xs font-bold tracking-wider font-mono">EDITION PREMIUM 2026</span>
          <div className="flex items-center gap-1.5 bg-black/5 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-700 font-sans">INVITATION OFFICIELLE</span>
          </div>
        </div>
      </header>

      {/* Content area with smooth transition animations - Perfectly Centered */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 z-10 w-full max-w-4xl mx-auto transition-all duration-500">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-center items-center text-center w-full"
              >
                <div className="illustration-container select-none mb-4">
                  <CakeIllustration />
                </div>

                <div className="content-section max-w-2xl mx-auto">
                  <h1 className="content-title text-gray-950 font-sans font-bold text-2xl sm:text-3xl md:text-4xl leading-tight">
                    {t.welcomeTitle}
                  </h1>
                  <p className="content-description text-gray-700/80 font-sans text-sm sm:text-base mt-4 max-w-xl mx-auto">
                    {t.welcomeDesc}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-center items-center text-center w-full"
              >
                <div className="illustration-container select-none mb-4">
                  <BalloonsIllustration />
                </div>

                <div className="content-section max-w-2xl mx-auto select-text">
                  <h1 className="content-title text-gray-950 font-sans font-bold text-2xl sm:text-3xl md:text-4xl leading-tight">
                    {t.invitationTitle}
                  </h1>
                  <p className="content-description text-gray-700/80 font-sans text-sm sm:text-base mt-4 max-w-xl mx-auto">
                    {t.invitationDesc}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-center items-center text-center w-full"
              >
                <div className="illustration-container select-none mb-4">
                  <FestiveIllustration />
                </div>

                <div className="content-section max-w-2xl mx-auto">
                  <h1 className="content-title text-gray-950 font-sans font-bold text-2xl sm:text-3xl md:text-4xl leading-tight">
                    {t.detailsTitle}
                  </h1>
                  
                  {/* Detailed card structure for venue list parameters */}
                  <div className="my-5 mx-auto max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-5 text-left border border-white/40 space-y-3.5 shadow-sm text-sm font-sans w-full">
                    <div className="flex justify-between items-center border-b border-gray-100/50 pb-2">
                      <span className="font-semibold text-gray-500">{t.detailsVenueLabel}</span>
                      <span className="font-bold text-gray-950 text-right">{t.detailsVenueVal}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100/50 pb-2">
                      <span className="font-semibold text-gray-500">{t.detailsTimeLabel}</span>
                      <span className="font-bold text-brand-violet">{t.detailsTimeVal}</span>
                    </div>
                    <div className="flex justify-between items-center bg-brand-lavender/30 p-2.5 rounded-lg">
                      <span className="font-bold text-brand-violet">{t.detailsFeeLabel}</span>
                      <span className="font-black text-gray-900 bg-white px-2.5 py-1 rounded shadow-sm">{t.detailsFeeVal}</span>
                    </div>
                  </div>

                  <p className="content-description text-gray-700/80 font-sans text-xs sm:text-sm max-w-md mx-auto">
                    {t.detailsDesc}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-center items-center text-center w-full shadow-none"
              >
                <div className="illustration-container select-none !max-h-[160px] mb-3">
                  <GiftIllustration />
                </div>

                <div className="content-section !mb-2 flex bg-transparent flex-col justify-center w-full">
                  <h1 className="content-title text-gray-950 font-sans font-bold text-2xl sm:text-3xl leading-tight mb-4">
                    {t.confirmTitle}
                  </h1>

                  {/* Form fields */}
                  <form onSubmit={handleSubmitRSVP} className="space-y-4 px-1 text-left max-w-md mx-auto w-full text-xs sm:text-sm font-sans">
                    {errorMsg && (
                      <p className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm leading-normal animate-pulse">
                        ⚠️ {errorMsg}
                      </p>
                    )}

                    <div>
                      <label htmlFor="rsvp-fullname" className="block text-gray-600 font-semibold mb-1.5 pl-1">
                        {t.confirmLabelName}
                      </label>
                      <input 
                        id="rsvp-fullname"
                        type="text" 
                        required
                        disabled={submitting}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jean Dupont"
                        className="w-full h-11 px-4 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 focus:border-brand-violet transition-colors text-gray-900 font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="rsvp-role" className="block text-gray-600 font-semibold mb-1.5 pl-1">
                        {t.confirmLabelRole}
                      </label>
                      <input 
                        id="rsvp-role"
                        type="text" 
                        required
                        disabled={submitting}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder={lang === 'fr' ? "ex: alex@example.com ou +243..." : "e.g. alex@example.com or +243..."}
                        className="w-full h-11 px-4 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 focus:border-brand-violet transition-colors text-gray-900 font-medium text-sm"
                      />
                    </div>

                    <div className="pt-1 select-none">
                      <label className="flex items-start gap-3 cursor-pointer leading-tight group">
                        <input 
                          type="checkbox" 
                          disabled={submitting}
                          checked={hasPaidCheckbox}
                          onChange={(e) => setHasPaidCheckbox(e.target.checked)}
                          className="mt-0.5 rounded text-brand-violet focus:ring-brand-violet bg-white border-gray-300 shrink-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11px] sm:text-xs text-gray-700 font-medium group-hover:text-black transition-colors">
                          {t.confirmCheckboxText}
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-base btn-get-started !w-full h-12 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 font-bold transition-all text-sm tracking-wide mt-3 cursor-pointer"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{lang === 'fr' ? 'Traitement...' : 'Processing...'}</span>
                        </div>
                      ) : (
                        <span>{t.btnConfirmReg}</span>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center items-center text-center w-full"
              >
                {/* Visual top indicator with Event live ticking Timer */}
                <div className="text-center pt-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-brand-violet block uppercase mb-1.5 animate-pulse">
                    {t.successCountdownPrefix}
                  </span>
                  
                  {/* Dynamic countdown grids */}
                  <div className="flex items-center justify-center gap-2 text-center text-gray-900 font-sans select-none mb-3">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 min-w-[55px] shadow-sm">
                      <p className="text-xl font-bold tracking-wide text-gray-800 leading-none">{days >= 0 ? days : 0}</p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mt-1.5">{t.dayStr}</p>
                    </div>
                    <div className="text-sm text-brand-violet font-bold animate-pulse">:</div>
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 min-w-[55px] shadow-sm">
                      <p className="text-xl font-bold tracking-wide text-gray-800 leading-none">{hours >= 0 ? hours : 0}</p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mt-1.5">{t.hourStr}</p>
                    </div>
                    <div className="text-sm text-brand-violet font-bold animate-pulse">:</div>
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 min-w-[55px] shadow-sm">
                      <p className="text-xl font-bold tracking-wide text-gray-800 leading-none">{minutes >= 0 ? minutes : 0}</p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mt-1.5">{t.minuteStr}</p>
                    </div>
                    <div className="text-sm text-brand-violet font-bold animate-pulse">:</div>
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 min-w-[55px] shadow-sm">
                      <p className="text-xl font-bold tracking-wide text-rose-500 leading-none">{seconds >= 0 ? seconds : 0}</p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mt-1.5">{t.secondStr}</p>
                    </div>
                  </div>
                </div>

                <div className="illustration-container select-none !max-h-[145px] my-2">
                  <ClockIllustration />
                </div>

                <div className="content-section !mb-1 flex flex-col justify-center items-center w-full">
                  <h1 className="content-title text-gray-950 font-sans font-bold leading-snug text-xl sm:text-2xl px-2">
                    {t.successTitle}
                  </h1>
                  <p className="content-description text-gray-600 font-sans text-xs sm:text-sm mt-1.5 leading-relaxed max-w-md mx-auto">
                    {t.successDesc}
                  </p>

                  {/* Render the ticket directly in place */}
                  {savedParticipant && (
                    <div className="mt-5 flex flex-col items-center w-full">
                      <InteractiveTicket participant={savedParticipant} lang={lang} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Controls & Copyright credits - Glued securely to the bottom of the page */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col items-center select-none pt-4">
        {step < 4 && (
          <div className="flex flex-col items-center w-full">
            {/* Horizontal progress bullet indicators */}
            <div className="pagination-container py-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`dot transition-all duration-300 ${step === i ? 'active !bg-black' : '!bg-gray-400/80'}`}
                />
              ))}
            </div>

            {/* Main Action buttons */}
            <div className="action-container gap-3 pb-3">
              <button
                onClick={handleNext}
                className="btn-base btn-get-started bg-black hover:bg-black/95 text-white shadow-sm flex items-center justify-center gap-1 active:scale-95 text-xs sm:text-sm tracking-wide cursor-pointer"
              >
                <span>{step === 3 ? t.btnParticipate : t.btnNext}</span>
              </button>
            </div>
          </div>
        )}

        {/* Admin Secret portal back home action */}
        {step === 5 && (
          <div className="flex flex-col items-center w-full pb-2">
            <button
              onClick={handleBackHome}
              className="mb-3 text-xs font-bold text-gray-500 hover:text-black cursor-pointer transition-colors underline decoration-dotted underline-offset-4"
            >
              ← {t.btnBackHome}
            </button>
          </div>
        )}

        {/* Decorative Brand footer credit */}
        <div className="mt-4 flex flex-col items-center gap-1.5 text-center select-none">
          <div className="flex items-center gap-1.5 text-black/40 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-brand-violet animate-spin" style={{ animationDuration: '6s' }} />
            <span>Birthday wisher-ticket</span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono">
            © 2026 Celebration Premium Platform. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
