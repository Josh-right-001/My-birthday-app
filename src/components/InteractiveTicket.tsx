/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Award, CreditCard, Download, Printer, Mail, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { Participant, Language } from '../types';

interface InteractiveTicketProps {
  participant: Participant;
  lang: Language;
}

export function InteractiveTicket({ participant, lang }: InteractiveTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [googleSyncStatus, setGoogleSyncStatus] = useState<'idle' | 'connecting' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // Auto-trigger synchronisation if we want, or do it on-demand
  const buildRawEmail = (to: string, subject: string, htmlBody: string) => {
    const MailHeaders = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: =?utf-8?B?${btoa(encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}?=`,
      '',
      htmlBody
    ].join('\r\n');

    // Base64URL encoding safely
    return btoa(encodeURIComponent(MailHeaders).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const performSyncOperations = async (token: string) => {
    try {
      // 1. Get Google user profile
      setSyncMessage(lang === 'fr' ? "Récupération de votre compte Gmail..." : "Retrieving your Gmail account...");
      let targetEmail = participant.role.includes('@') ? participant.role : '';

      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.email) {
            targetEmail = profile.email;
            setGoogleEmail(profile.email);
          }
        }
      } catch (e) {
        console.warn("Could not fetch user profile", e);
      }

      if (!targetEmail) {
        // Fallback to role if they entered their email in role
        targetEmail = participant.role;
      }

      // 2. CREATE EVENT IN GOOGLE CALENDAR
      setSyncMessage(lang === 'fr' ? "Ajout à l'agenda Google Calendar..." : "Adding to Google Calendar...");
      const calendarPayload = {
        summary: lang === 'fr' ? "🎂 Anniversaire de Josh Right — Célébration" : "🎂 Josh Right's Birthday Celebration",
        location: "Hôtel Elisabeth, Kinshasa",
        description: lang === 'fr'
          ? `Félicitations !\nVotre réservation est confirmée.\n\nTicket ID : ${participant.id}\nLieu : Hôtel Elisabeth, Kinshasa\nDate : Mardi 7 Juillet 2026 à 17h30\nContribution validée : 5 USD.\nUne copie a été envoyée sur votre boîte Gmail.`
          : `Congratulations!\nYour reservation is confirmed.\n\nTicket ID: ${participant.id}\nVenue: Elisabeth Hotel, Kinshasa\nDate: Tuesday, July 7, 2026 at 5:30 PM\nContribution status: 5 USD (Paid)\nA copy of this ticket has been dispatched to your Gmail.`,
        start: {
          dateTime: "2026-07-07T17:30:00+01:00",
          timeZone: "Africa/Kinshasa"
        },
        end: {
          dateTime: "2026-07-07T22:30:00+01:00",
          timeZone: "Africa/Kinshasa"
        },
        reminders: {
          useDefault: true
        }
      };

      const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarPayload)
      });

      if (!calRes.ok) {
        const text = await calRes.text();
        console.error("Calendar insertion error", text);
      }

      // 3. SEND EMAIL VIA GMAIL API
      setSyncMessage(lang === 'fr' ? "Envoi de l'invitation par Gmail..." : "Sending official ticket copy via Gmail...");
      
      const emailSubject = lang === 'fr' 
        ? `🎂 Votre Ticket Officiel — Anniversaire de Josh Right [${participant.id}]` 
        : `🎂 Your Official Ticket — Josh Right's Birthday [${participant.id}]`;

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #EFEBE7;">
          <div style="background-color: #8353E2; padding: 35px 20px; text-align: center; color: #ffffff;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.25em; margin: 0 0 8px 0; opacity: 0.85;">Invitation Officielle Confirmée</p>
            <h1 style="font-size: 26px; margin: 0 0 5px 0; font-weight: 700;">Anniversaire de Josh Right</h1>
            <p style="font-style: italic; font-size: 14px; margin: 0; opacity: 0.8;">Célébration d'Anniversaire Unique</p>
          </div>
          
          <div style="padding: 35px 30px; color: #1C1C1E; text-align: center;">
            <p style="font-size: 16px; margin: 0 0 10px 0;">Bonjour <strong>${participant.fullName}</strong>,</p>
            <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 30px 0;">
              Votre présence à la célébration d'anniversaire de Josh Right a été confirmée avec succès. Retrouvez ci-dessous les détails officiels de votre accès.
            </p>
            
            <div style="background-color: #F9F6F3; border: 1px solid #EFEBE7; border-radius: 16px; padding: 20px; text-align: left; margin: 0 0 30px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #EFEBE7;">
                  <td style="padding: 10px 0; color: #8E8E93; font-size: 11px; font-weight: bold; text-transform: uppercase;">CODE D'ACCÈS</td>
                  <td style="padding: 10px 0; text-align: right; color: #8353E2; font-family: monospace; font-size: 14px; font-weight: bold;">${participant.id}</td>
                </tr>
                <tr style="border-bottom: 1px solid #EFEBE7;">
                  <td style="padding: 10px 0; color: #8E8E93; font-size: 11px; font-weight: bold; text-transform: uppercase;">DATE & HEURE</td>
                  <td style="padding: 10px 0; text-align: right; color: #1C1C1E; font-size: 13px; font-weight: 600;">Mardi 7 Juillet 2026 à 17h30</td>
                </tr>
                <tr style="border-bottom: 1px solid #EFEBE7;">
                  <td style="padding: 10px 0; color: #8E8E93; font-size: 11px; font-weight: bold; text-transform: uppercase;">LIEU DES FESTIVITÉS</td>
                  <td style="padding: 10px 0; text-align: right; color: #1C1C1E; font-size: 13px; font-weight: 600;">Hôtel Elisabeth, Kinshasa</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #8E8E93; font-size: 11px; font-weight: bold; text-transform: uppercase;">CONTRIBUTION</td>
                  <td style="padding: 10px 0; text-align: right; color: #10B981; font-size: 13px; font-weight: bold;">5.00 USD (Payé &amp; Validé)</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 12px; color: #8E8E93; line-height: 1.5; margin: 0;">
              Veuillez conserver précieusement cet e-mail officiel ou votre billet pass numérique. Il vous sera demandé à l'entrée pour les contrôles de sécurité.
            </p>
          </div>
          
          <div style="background-color: #F9F6F3; padding: 20px; text-align: center; border-top: 1px solid #EFEBE7; font-size: 10px; color: #8E8E93; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
            © 2026 Comité d'Organisation - Josh Right Birthday
          </div>
        </div>
      `;

      const rawEmail = buildRawEmail(targetEmail, emailSubject, emailHtml);
      const emailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawEmail })
      });

      if (!emailRes.ok) {
        const text = await emailRes.text();
        console.error("Gmail sending error", text);
        throw new Error(lang === 'fr' ? "Erreur lors de l'envoi du mail via Gmail." : "Error dispatching Gmail message.");
      }

      setGoogleSyncStatus('success');
      setSyncMessage(targetEmail);

    } catch (err: any) {
      console.error(err);
      setGoogleSyncStatus('error');
      setSyncMessage(err.message || (lang === 'fr' ? 'Échec des opérations Google.' : 'Google actions failed.'));
    }
  };

  const handleGoogleSync = async () => {
    setGoogleSyncStatus('connecting');
    setSyncMessage(lang === 'fr' ? 'Connexion à votre compte Google en cours...' : 'Connecting to your Google Account...');

    try {
      const configRes = await fetch('/api/auth/config');
      const { clientId } = await configRes.json();

      if (!clientId) {
        setGoogleSyncStatus('error');
        setSyncMessage(
          lang === 'fr'
            ? "Erreur : Client ID Google absent. Veuillez l'ajouter aux variables d'environnement de l'AI Studio."
            : "Error: Google Client ID is missing inside the environment variables."
        );
        return;
      }

      const redirectUri = `${window.location.origin}/auth/callback`;
      const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: scopes,
        prompt: 'consent'
      }).toString();

      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        setGoogleSyncStatus('error');
        setSyncMessage(
          lang === 'fr'
            ? "Bloqueur de popups détecté ! Veuillez autoriser les fenêtres popups pour cette application."
            : "Popup blocker detected! Please allow popups to continue Google authorization."
        );
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
          return;
        }

        if (event.data?.type === 'OAUTH_ACCESS_TOKEN' && event.data.token) {
          window.removeEventListener('message', handleMessage);
          setGoogleSyncStatus('syncing');
          setSyncMessage(lang === 'fr' ? 'Interactions sécurisées...' : 'Establishing safe links...');
          await performSyncOperations(event.data.token);
        }
      };

      window.addEventListener('message', handleMessage);

      const monitorPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(monitorPopup);
          setGoogleSyncStatus(prev => {
            if (prev === 'connecting') {
              setSyncMessage(lang === 'fr' ? "Fermé avant l'autorisation." : "Closed before authorization completes.");
              return 'idle';
            }
            return prev;
          });
        }
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setGoogleSyncStatus('error');
      setSyncMessage(err.message || 'Initialization failed.');
    }
  };

  // Formatting date of generation
  const generationDate = new Date(participant.createdAt).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=333333&bgcolor=F5EFEA&data=${encodeURIComponent(
    `TICKET:${participant.id}|NAME:${participant.fullName}|EXP:Hôtel Elisabeth`
  )}`;

  // Function to download the ticket card as an image using HTML Canvas
  const handleDownload = () => {
    if (!ticketRef.current) return;
    setDownloading(true);

    // Create high-resolution Canvas representation or fall back to high-res SVG export
    // Since complex HTML-to-image plugins can be unstable in sandboxed iframes,
    // we generate a beautiful, clean, customized vector SVG/PNG printable download
    // and trigger it instantly, or use a simplified render canvas.
    // Let's create an elegant printable flow, and also use standard iframe-safe download mechanics.
    try {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&amp;family=Playfair+Display:ital,wght@0,700;1,400&amp;display=swap');
            .title { font-family: 'Playfair Display', serif; font-weight: bold; }
            .sans { font-family: 'Plus Jakarta Sans', sans-serif; }
            .muted { fill: #8E8E93; }
            .accent { fill: #B57EDC; }
            .text { fill: #1C1C1E; }
          </style>
          
          <!-- Gradient background -->
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F5EFEA" />
              <stop offset="50%" stop-color="#F2EFEF" />
              <stop offset="100%" stop-color="#EBC4DC" />
            </linearGradient>
            <clipPath id="qrClip">
              <rect x="225" y="660" width="150" height="150" rx="12" />
            </clipPath>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#bg)" />
          
          <!-- Outer Premium Border -->
          <rect x="20" y="20" width="560" height="860" rx="20" fill="none" stroke="#B57EDC" stroke-width="2" stroke-dasharray="10 5" opacity="0.4" />
          
          <!-- Ticket Header Ornament -->
          <circle cx="300" cy="70" r="30" fill="#B57EDC" opacity="0.1" />
          <text x="300" y="75" font-size="20" text-anchor="middle" fill="#B57EDC" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold">★</text>
          
          <text x="300" y="130" font-size="14" class="sans" font-weight="800" text-anchor="middle" letter-spacing="4" fill="#B57EDC">PREMIUM INVITATION</text>
          
          <!-- Celebration Headline -->
          <text x="300" y="190" font-size="34" class="title" text-anchor="middle" fill="#000000">Josh Right's Birthday</text>
          <text x="300" y="222" font-size="16" class="title" font-style="italic" text-anchor="middle" fill="#8E8E93">Célébration d'Anniversaire Unique</text>
          
          <!-- Fine Ticket Divider Line -->
          <line x1="60" y1="260" x2="540" y2="260" stroke="#EFEBE7" stroke-width="2" />
          
          <!-- Participant Name Header -->
          <text x="300" y="300" font-size="13" class="sans" font-weight="600" text-anchor="middle" fill="#8E8E93" letter-spacing="2">INVITÉ PARTICIPANT</text>
          <text x="300" y="340" font-size="28" class="sans" font-weight="800" text-anchor="middle" fill="#000000">${participant.fullName.toUpperCase()}</text>
          <text x="300" y="370" font-size="15" class="sans" font-weight="600" text-anchor="middle" fill="#B57EDC">${participant.role}</text>
          
          <!-- Divider -->
          <line x1="60" y1="410" x2="540" y2="410" stroke="#EFEBE7" stroke-width="2" />
          
          <!-- Event details -->
          <g transform="translate(60, 440)">
            <!-- Venue -->
            <rect x="0" y="0" width="480" height="44" rx="10" fill="#EFEBE7" opacity="0.4" />
            <text x="15" y="26" font-size="13" class="sans" font-weight="700" fill="#8E8E93">${lang === 'fr' ? 'LIEU' : 'VENUE'}:</text>
            <text x="140" y="26" font-size="14" class="sans" font-weight="700" fill="#000000">Hôtel Elisabeth, Kinshasa</text>
            
            <!-- DateTime -->
            <rect x="0" y="60" width="480" height="44" rx="10" fill="#EFEBE7" opacity="0.4" />
            <text x="15" y="86" font-size="13" class="sans" font-weight="700" fill="#8E8E93">${lang === 'fr' ? 'HEURE' : 'TIME'}:</text>
            <text x="140" y="86" font-size="14" class="sans" font-weight="700" fill="#000000">17 h 30 / 5:30 PM (7 Juillet)</text>
            
            <!-- Pass Symbol -->
            <rect x="0" y="120" width="480" height="44" rx="10" fill="#E6D8F2" />
            <text x="15" y="146" font-size="13" class="sans" font-weight="700" fill="#B57EDC">${lang === 'fr' ? 'CONTRIBUTION' : 'PASS FEE'}:</text>
            <text x="140" y="146" font-size="14" class="sans" font-weight="700" fill="#000000">5 USD (${lang === 'fr' ? 'Confirmé' : 'Confirmed'})</text>
          </g>
          
          <!-- Dotted Perforation Line for stub -->
          <line x1="40" y1="630" x2="560" y2="630" stroke="#8E8E93" stroke-width="2" stroke-dasharray="8 8" opacity="0.5" />
          
          <!-- Stub Area -->
          <text x="300" y="652" font-size="11" class="sans" font-weight="600" text-anchor="middle" fill="#8E8E93" letter-spacing="1">QR CODE ACCÈS UNIQUE</text>
          
          <!-- QR Code Embed via API (Image source) -->
          <image href="${qrUrl}" x="225" y="660" width="150" height="150" clip-path="url(#qrClip)" />
          
          <!-- Footer Branding & Details -->
          <text x="300" y="840" font-size="12" class="sans" font-weight="700" text-anchor="middle" fill="#B57EDC">${participant.id}</text>
          <text x="300" y="855" font-size="10" class="sans" text-anchor="middle" fill="#8E8E93">${lang === 'fr' ? 'Généré le' : 'Issued on'} ${generationDate}</text>
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ticket-Celebration-JoshRight-${participant.fullName.replace(/\s+/g, '-')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Printable Ticket container */}
      <div 
        id="invitation-ticket"
        ref={ticketRef} 
        className="w-full max-w-[340px] bg-brand-cream border border-brand-violet/20 rounded-[24px] shadow-xl overflow-hidden print:shadow-none print:border-none relative flex flex-col justify-between"
        style={{ minHeight: '520px' }}
      >
        {/* Ticket Header Stub Cuts (Decorative left and right circles on fold) */}
        <div className="absolute left-[-10px] bottom-[110px] w-5 h-5 rounded-full bg-brand-canvas border-r border-brand-violet/10 z-10 hidden sm:block" />
        <div className="absolute right-[-10px] bottom-[110px] w-5 h-5 rounded-full bg-brand-canvas border-l border-brand-violet/10 z-10 hidden sm:block" />

        {/* Top visual accent */}
        <div className="bg-gradient-to-r from-brand-violet/10 via-brand-rose/40 to-brand-violet/10 py-5 px-6 text-center border-b border-dashed border-gray-200">
          <span className="inline-block text-xs font-bold tracking-[0.2em] text-brand-violet uppercase mb-1">
            ★ Premium Invitation ★
          </span>
          <h2 className="font-sans text-2xl font-bold text-gray-900 leading-tight">
            Josh Right's Birthday
          </h2>
          <p className="text-xs text-brand-violet font-medium font-sans">
            {lang === 'fr' ? "Célébration d'Anniversaire Unique" : "Unique Birthday Celebration"}
          </p>
        </div>

        {/* Ticket Body Content */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1">
            {lang === 'fr' ? 'NOM DE L\'INVITÉ' : 'GUEST NAME'}
          </span>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-snug px-2 mb-2">
            {participant.fullName}
          </h3>
          <span className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-0.5">
            {lang === 'fr' ? 'CONTACT (MAIL / WHATSAPP)' : 'CONTACT (EMAIL / WHATSAPP)'}
          </span>
          <p className="text-xs text-brand-violet font-semibold mb-5 bg-brand-lavender/40 px-3 py-1 rounded-xl max-w-full truncate">
            {participant.role}
          </p>

          <div className="w-full space-y-3 text-left bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            {/* Venue info */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-violet mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase leading-none">
                  {lang === 'fr' ? 'LIEU' : 'VENUE'}
                </p>
                <p className="text-xs font-semibold text-gray-800">
                  Hôtel Elisabeth
                </p>
              </div>
            </div>

            {/* Date time info */}
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand-violet mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase leading-none">
                  {lang === 'fr' ? 'HEURE' : 'TIME'}
                </p>
                <p className="text-xs font-semibold text-gray-800">
                  17 h 30 / 5:30 PM (7 Juillet)
                </p>
              </div>
            </div>

            {/* Price Token */}
            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase leading-none">
                  {lang === 'fr' ? 'PARTICIPATION' : 'CONTRIBUTION'}
                </p>
                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  5 USD <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">{lang === 'fr' ? 'SÉCURISÉ' : 'CONFIRMED'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated divider lines */}
        <div className="w-full flex items-center justify-between px-1 bg-brand-cream">
          <div className="border-t border-dashed border-gray-300 flex-1 h-[1px]" />
          <span className="text-[9px] font-mono tracking-wider text-gray-400 mx-3 uppercase select-none">
            {lang === 'fr' ? 'DÉCHIRER LE PAS' : 'TEAR OFF ENTRY'}
          </span>
          <div className="border-t border-dashed border-gray-300 flex-1 h-[1px]" />
        </div>

        {/* Stub Area containing the scannable QR Code */}
        <div className="p-5 text-center bg-gray-50/70 flex flex-col items-center">
          <div className="w-24 h-24 bg-white p-1.5 rounded-xl shadow-inner border border-brand-violet/10 flex items-center justify-center mb-2">
            <img 
              src={qrUrl} 
              alt="Access QR Code" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-mono text-[10px] font-semibold text-brand-violet tracking-wider">
            {participant.id}
          </p>
          <p className="text-[9px] text-gray-400 mt-1">
            {lang === 'fr' ? 'Généré le' : 'Issued on'} {new Date(participant.createdAt).toLocaleDateString(lang === 'fr' ? 'fr' : 'en')}
          </p>
        </div>
      </div>

      {/* Google Integration & Smart Synchronisation Widget */}
      <div className="w-full max-w-[340px] mt-6 bg-white border border-brand-violet/20 p-5 rounded-2xl flex flex-col items-center gap-3.5 shadow-sm print:hidden">
        {googleSyncStatus === 'idle' && (
          <>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-violet uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{lang === 'fr' ? "RECEVOIR MON ACCÈS GOOGLE" : "SYNC GOOGLE INVITED ACCESS"}</span>
            </div>
            
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              {lang === 'fr' 
                ? "Connectez votre compte Google pour recevoir instantanément votre invitation officielle sur Gmail et ajouter l'anniversaire à votre agenda." 
                : "Synchronize your Google Account to instantly receive your official ticket via Gmail and register the official event inside your Google Calendar."}
            </p>

            <button
              onClick={handleGoogleSync}
              className="w-full h-10 bg-brand-violet hover:bg-brand-violet-dark text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>{lang === 'fr' ? "S’enregistrer avec Google" : "Sign In with Google"}</span>
            </button>
            
            <div className="w-full flex items-center justify-between text-[9px] text-gray-400 mt-1 uppercase font-semibold">
              <span className="h-[1px] bg-gray-100 flex-1"></span>
              <span className="mx-2">{lang === 'fr' ? "ou ajouts classiques" : "or classic options"}</span>
              <span className="h-[1px] bg-gray-100 flex-1"></span>
            </div>

            <div className="flex gap-2 w-full">
              {/* Fallback Google Link */}
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                  lang === 'fr' ? "🎂 Anniversaire de Josh Right — Célébration (L'Hôtel Elisabeth)" : "🎂 Josh Right's Birthday Celebration"
                )}&dates=20260707T163000Z/20260707T213000Z&details=${encodeURIComponent(
                  lang === 'fr' 
                    ? `Félicitations ! Votre réservation est confirmée.\nTicket ID : ${participant.id}\nLieu : Hôtel Elisabeth, Kinshasa\nDate : Mardi 7 Juillet 2026 à 17h30\nContribution validée : 5 USD.\nUne confirmation a été envoyée à : ${participant.role}`
                    : `Congratulations! Your reservation is confirmed.\nTicket ID: ${participant.id}\nVenue: Elisabeth Hotel, Kinshasa\nDate: Tuesday, July 7, 2026 at 5:30 PM\nContribution paid: 5 USD.\nA confirmation message has been sent to: ${participant.role}`
                )}&location=${encodeURIComponent("Hôtel Elisabeth, Kinshasa")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-9 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center flex items-center justify-center"
              >
                <span>📅 Google Manual</span>
              </a>

              {/* Direct dynamic standard .ICS block */}
              <button
                onClick={() => {
                  const fileContent = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'PRODID:-//Josh Right Birthday//NONSGML v1.0//EN',
                    'BEGIN:VEVENT',
                    'UID:' + participant.id + '@joshright',
                    'DTSTAMP:20260615T120000Z',
                    'DTSTART:20260707T163000Z',
                    'DTEND:20260707T213000Z',
                    'SUMMARY:' + (lang === 'fr' ? "Anniversaire de Josh Right" : "Josh Right's Birthday"),
                    'DESCRIPTION:' + (lang === 'fr' ? "Ticket ID : " + participant.id + " | Participation: 5 USD. Envoyé à " + participant.role : "Ticket ID: " + participant.id + " | RSVP: 5 USD. Sent to " + participant.role),
                    'LOCATION:Hôtel Elisabeth\, Kinshasa',
                    'END:VEVENT',
                    'END:VCALENDAR'
                  ].join('\r\n');

                  const blob = new Blob([fileContent], { type: 'text/calendar;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Celebration-Josh-Right-${participant.id}.ics`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 h-9 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🗓️ Apple / Outlook</span>
              </button>
            </div>
          </>
        )}

        {/* LOADING & SYNCING VIEWS */}
        {(googleSyncStatus === 'connecting' || googleSyncStatus === 'syncing') && (
          <div className="flex flex-col items-center justify-center py-4 w-full text-center">
            <div className="w-8 h-8 rounded-full border-3 border-brand-violet/20 border-t-brand-violet animate-spin mb-3"></div>
            <p className="text-[11px] font-bold text-gray-800 text-center animate-pulse">{syncMessage}</p>
            <p className="text-[9px] text-gray-400 mt-1 text-center font-semibold">
              {lang === 'fr' ? "Intégrations Google Workspace en cours d'exécution..." : "Executing Workspace calls..."}
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {googleSyncStatus === 'success' && (
          <div className="flex flex-col items-center justify-center py-2 w-full text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            
            <h4 className="text-[12px] font-bold text-gray-800">
              {lang === 'fr' ? "Synchronisation Réussie !" : "Synchronized Successfully!"}
            </h4>
            
            <p className="text-[10px] text-gray-500 mt-1 max-w-[280px]">
              {lang === 'fr'
                ? `Le ticket a été envoyé à ${syncMessage || googleEmail || participant.role} et l’agenda de votre calendrier a été configuré pour le 7 Juillet 2026.`
                : `The ticket was sent to ${syncMessage || googleEmail || participant.role} and your Google Calendar was populated for July 7, 2026.`}
            </p>
            
            <button
              onClick={() => setGoogleSyncStatus('idle')}
              className="mt-3.5 text-[9px] font-semibold text-brand-violet hover:underline cursor-pointer"
            >
              {lang === 'fr' ? "Recommencer la synchronisation" : "Repeat synchronization"}
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {googleSyncStatus === 'error' && (
          <div className="flex flex-col items-center justify-center py-2 w-full text-center text-rose-600">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-3 border border-rose-100">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            
            <h4 className="text-[12px] font-bold text-gray-900">
              {lang === 'fr' ? "Une erreur est survenue" : "An error occurred"}
            </h4>
            
            <p className="text-[10px] text-rose-600 bg-rose-50/50 p-2.5 rounded-xl mt-1.5 max-w-[280px] font-mono leading-tight">
              {syncMessage}
            </p>
            
            <button
              onClick={handleGoogleSync}
              className="mt-3.5 h-8 px-4 bg-gray-900 hover:bg-black text-white text-[10px] font-bold rounded-lg transition-transform active:scale-95 cursor-pointer"
            >
              {lang === 'fr' ? "Réessayer la connexion" : "Retry Connection"}
            </button>
          </div>
        )}
      </div>

      {/* Invitation Action Buttons */}
      <div className="flex gap-4 mt-6 select-none print:hidden">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-base btn-skip flex items-center justify-center gap-2 text-xs !w-40 border border-brand-violet/30 active:scale-95 transition-transform"
        >
          <Download className="w-3.5 h-3.5 text-brand-violet" />
          <span>{downloading ? (lang === 'fr' ? 'Téléchargement...' : 'Generating...') : (lang === 'fr' ? 'Télécharger (.SVG)' : 'Download (.SVG)')}</span>
        </button>

        <button
          onClick={handlePrint}
          className="btn-base btn-get-started flex items-center justify-center gap-2 text-xs !w-40 active:scale-95 transition-transform"
        >
          <Printer className="w-3.5 h-3.5 text-white" />
          <span>{lang === 'fr' ? 'Imprimer PDF' : 'Print PDF'}</span>
        </button>
      </div>
    </div>
  );
}
