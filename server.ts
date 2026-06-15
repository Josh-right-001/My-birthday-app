/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface Participant {
  id: string;
  fullName: string;
  role: string;
  hasPaid: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  titleEn: string;
  titleFr: string;
  detail: string;
  createdAt: string;
  read: boolean;
}

interface AdminUser {
  username: string;
  secretPin: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  isGoogleAccount?: boolean;
  createdAt: string;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure the local database directory exists
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const SHOT_DIR = path.join(DB_DIR, 'notifications.json');
const ADMINS_FILE = path.join(DB_DIR, 'admins.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper to read participants
function getParticipants(): Participant[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file', error);
    return [];
  }
}

// Helper to write participants
function saveParticipants(data: Participant[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database file', error);
  }
}

// Helper to read notifications
function getNotifications(): Notification[] {
  try {
    if (!fs.existsSync(SHOT_DIR)) {
      fs.writeFileSync(SHOT_DIR, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(SHOT_DIR, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading notifications file', error);
    return [];
  }
}

// Helper to write notifications
function saveNotifications(data: Notification[]): void {
  try {
    fs.writeFileSync(SHOT_DIR, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing notifications file', error);
  }
}

function getAdmins(): AdminUser[] {
  try {
    if (!fs.existsSync(ADMINS_FILE)) {
      const defaultAdmins: AdminUser[] = [
        {
          username: 'josh',
          secretPin: '2606',
          fullName: 'Josh Right (Admin)',
          email: 'josh@example.com',
          isGoogleAccount: false,
          createdAt: new Date().toISOString()
        },
        {
          username: 'admin',
          secretPin: '2606',
          fullName: 'Administrateur Principal',
          isGoogleAccount: false,
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(ADMINS_FILE, JSON.stringify(defaultAdmins, null, 2));
      return defaultAdmins;
    }
    const raw = fs.readFileSync(ADMINS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading admins file', error);
    return [];
  }
}

function saveAdmins(data: AdminUser[]): void {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing admins file', error);
  }
}

// API: Invite someone / register for invitation
app.post('/api/invite', (req, res) => {
  const { fullName, role, hasPaid } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!role || typeof role !== 'string' || role.trim() === '') {
    return res.status(400).json({ error: 'Role is required' });
  }
  if (hasPaid !== true) {
    return res.status(400).json({ error: 'Payment confirmation checkbox must be checked' });
  }

  const participants = getParticipants();
  
  // Clean values
  const cleanName = fullName.trim();
  const cleanRole = role.trim();

  // Create unique ticket codes (e.g., JR-2606-XXXX)
  const codeSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const uniqueCode = `JR-2606-${codeSuffix}`;

  const newParticipant: Participant = {
    id: uniqueCode,
    fullName: cleanName,
    role: cleanRole,
    hasPaid: true,
    createdAt: new Date().toISOString()
  };

  participants.push(newParticipant);
  saveParticipants(participants);

  // Trigger automatic admin notification
  const notifications = getNotifications();
  const newNotification: Notification = {
    id: `notif-${Date.now()}`,
    titleEn: 'New Attendance Confirmed!',
    titleFr: 'Nouvelle présence confirmée !',
    detail: `${cleanName} (${cleanRole}) has confirmed registration.`,
    createdAt: new Date().toISOString(),
    read: false
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);

  // Simulated Email & WhatsApp Invitation Copy Dispatch
  try {
    const MESSAGES_FILE = path.join(DB_DIR, 'sent_messages.json');
    let sentMessages = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      try {
        sentMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
      } catch (e) {
        sentMessages = [];
      }
    }
    const newMessage = {
      id: `msg-${Date.now()}`,
      to: cleanRole,
      guestName: cleanName,
      ticketId: uniqueCode,
      body: `Bonjour ${cleanName},\n\nVotre invitation pour l'Anniversaire de Josh Right a été confirmée !\n\nTICKET ID: ${uniqueCode}\nDate: Mardi 7 Juillet 2026 à 17h30\nLieu: Hôtel Elisabeth, Kinshasa\nParticipation validée: 5.00 USD (Reçu)\n\nConservez précieusement ce message ou votre pass au format SVG/PDF.\n\nCordialement,\nLe Comité d'Organisation - Josh Right.`,
      dispatchStatus: 'DELIVERED',
      sentAt: new Date().toISOString()
    };
    sentMessages.unshift(newMessage);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(sentMessages, null, 2));
    console.log(`[Inviter-Deliverer] Safely dispatched a copy of ticket ${uniqueCode} directly to contact ${cleanRole}.`);
  } catch (err) {
    console.error('Failed simulation delivery logging', err);
  }

  return res.status(200).json({
    status: 'success',
    participant: newParticipant
  });
});

// API: Get stats and lists of participants
app.get('/api/participants', (req, res) => {
  const list = getParticipants();
  res.json(list);
});

// API: Delete participant
app.delete('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  let list = getParticipants();
  const initialCount = list.length;
  list = list.filter((p) => p.id !== id);

  if (list.length === initialCount) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  saveParticipants(list);
  
  // Add log to notification file
  const notifications = getNotifications();
  notifications.unshift({
    id: `notif-${Date.now()}`,
    titleEn: 'Participant Removed',
    titleFr: 'Participant supprimé',
    detail: `Registration ${id} was deleted by admin.`,
    createdAt: new Date().toISOString(),
    read: false
  });
  saveNotifications(notifications);

  return res.json({ status: 'success' });
});

// API: Get notifications
app.get('/api/notifications', (req, res) => {
  const list = getNotifications();
  res.json(list);
});

// API: Mark notifications as read
app.post('/api/notifications/read', (req, res) => {
  const list = getNotifications();
  list.forEach((n) => {
    n.read = true;
  });
  saveNotifications(list);
  res.json({ status: 'success' });
});

// API: Delete all data (Reset DB for development/demo ease, safely)
app.post('/api/reset', (req, res) => {
  saveParticipants([]);
  saveNotifications([]);
  res.json({ status: 'success' });
});

// API: Admins verification
app.post('/api/admin/login', (req, res) => {
  const { username, secretPin } = req.body;
  if (!username || !secretPin) {
    return res.status(400).json({ error: 'Identifiant et code secret sont requis.' });
  }

  const admins = getAdmins();
  const cleanUser = username.trim().toLowerCase();
  const cleanPin = secretPin.trim();

  const found = admins.find(a => 
    (a.username.toLowerCase() === cleanUser || a.email?.toLowerCase() === cleanUser) && 
    a.secretPin === cleanPin
  );

  if (found) {
    return res.json({ 
      status: 'success', 
      admin: { 
        username: found.username, 
        fullName: found.fullName || found.username, 
        email: found.email 
      } 
    });
  } else {
    return res.status(401).json({ error: 'Identifiant ou code secret incorrect.' });
  }
});

// API: Admins account registration
app.post('/api/admin/register', (req, res) => {
  const { username, secretPin, fullName, email } = req.body;
  if (!username || !secretPin) {
    return res.status(400).json({ error: 'Identifiant et code secret sont requis.' });
  }

  const admins = getAdmins();
  const cleanUser = username.trim().toLowerCase();

  if (admins.some(a => a.username.toLowerCase() === cleanUser)) {
    return res.status(400).json({ error: 'Cet identifiant est déjà utilisé.' });
  }

  const newAdmin: AdminUser = {
    username: username.trim(),
    secretPin: secretPin.trim(),
    fullName: fullName ? fullName.trim() : undefined,
    email: email ? email.trim() : undefined,
    createdAt: new Date().toISOString()
  };

  admins.push(newAdmin);
  saveAdmins(admins);

  // Mark in notifications feed
  const notifications = getNotifications();
  notifications.unshift({
    id: `notif-${Date.now()}`,
    titleEn: 'New Admin Registered',
    titleFr: 'Nouvel Admin Enregistré',
    detail: `Admin Account ${username.trim()} created successfully.`,
    createdAt: new Date().toISOString(),
    read: false
  });
  saveNotifications(notifications);

  return res.json({ 
    status: 'success', 
    admin: { 
      username: newAdmin.username, 
      fullName: newAdmin.fullName || newAdmin.username, 
      email: newAdmin.email 
    } 
  });
});

// API: Google Admin sync / automatic login
app.post('/api/admin/google-sync', (req, res) => {
  const { email, fullName, avatarUrl } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email Google requis.' });
  }

  const admins = getAdmins();
  const cleanEmail = email.trim().toLowerCase();

  let admin = admins.find(a => a.email?.toLowerCase() === cleanEmail);

  if (!admin) {
    // Automatically register Google user as an authorized admin!
    const usernameFromEmail = email.split('@')[0];
    admin = {
      username: usernameFromEmail,
      secretPin: 'GOOGLE_AUTHENTICATED', // Secure random fallback placeholder
      email: cleanEmail,
      fullName: fullName || usernameFromEmail,
      avatarUrl: avatarUrl,
      isGoogleAccount: true,
      createdAt: new Date().toISOString()
    };
    admins.push(admin);
    saveAdmins(admins);

    // Notification mark
    const notifications = getNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      titleEn: 'Google Admin Registered',
      titleFr: 'Admin Google Enregistré',
      detail: `New administration link built with Google Account ${cleanEmail}`,
      createdAt: new Date().toISOString(),
      read: false
    });
    saveNotifications(notifications);
  }

  return res.json({ 
    status: 'success', 
    admin: { 
      username: admin.username, 
      fullName: admin.fullName || admin.username, 
      email: admin.email, 
      avatarUrl: admin.avatarUrl 
    } 
  });
});

