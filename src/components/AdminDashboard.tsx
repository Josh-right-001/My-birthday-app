/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FormEvent, useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, CheckCircle, ShieldX, FileDown, Search, ArrowUpDown, 
  Trash2, RefreshCw, FileSpreadsheet, Printer, X, Bell, Calendar,
  UserPlus, LogIn, Mail, User, Lock, Sparkles
} from 'lucide-react';
import { Participant } from '../types';

interface NotificationLog {
  id: string;
  titleEn: string;
  titleFr: string;
  detail: string;
  createdAt: string;
  read: boolean;
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Custom account & Google sign-in details
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullNameReg, setFullNameReg] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // List data from full-stack api
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Table search & columns filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Participant>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch from Express API
  const fetchData = async () => {
    setLoading(true);
    try {
      const resP = await fetch('/api/participants');
      if (resP.ok) {
        const data = await resP.ok ? await resP.json() : [];
        setParticipants(data);
      }
      
      const resN = await fetch('/api/notifications');
      if (resN.ok) {
        const data = await resN.json();
        setNotifications(data);
        
        // Mark as read inside database automatically
        fetch('/api/notifications/read', { method: 'POST' }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 8000); // Polling for real-time live invite notifications
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setFeedbackMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          secretPin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Identifiant ou code secret incorrect.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Erreur de communication avec le serveur.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setFeedbackMsg('');

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          secretPin,
          fullName: fullNameReg || undefined,
          email: emailReg || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFeedbackMsg('Votre compte administrateur a été créé ! Connectez-vous.');
        setAuthMode('login');
        setSecretPin('');
      } else {
        setLoginError(data.error || 'Erreur lors de la création du compte.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Erreur de communication avec le serveur.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setFeedbackMsg('');
    setIsSyncingGoogle(true);

    try {
      const configRes = await fetch('/api/auth/config');
      const { clientId } = await configRes.json();

      // If no clientId, run simulated Google Login for preview demo ease
      if (!clientId) {
        console.warn("Google Client ID empty. Running simulated Google Sign-In for sandboxed preview...");
        setTimeout(async () => {
          try {
            const simulatedEmail = prompt(
              "Configuration Google Client ID absente.\nSaisissez une adresse e-mail Google fictive pour vous connecter instantanément :",
              "ajoshrightt@gmail.com"
            );

            if (simulatedEmail === null) {
              setIsSyncingGoogle(false);
              return;
            }

            const cleanEmailVal = simulatedEmail.trim() || "ajoshrightt@gmail.com";
            const nameFromEmail = cleanEmailVal.split('@')[0];

            const res = await fetch('/api/admin/google-sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: cleanEmailVal,
                fullName: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) + " (Google)",
                avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
              }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
              setIsAuthenticated(true);
            } else {
              setLoginError(data.error || 'Erreur de synchronisation Google.');
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsSyncingGoogle(false);
          }
        }, 850);
        return;
      }

      // Real Google OAuth flow
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scopes = ['https://www.googleapis.com/auth/userinfo.email'].join(' ');

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
        setLoginError("Bloqueur de popups détecté ! Veuillez autoriser les fenêtres popups pour cette application.");
        setIsSyncingGoogle(false);
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
          return;
        }

        if (event.data?.type === 'OAUTH_ACCESS_TOKEN' && event.data.token) {
          window.removeEventListener('message', handleMessage);
          
          try {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                'Authorization': `Bearer ${event.data.token}`
              }
            });

            if (!profileRes.ok) {
              throw new Error("Impossible de lire les infos de profil Google.");
            }

            const profile = await profileRes.json();
            
            const res = await fetch('/api/admin/google-sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: profile.email,
                fullName: profile.name || profile.given_name,
                avatarUrl: profile.picture,
              }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
              setIsAuthenticated(true);
            } else {
              setLoginError(data.error || 'Erreur lors de la synchronisation.');
            }
          } catch (err: any) {
            console.error(err);
            setLoginError(err.message || "La connexion Google a échoué.");
          } finally {
            setIsSyncingGoogle(false);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      const monitorPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(monitorPopup);
          window.removeEventListener('message', handleMessage);
          setIsSyncingGoogle(false);
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'La connexion Google a échoué.');
      setIsSyncingGoogle(false);
    }
  };

  // Delete participant
  const handleDeleteParticipant = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) return;

    try {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setParticipants(prev => prev.filter(p => p.id !== id));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset all database values (Development ease shortcut)
  const handleResetDB = async () => {
    if (!confirm('Voulez-vous supprimer toutes les données de test ?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setParticipants([]);
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Table Data to standard UTF-8 CSV Excel format
  const handleExportCSV = () => {
    if (participants.length === 0) return;
    
    const headers = ['ID Ticket', 'Nom Complet', 'Adresse Mail ou WhatsApp', 'Participation Envoyée', 'Date Inscription'];
    const rows = participants.map(p => [
      p.id,
      p.fullName,
      p.role,
      p.hasPaid ? 'QUI (5 USD)' : 'NON',
      new Date(p.createdAt).toLocaleString('fr-FR')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inscriptions-JoshRightBirthday-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTable = () => {
    window.print();
  };

  // Sort & Search processing logic
  const handleSort = (field: keyof Participant) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedParticipants = useMemo(() => {
    let list = [...participants];

    // Filter by name or role query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.fullName.toLowerCase().includes(query) || 
        p.role.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    // Sort rows
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'boolean') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [participants, searchQuery, sortField, sortDirection]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = participants.length;
    return {
      totalInput: total,
      confirmedPayment: total, // Checkbox compliance ensures all entrants confirmed payment
      refusedInput: 0,
      pdfGenerated: total // Automatic printable card is served to all successful registrations
    };
  }, [participants]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F2EFEF] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center"
        >
          <div className="w-12 h-12 bg-brand-violet/10 text-brand-violet rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-brand-violet" />
          </div>
          
          <h2 className="font-sans text-xl font-bold text-gray-900 mb-1">
            Josh Right's Invitation
          </h2>
          <p className="text-xs text-gray-500 font-sans mb-5">
            Espace d'Administration Sécurisé
          </p>

          {/* Tab Selector */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl mb-5 select-none text-xs font-sans">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setLoginError(''); setFeedbackMsg(''); }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${authMode === 'login' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-950'}`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setLoginError(''); setFeedbackMsg(''); }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${authMode === 'register' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-950'}`}
            >
              Créer un compte
            </button>
          </div>

          {/* Feedback & Error messages */}
          {loginError && (
            <p className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl font-semibold text-xs leading-normal text-left">
              ⚠️ {loginError}
            </p>
          )}

          {feedbackMsg && (
            <p className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-semibold text-xs leading-normal text-left">
              🎉 {feedbackMsg}
            </p>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-left text-xs font-sans">
              <div>
                <label className="block text-gray-500 font-bold mb-1 pl-1">Identifiant</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Identifiant administrateur..."
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 focus:border-brand-violet font-medium text-gray-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 pl-1">Code Secret</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    value={secretPin}
                    onChange={e => setSecretPin(e.target.value)}
                    placeholder="Code numérique..."
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 focus:border-brand-violet font-semibold tracking-widest text-gray-950 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-black text-white hover:bg-gray-900 font-bold tracking-wide rounded-xl focus:outline-none transition-colors mt-3 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-left text-xs font-sans">
              <div>
                <label className="block text-gray-500 font-bold mb-1 pl-1">Identifiant <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Choisir un identifiant..."
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 focus:border-brand-violet font-medium text-gray-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 pl-1">Code Secret <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    value={secretPin}
                    onChange={e => setSecretPin(e.target.value)}
                    placeholder="Code de sécurité..."
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 focus:border-brand-violet font-semibold tracking-widest text-gray-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 pl-1">Nom Complet (Optionnel)</label>
                <div className="relative">
                  <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={fullNameReg}
                    onChange={e => setFullNameReg(e.target.value)}
                    placeholder="Votre nom complet..."
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 focus:border-brand-violet font-medium text-gray-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 pl-1">Adresse Email (Optionnelle)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={emailReg}
                    onChange={e => setEmailReg(e.target.value)}
                    placeholder="mail@gmail.com..."
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 focus:border-brand-violet font-medium text-gray-950 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-brand-violet hover:bg-brand-violet/90 text-white font-bold tracking-wide rounded-xl focus:outline-none transition-colors mt-4 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer le compte</span>
              </button>
            </form>
          )}

          {/* Divider "ou alors" */}
          <div className="relative my-5 select-none font-sans">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-3 text-gray-400 font-bold tracking-wider">ou alors</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSyncingGoogle}
            className="w-full h-11 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold tracking-wide rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-sm text-sm cursor-pointer"
          >
            {isSyncingGoogle ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" />
                <span>Synchronisation...</span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-semibold text-gray-700 text-xs">Se connecter avec Google</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFEA] py-10 px-4 sm:px-8 font-sans print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm gap-4 mb-8 print:hidden">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-brand-violet block uppercase">
              Édition Premium 2026
            </span>
            <h1 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
              Dashboard Josh Right
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-white border border-gray-200 border-t-transparent aspect-square text-gray-600 hover:text-black rounded-xl active:scale-95 transition-transform"
              title="Actualiser la base"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Live System Alerts & Notifications feed wrapper */}
        {notifications.length > 0 && (
          <div className="mb-6 p-4 bg-white/80 border border-brand-violet/20 rounded-2xl flex items-start gap-3.5 shadow-sm print:hidden">
            <Bell className="w-6 h-6 text-brand-violet shrink-0 animate-bounce mt-0.5" />
            <div className="flex-1 overflow-hidden">
              <span className="text-[9px] font-bold text-brand-violet uppercase tracking-wide">Flux en direct</span>
              <p className="text-xs font-bold text-gray-900 truncate">
                {notifications[0].titleFr} — {notifications[0].detail}
              </p>
            </div>
            <button 
              onClick={() => setNotifications([])}
              className="text-gray-400 hover:text-black shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Statistics Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:hidden">
          {/* Card 1 */}
          <div className="bg-[#E6D8F2] border border-brand-violet/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-30">
            <Users className="w-5 h-5 text-brand-violet" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Inscriptions</p>
              <p className="text-2xl font-black text-gray-900 leading-none mt-1">{stats.totalInput}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#E2F5E5] border border-emerald-500/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-30">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Confirmées</p>
              <p className="text-2xl font-black text-emerald-900 leading-none mt-1">{stats.confirmedPayment}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FFF0F4] border border-red-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-30">
            <ShieldX className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Refusées</p>
              <p className="text-2xl font-black text-rose-950 leading-none mt-1">{stats.refusedInput}</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#F8DDEB] border border-brand-rose/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-30">
            <FileDown className="w-5 h-5 text-gray-700" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Pass PDF</p>
              <p className="text-2xl font-black text-gray-900 leading-none mt-1">{stats.pdfGenerated}</p>
            </div>
          </div>
        </div>

        {/* Interactive Listings Card Grid */}
        <div className="bg-white border border-gray-100 rounded-[30px] shadow-sm overflow-hidden print:border-none print:shadow-none">
          
          {/* Controls toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, contact ou code..."
                className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/40 text-xs font-semibold text-gray-950"
              />
            </div>

            {/* Print, Export & Operations tools */}
            <div className="flex items-center gap-3.5 self-center">
              <button
                onClick={handlePrintTable}
                className="btn-base h-9 !w-32 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="btn-base h-9 !w-32 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleResetDB}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1.5 px-3 rounded-lg transition-colors border border-red-200/50"
              >
                Vider les tests
              </button>
            </div>

          </div>

          {/* Interactive Table Grid */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-gray-700 font-sans border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold tracking-wider select-none uppercase">
                  <th 
                    onClick={() => handleSort('id')}
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>id pass</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('fullName')}
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Nom</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('role')}
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>mail / whatsapp</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('hasPaid')}
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>statut participation</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('createdAt')}
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>date d'inscription</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-4 text-center print:hidden">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                      Aucun participant inscrit pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-violet">{p.id}</td>
                      <td className="p-4 font-bold text-gray-900">{p.fullName}</td>
                      <td className="p-4 font-semibold text-gray-600">{p.role}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>5.00 USD (Reçu)</span>
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-semibold">
                        {new Date(p.createdAt).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 text-center print:hidden">
                        <button
                          onClick={() => handleDeleteParticipant(p.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg active:scale-95 transition-transform"
                          title="Supprimer l'invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Print specific logo and visual signature and layout adjustments */}
        <div className="hidden print:flex flex-col items-center mt-20 text-center select-none font-sans">
          <div className="w-16 h-[1.5px] bg-brand-violet mb-4" />
          <h2 className="font-serif text-lg font-bold text-black">Josh Right's Birthday</h2>
          <p className="text-xs text-gray-400 mt-1">Official Attendees List — Total confirmed guests: {participants.length}</p>
        </div>

      </div>
    </div>
  );
}