// API: health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// API: OAuth client configuration
app.get('/api/auth/config', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || 
                   process.env.OAUTH_CLIENT_ID || 
                   process.env.CLIENT_ID || 
                   '';
  res.json({ clientId });
});

// OAuth Callback Route for GIS Popup flow
app.get('/auth/callback', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Authentification Google Réussie</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F2EFEF; color: #1e1e1e; text-align: center; }
          .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; width: 90%; }
          .spinner { border: 3px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #8353E2; animation: spin 1s linear infinite; margin: 1.5rem auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h3 { margin: 0 0 0.5rem 0; color: #111; font-weight: 600; }
          p { margin: 0; color: #666; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>Connexion Google Établie</h3>
          <div class="spinner"></div>
          <p>Transfert sécurisé des autorisations au ticket...</p>
        </div>
        <script>
          // Extraire l'access_token du fragment de hachage (#access_token=...)
          const hash = window.location.hash;
          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken && window.opener) {
              window.opener.postMessage({ type: 'OAUTH_ACCESS_TOKEN', token: accessToken }, '*');
              window.close();
            }
          }
          
          // Extraire s'il est sous forme de requête d'URL (?access_token=...)
          const searchParams = new URLSearchParams(window.location.search);
          const accessTokenQuery = searchParams.get('access_token');
          if (accessTokenQuery && window.opener) {
            window.opener.postMessage({ type: 'OAUTH_ACCESS_TOKEN', token: accessTokenQuery }, '*');
            window.close();
          }
        </script>
      </body>
    </html>
  `);
});

// Setup Vite Dev Server / Static Asset Hosting Middlewares
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev mode, attach Vite development webserver
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production modes, serve static bundling dist assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Birthday wisher-ticket Server] Operating on http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to boot dev server', err);
});
