import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize2, 
  FileText, 
  Download, 
  BookOpen, 
  Shield, 
  Users, 
  ShoppingCart, 
  Package, 
  Heart, 
  Activity, 
  FlaskConical, 
  ChevronRight, 
  Video, 
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  shift: string;
  status: string;
  badgeId: string;
  suspended?: boolean;
  username: string;
  canAccessMaternity?: boolean;
  canAccessDispensary?: boolean;
  canAccessLaboratory?: boolean;
}

interface GuideSectionProps {
  isAdmin: boolean;
  currentUser: Employee | null;
  pharmacyInfo: {
    companyName: string;
    pharmacyName: string;
    address: string;
    phone: string;
    email: string;
  };
  playBeep: () => void;
  employees: Employee[];
}

interface Chapter {
  id: number;
  title: string;
  duration: number; // in seconds
  subtitles: { time: number; text: string }[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "1. Introduction & Tableau de Bord",
    duration: 30,
    subtitles: [
      { time: 0, text: "Bienvenue dans le guide d'utilisation vidéo officiel de LOG PHARMA, également logiciel de gestion de clinique ou centre de santé." },
      { time: 5, text: "Découvrez l'interface moderne d'administration conçue pour fluidifier la gestion d'officine." },
      { time: 12, text: "Le Tableau de bord agrège le Chiffre d'Affaires net et le volume des transactions en temps réel." },
      { time: 20, text: "Les graphiques interactifs vous permettent de surveiller l'évolution des ventes et les performances." },
      { time: 26, text: "Voyons maintenant comment saisir les ventes courantes à la caisse d'officine." }
    ]
  },
  {
    id: 2,
    title: "2. Caisse de Vente & SESAM-Vitale",
    duration: 40,
    subtitles: [
      { time: 0, text: "Accédez au menu Caisse de Vente pour enregistrer les ordonnances et achats clients." },
      { time: 6, text: "Sélectionnez les médicaments dans le catalogue ou scannez le code-barres CIP." },
      { time: 13, text: "Modifiez les quantités, appliquez les remises contractuelles ou rattachez un client existant." },
      { time: 21, text: "Cochez 'Couverture SESAM-Vitale' pour appliquer le tiers payant dématérialisé." },
      { time: 28, text: "Validez la vente : le système génère instantanément la fiche comptable et met à jour le stock." },
      { time: 35, text: "Vous pouvez également imprimer le ticket de caisse ou télécharger la facture PDF." }
    ]
  },
  {
    id: 3,
    title: "3. Alerte Stocks & Catalogue CIP",
    duration: 30,
    subtitles: [
      { time: 0, text: "Le module de Stocks & Produits assure la traçabilité rigoureuse de vos molécules." },
      { time: 6, text: "Chaque médicament possède un code CIP unique, un prix d'achat, de vente et un seuil d'alerte." },
      { time: 13, text: "Si le stock d'un produit descend sous le seuil critique, le système affiche une alerte visuelle orange ou rouge." },
      { time: 21, text: "L'administrateur peut réapprovisionner ou modifier la fiche produit en un clic." },
      { time: 26, text: "Conservez toujours un œil sur les indicateurs de rupture pour garantir la continuité des soins." }
    ]
  },
  {
    id: 4,
    title: "4. Rôles, Personnel & Gardes",
    duration: 35,
    subtitles: [
      { time: 0, text: "Gérez votre équipe officinale en toute sécurité depuis l'onglet Personnel & Gardes." },
      { time: 6, text: "Ajoutez des collaborateurs et définissez leurs rôles (Admin, Pharmacien, Préparateur, Stagiaire)." },
      { time: 13, text: "Activez de manière exclusive les habilitations pour la Maternité, le Dispensaire ou le Laboratoire." },
      { time: 21, text: "Planifiez les tours de garde (Jour, Nuit, Weekend) pour une couverture optimale de l'officine." },
      { time: 28, text: "Les accès aux comptes sont sécurisés par mot de passe individuel." }
    ]
  },
  {
    id: 5,
    title: "5. Compta Spécialisée & Dépenses",
    duration: 35,
    subtitles: [
      { time: 0, text: "LOG PHARMA propose 3 modules de comptabilité spécialisée : Maternité, Dispensaire et Laboratoire." },
      { time: 7, text: "Saisissez les hospitalisations, les consultations du jour, ou les examens biologiques." },
      { time: 14, text: "Chaque module permet de générer des rapports comptables complets et conformes." },
      { time: 21, text: "L'administrateur entreprise dispose du droit exclusif de vider ces registres pour un nouvel exercice." },
      { time: 28, text: "Suivez également les dépenses d'exploitation et validez-les pour l'équilibre comptable." }
    ]
  }
];

export const GuideSection: React.FC<GuideSectionProps> = ({
  isAdmin,
  currentUser,
  pharmacyInfo,
  playBeep,
  employees
}) => {
  const [guideSubTab, setGuideSubTab] = useState<'admin' | 'employee'>(() => isAdmin ? 'admin' : 'employee');
  
  useEffect(() => {
    if (!isAdmin) {
      setGuideSubTab('employee');
    }
  }, [isAdmin]);

  const canAccessMaternity = isAdmin || (currentUser ? !!currentUser.canAccessMaternity : false);
  const canAccessDispensary = isAdmin || (currentUser ? !!currentUser.canAccessDispensary : false);
  const canAccessLaboratory = isAdmin || (currentUser ? !!currentUser.canAccessLaboratory : false);

  // Filter CHAPTERS based on roles & permissions
  const filteredChapters = CHAPTERS.filter(ch => {
    if (isAdmin) return true;
    if (ch.id === 4) {
      // "Rôles, Personnel & Gardes" is admin only
      return false;
    }
    if (ch.id === 5) {
      // "Compta Spécialisée" is relevant if they have any of the 3 compta permissions
      return canAccessMaternity || canAccessDispensary || canAccessLaboratory;
    }
    return true;
  });

  // Video player states
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [subtitleText, setSubtitleText] = useState<string>("");

  const activeChapter = filteredChapters[currentChapterIndex] || filteredChapters[0];

  // Update subtitles based on current time
  useEffect(() => {
    if (!activeChapter) return;
    const matchingSubtitle = [...activeChapter.subtitles]
      .reverse()
      .find(sub => currentTime >= sub.time);
    
    setSubtitleText(matchingSubtitle ? matchingSubtitle.text : "");
  }, [currentTime, activeChapter]);

  // Handle video progression interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && activeChapter) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const nextTime = prevTime + 1 * playbackSpeed;
          if (nextTime >= activeChapter.duration) {
            // Chapter finished
            if (currentChapterIndex < filteredChapters.length - 1) {
              setCurrentChapterIndex(prev => prev + 1);
              return 0;
            } else {
              // Loop back to start or pause
              setIsPlaying(false);
              return 0;
            }
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeChapter, currentChapterIndex, playbackSpeed, filteredChapters.length]);

  const handlePlayPause = () => {
    playBeep();
    setIsPlaying(!isPlaying);
  };

  const selectChapter = (index: number) => {
    playBeep();
    setCurrentChapterIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  // PDF Generator for user guide
  const handleDownloadPDF = () => {
    playBeep();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(4, 120, 87); // Emerald-700
    doc.text("GUIDE D'UTILISATION - LOG PHARMA", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Système Professionnel de Gestion d'Officine & Comptabilité Multi-Module", 14, 26);
    doc.text(`Version 4.1 | Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 31);
    doc.line(14, 35, 196, 35);
    
    // Introduction
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.setFont("Helvetica", "bold");
    doc.text("1. INTRODUCTION & VISION GLOBALE", 14, 45);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    const introText = "LOG PHARMA est une solution web full-stack complete concue pour digitaliser l'activite quotidienne des officines pharmaceutiques, ainsi que des cliniques ou centres de sante. Elle combine une caisse de vente intelligente, un suivi rigoureux des stocks avec alertes CIP, une gestion du personnel, et des modules de comptabilite specialises (Maternite, Dispensaire, Laboratoire) pour assurer une tracabilite financiere et medicale absolue. LOG PHARMA s'impose ainsi comme un veritable logiciel de gestion de clinique ou centre de sante.";
    const splitIntro = doc.splitTextToSize(introText, 180);
    doc.text(splitIntro, 14, 52);
    
    // Admin section
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.setFont("Helvetica", "bold");
    doc.text("2. GUIDE POUR LES ADMINISTRATEURS (COMPTE ENTREPRISE)", 14, 72);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    const adminBullet1 = "• Supervision Financiere : Accedez au Tableau de bord general pour suivre en temps reel le Chiffre d'Affaires net, le volume des ventes, les indicateurs d'evolution et le top des ventes par produit ou par vendeur.";
    const adminBullet2 = "• Gestion des Habilitations : Accordez ou restreignez l'acces exclusif aux menus specialises (Compta Maternite, Dispensaire, Laboratoire) via l'onglet Personnel.";
    const adminBullet3 = "• Administration du Personnel : Enregistrez les collaborateurs, configurez leurs identifiants/mots de passe d'officine, et planifiez les tours de garde.";
    const adminBullet4 = "• Securite Comptable : L'administrateur a le privilege de vider ou reinitialiser les registres comptables (Maternite, Dispensaire, Laboratoire) pour chaque nouveau cycle d'exercice d'officine.";
    
    const splitAB1 = doc.splitTextToSize(adminBullet1, 180);
    const splitAB2 = doc.splitTextToSize(adminBullet2, 180);
    const splitAB3 = doc.splitTextToSize(adminBullet3, 180);
    const splitAB4 = doc.splitTextToSize(adminBullet4, 180);
    
    let currentY = 79;
    doc.text(splitAB1, 14, currentY); currentY += doc.getTextDimensions(splitAB1).h + 2;
    doc.text(splitAB2, 14, currentY); currentY += doc.getTextDimensions(splitAB2).h + 2;
    doc.text(splitAB3, 14, currentY); currentY += doc.getTextDimensions(splitAB3).h + 2;
    doc.text(splitAB4, 14, currentY); currentY += doc.getTextDimensions(splitAB4).h + 6;
    
    // Employee section
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.setFont("Helvetica", "bold");
    doc.text("3. GUIDE POUR LES COLLABORATEURS (EMPLOYEES)", 14, currentY); currentY += 7;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    const empBullet1 = "• Caisse de Vente : Realisez des ventes rapidement, assignez un patient (Client de passage ou client enregistre), appliquez une couverture Sesam-Vitale ou mode Auto, et imprimez/telechargez les recus de vente.";
    const empBullet2 = "• Gestion des Stocks : Surveillez l'etat des stocks par code CIP. Les niveaux critiques sont identifies par couleur pour eviter les ruptures d'approvisionnement.";
    const empBullet3 = "• Gestion des Depenses : Soumettez une depense (Achat de medicaments, fournitures, etc.) avec justification pour validation par le pharmacien titulaire.";
    const empBullet4 = "• Registres Specialises : Saisissez les admissions en Maternite, les soins du Dispensaire, ou les examens biologiques au Laboratoire selon vos habilitations.";
    
    const splitEB1 = doc.splitTextToSize(empBullet1, 180);
    const splitEB2 = doc.splitTextToSize(empBullet2, 180);
    const splitEB3 = doc.splitTextToSize(empBullet3, 180);
    const splitEB4 = doc.splitTextToSize(empBullet4, 180);
    
    doc.text(splitEB1, 14, currentY); currentY += doc.getTextDimensions(splitEB1).h + 2;
    doc.text(splitEB2, 14, currentY); currentY += doc.getTextDimensions(splitEB2).h + 2;
    doc.text(splitEB3, 14, currentY); currentY += doc.getTextDimensions(splitEB3).h + 2;
    doc.text(splitEB4, 14, currentY); currentY += doc.getTextDimensions(splitEB4).h + 6;
    
    // Footer / Contact
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.setFont("Helvetica", "bold");
    doc.text("Besoin d'assistance technique supplémentaire ?", 14, currentY); currentY += 5;
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Contactez GT NUMERIQUE à l'adresse contact.gtnumerique@gmail.com ou au +229 01 69175081.", 14, currentY);
    
    doc.save(`guide_utilisation_logpharma.pdf`);
  };

  // Generate an interactive animated offline HTML simulation package representing the video tutorial!
  const handleDownloadVideoIllustration = () => {
    playBeep();
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Illustration Vidéo Interactive - LOG PHARMA</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            max-width: 900px;
            width: 100%;
            background: #1e293b;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        h1 {
            color: #10b981;
            margin-bottom: 5px;
        }
        p.subtitle {
            color: #94a3b8;
            margin-top: 0;
            margin-bottom: 25px;
        }
        .video-box {
            position: relative;
            background-color: #020617;
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid #334155;
            aspect-ratio: 16/9;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px;
            box-sizing: border-box;
        }
        .screen-animation {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        .controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(15, 23, 42, 0.95);
            padding: 12px 20px;
            border-radius: 8px;
            margin-top: 15px;
        }
        .btn {
            background-color: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover {
            background-color: #059669;
        }
        .chapters {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .chapter-btn {
            background: #334155;
            color: #cbd5e1;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .chapter-btn.active {
            background: #10b981;
            color: white;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }
        .subtitles {
            font-size: 15px;
            font-weight: 600;
            color: #34d399;
            background-color: rgba(0, 0, 0, 0.85);
            padding: 8px 15px;
            border-radius: 6px;
            margin-top: auto;
            text-shadow: 1px 1px 2px black;
        }
        .progress-bar {
            height: 5px;
            background-color: #475569;
            border-radius: 3px;
            width: 100%;
            margin-bottom: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background-color: #ef4444;
            width: 0%;
            transition: width 1s linear;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>LOG PHARMA</h1>
        <p class="subtitle">Illustration Vidéo Interactive & Formations Offlines</p>
        
        <div class="video-box" id="player">
            <div class="screen-animation" id="canvas">
                <div style="font-size: 40px; margin-bottom: 15px;">📊</div>
                <h3 id="panel-title" style="margin: 5px 0;">Chargement du Guide Interactif...</h3>
                <p id="panel-desc" style="color: #94a3b8; font-size: 13px; max-width: 400px; text-align: center; margin: 0;">Sélectionnez un chapitre ci-dessous pour démarrer la démonstration animée.</p>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" id="pfill"></div>
            </div>

            <div class="subtitles" id="subtext">Cliquez sur un chapitre ou sur Lecture pour lancer le didacticiel.</div>
        </div>

        <div class="controls">
            <button class="btn" id="playBtn" onclick="togglePlay()">Démarrer</button>
            <div id="timer">00:00</div>
        </div>

        <div class="chapters">
            <button class="chapter-btn active" onclick="selectChapter(0)">1. Tableau de bord & KPIs</button>
            <button class="chapter-btn" onclick="selectChapter(1)">2. Caisse de Vente</button>
            <button class="chapter-btn" onclick="selectChapter(2)">3. Alerte de Stock CIP</button>
            <button class="chapter-btn" onclick="selectChapter(3)">4. Personnel & Gardes</button>
            <button class="chapter-btn" onclick="selectChapter(4)">5. Compta & Dépenses</button>
        </div>
    </div>

    <script>
        const data = [
            {
                title: "Tableau de bord & KPIs d'Officine",
                desc: "Analyse en temps réel du chiffre d'affaires, marge commerciale nette, et répartition des ventes.",
                icon: "📊",
                subtitles: "LOG PHARMA centralise les écritures d'officine dans un tableau de bord intuitif d'analyse."
            },
            {
                title: "Enregistrement d'une vente à la Caisse",
                desc: "Scannez le CIP, assignez le client de passage, choisissez le Tiers Payant SESAM-Vitale et encaissez.",
                icon: "🛒",
                subtitles: "Effectuez vos encaissements et validez l'ordonnance d'un patient en un instant."
            },
            {
                title: "Surveillance des Stocks Critiques",
                desc: "Le système automatise le calcul des alertes. Alerte rouge clignotante sous le seuil configuré.",
                icon: "📦",
                subtitles: "Le catalogue interactif prévient les pharmaciens en cas de rupture de stock critique."
            },
            {
                title: "Gestion des Comptes & Gardes",
                desc: "Planifiez les on-call de nuit ou weekend, configurez les droits d'accès pour les collaborateurs.",
                icon: "👥",
                subtitles: "L'administrateur gère les rôles d'équipe et attribue les habilitations compta d'officine."
            },
            {
                title: "Comptabilité Spécialisée (Labo/Maternité)",
                desc: "Saisie des consultations de jour, des analyses cliniques, et validation globale des dépenses.",
                icon: "🧪",
                subtitles: "Renseignez les examens biologiques ou les hospitalisations cliniques en toute sérénité."
            }
        ];

        let activeIdx = 0;
        let isPlaying = false;
        let progress = 0;
        let timer = null;

        function updateUI() {
            const current = data[activeIdx];
            document.getElementById('panel-title').innerText = current.title;
            document.getElementById('panel-desc').innerText = current.desc;
            document.getElementById('subtext').innerText = current.subtitles;
            document.getElementById('pfill').style.width = progress + '%';
            
            const btns = document.querySelectorAll('.chapter-btn');
            btns.forEach((b, i) => {
                if(i === activeIdx) b.classList.add('active');
                else b.classList.remove('active');
            });
            
            document.getElementById('timer').innerText = "00:" + (progress < 10 ? "0" : "") + Math.floor(progress * 0.3);
        }

        function togglePlay() {
            isPlaying = !isPlaying;
            document.getElementById('playBtn').innerText = isPlaying ? "Pause" : "Lecture";
            
            if(isPlaying) {
                timer = setInterval(() => {
                    progress += 4;
                    if(progress > 100) {
                        progress = 0;
                        activeIdx = (activeIdx + 1) % data.length;
                    }
                    updateUI();
                }, 500);
            } else {
                clearInterval(timer);
            }
        }

        function selectChapter(idx) {
            activeIdx = idx;
            progress = 0;
            updateUI();
        }

        // Init
        updateUI();
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `guide_video_illustration.html`;
    link.click();
  };

  // Helper formatting for duration timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800" style={{ backgroundImage: 'radial-gradient(circle at top right, #064e3b, #0f172a)' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider">Doc Officine</span>
              <span className="text-emerald-400 font-mono text-xs font-bold">LOG PHARMA v4.1</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="text-emerald-400" size={24} />
              Guide d'Utilisation & Centre d'Aide
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl">
              Retrouvez l'ensemble des manuels opérationnels d'officine pour les Administrateurs Entreprises et les Collaborateurs, 
              accompagnés de tutoriels vidéo interactifs et de rapports téléchargeables.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <button 
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <FileText size={14} />
              <span>Guide Complet (PDF)</span>
            </button>
            <button 
              onClick={handleDownloadVideoIllustration}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-extrabold uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-700"
              title="Télécharger une simulation d'illustration vidéo interactive hors-ligne au format HTML"
            >
              <Download size={14} />
              <span>Illustration Vidéo</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE VIDEO TUTORIAL SIMULATOR (16:9 PLAYER) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Video size={14} className="text-emerald-400" />
                Lecteur Vidéo Interactif • Guide Virtuel
              </h4>
            </div>
            <span className="text-[10px] text-slate-500 font-bold font-mono">Simulateur Officine</span>
          </div>

          {/* SCREEN CANVAS AREA */}
          <div className="relative aspect-video bg-slate-900 flex flex-col justify-between p-4 overflow-hidden group select-none">
            
            {/* Play overlay / chapter visual rendering depending on active chapter and time */}
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-4">
              {currentChapterIndex === 0 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-4xl">📊</div>
                  <h3 className="text-base font-black text-white">Tableau de Bord & KPIs Analytiques</h3>
                  <div className="flex justify-center gap-3">
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-left min-w-[100px]">
                      <p className="text-[9px] text-slate-400 font-bold">CHIFRE D'AFFAIRES</p>
                      <p className="text-xs font-black text-emerald-400">1 425 000 FCFA</p>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-left min-w-[100px]">
                      <p className="text-[9px] text-slate-400 font-bold">TRANSACTIONS</p>
                      <p className="text-xs font-black text-blue-400">42 Fiches de Vente</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Visualisation du chiffre d'affaires cumulé et des bénéfices...</div>
                </div>
              )}

              {currentChapterIndex === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-4xl">🛒</div>
                  <h3 className="text-base font-black text-white">Caisse de Vente Intelligente</h3>
                  <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl max-w-sm mx-auto space-y-2 text-left text-[10px]">
                    <div className="flex justify-between font-mono">
                      <span>Doliprane 500mg (x2)</span>
                      <span>1 500.00 FCFA</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Amoxicilline 1g (x1)</span>
                      <span>2 400.00 FCFA</span>
                    </div>
                    <div className="border-t border-slate-700 pt-1.5 flex justify-between font-black text-emerald-400">
                      <span>TOTAL PANIER (SESAM-Vitale)</span>
                      <span>3 900.00 FCFA</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Saisie rapide, CIP médicament et intégration de la carte Vitale.</div>
                </div>
              )}

              {currentChapterIndex === 2 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-4xl">📦</div>
                  <h3 className="text-base font-black text-white">Ruptures de Stocks & Codes CIP</h3>
                  <div className="max-w-xs mx-auto bg-slate-800/90 border border-rose-500 p-3 rounded-lg flex items-center gap-3 text-left">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-[10px] font-bold text-rose-400">RUPTURE CRITIQUE • DOLIPRANE 1G</p>
                      <p className="text-[9px] text-slate-400">Seuil de sécurité : 10 | Stock restant : 2 boîtes</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Mise à jour automatique des inventaires d'officine.</div>
                </div>
              )}

              {currentChapterIndex === 3 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-4xl">👥</div>
                  <h3 className="text-base font-black text-white">Habilitations & Tours de Garde</h3>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 max-w-xs mx-auto space-y-1.5 text-left text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300">Compta Maternité</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">AUTORISÉ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300">Compta Laboratoire</span>
                      <span className="bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase">RESTREINT</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Attribution sécurisée des accès selon le rôle professionnel.</div>
                </div>
              )}

              {currentChapterIndex === 4 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-4xl">🧪</div>
                  <h3 className="text-base font-black text-white">Comptabilités Spécialisées d'Officine</h3>
                  <div className="flex gap-2 justify-center">
                    <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded border border-emerald-900 flex items-center gap-1">
                      <Heart size={10} /> Maternité
                    </span>
                    <span className="bg-blue-950 text-blue-400 text-[9px] font-bold px-2 py-1 rounded border border-blue-900 flex items-center gap-1">
                      <Activity size={10} /> Dispensaire
                    </span>
                    <span className="bg-purple-950 text-purple-400 text-[9px] font-bold px-2 py-1 rounded border border-purple-900 flex items-center gap-1">
                      <FlaskConical size={10} /> Laboratoire
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Clôtures régulières, validation administrative des fiches et des dépenses.</div>
                </div>
              )}
            </div>

            {/* Subtitles Overlay */}
            <div className="w-full bg-slate-950/80 backdrop-blur-xs px-4 py-2 text-center rounded-lg border border-slate-800 text-emerald-300 font-medium text-[11px] leading-relaxed select-none min-h-[48px] flex items-center justify-center">
              {subtitleText}
            </div>
          </div>

          {/* CONTROLS BAR */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col space-y-2">
            
            {/* Timeline slider */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-slate-500 font-mono font-bold">{formatTime(currentTime)}</span>
              <input 
                type="range"
                min="0"
                max={activeChapter.duration}
                value={currentTime}
                onChange={handleScrubberChange}
                className="flex-1 accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg outline-none"
              />
              <span className="text-[9px] text-slate-500 font-mono font-bold">{formatTime(activeChapter.duration)}</span>
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePlayPause}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black p-2 rounded-full cursor-pointer transition-all flex items-center justify-center"
                >
                  {isPlaying ? <Pause size={12} fill="#022c22" /> : <Play size={12} fill="#022c22" className="translate-x-0.5" />}
                </button>
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                  <Volume2 size={13} className="text-slate-500" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-12 h-1 accent-slate-400 bg-slate-800 rounded" 
                  />
                </div>
              </div>

              {/* Chapter summary text info */}
              <div className="text-[10px] text-slate-400 font-bold max-w-[200px] truncate text-center hidden md:block">
                Chapitre en cours : <span className="text-emerald-400">{activeChapter.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    playBeep();
                    setPlaybackSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 font-mono px-2 py-1 rounded font-bold cursor-pointer transition-all"
                  title="Vitesse de lecture"
                >
                  {playbackSpeed}x
                </button>
                <button 
                  onClick={() => {
                    playBeep();
                    alert("Agrandissement de la vidéo de formation.\n(Simulé - Pour une immersion totale hors-ligne, téléchargez l'Illustration Vidéo ci-dessus)");
                  }}
                  className="text-slate-400 hover:text-white p-1.5 rounded cursor-pointer"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* CHAPTERS SELECTOR SECTION */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Sélectionner un Chapitre de Formation :</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredChapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => selectChapter(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                    idx === currentChapterIndex 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold">{ch.title}</p>
                    <p className="text-[9px] text-slate-500 font-semibold font-mono">Vidéo didacticielle • {ch.duration}s</p>
                  </div>
                  <ChevronRight size={12} className={idx === currentChapterIndex ? 'text-emerald-400' : 'text-slate-600'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED WRITTEN MANUALS & COMPILATION */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Nav tabs for Admin vs Employee */}
            {isAdmin ? (
              <div className="flex border-b text-xs font-bold bg-slate-50">
                <button 
                  onClick={() => { playBeep(); setGuideSubTab('admin'); }}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    guideSubTab === 'admin' 
                      ? 'border-emerald-600 text-emerald-800 bg-white font-black' 
                      : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  <Shield size={14} />
                  <span>Guide Administrateur (Compte)</span>
                </button>
                <button 
                  onClick={() => { playBeep(); setGuideSubTab('employee'); }}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    guideSubTab === 'employee' 
                      ? 'border-emerald-600 text-emerald-800 bg-white font-black' 
                      : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  <Users size={14} />
                  <span>Guide Collaborateurs</span>
                </button>
              </div>
            ) : (
              <div className="flex border-b text-xs font-bold bg-slate-50">
                <div className="flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 border-emerald-600 text-emerald-800 bg-white font-black select-none">
                  <Users size={14} />
                  <span>Guide Collaborateur — Votre Espace</span>
                </div>
              </div>
            )}

            {/* Content areas */}
            <div className="p-5 text-xs text-slate-600 leading-relaxed space-y-4">
              
              {/* ADMIN GUIDE CONTENT */}
              {guideSubTab === 'admin' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-start gap-3">
                    <Info className="text-emerald-700 shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-emerald-900 text-xs">Privilèges d'Administration Entreprise</h4>
                      <p className="text-[11px] text-emerald-800">
                        Vous disposez d'un accès total de supervision : financier, stocks, personnel et sécurité des bases d'officine.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="border-l-2 border-emerald-600 pl-3 space-y-1">
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">📈 Tableau de Bord & Supervision</h5>
                      <p className="text-[11px] text-slate-500">
                        Consultez l'évolution en temps réel du chiffre d'affaires et surveillez la marge. Le tableau récapitule les produits phares et les collaborateurs les plus actifs de la journée.
                      </p>
                    </div>

                    <div className="border-l-2 border-emerald-600 pl-3 space-y-1">
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">🔑 Droits d'Accès & Habilitations</h5>
                      <p className="text-[11px] text-slate-500">
                        Dans l'onglet <strong>Personnel & Gardes</strong>, vous pouvez attribuer individuellement le droit d'accès aux modules comptables spécialisés (Maternité, Dispensaire, Laboratoire). Les collaborateurs non autorisés ne verront pas ces menus dans leur barre de navigation.
                      </p>
                    </div>

                    <div className="border-l-2 border-emerald-600 pl-3 space-y-1">
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">📅 Plannings de Garde & Équipes</h5>
                      <p className="text-[11px] text-slate-500">
                        Enregistrez de nouveaux pharmaciens ou stagiaires, associez-les à des tours de garde (Jour, Nuit, Weekend) et suspendez temporairement ou définitivement un compte si nécessaire.
                      </p>
                    </div>

                    <div className="border-l-2 border-rose-500 pl-3 space-y-1">
                      <h5 className="font-black text-rose-800 text-xs uppercase tracking-wider">🚨 Purge Comptable (Nouveau Cycle)</h5>
                      <p className="text-[11px] text-slate-500">
                        Pour faciliter un nouvel exercice ou clore une période, l'administrateur a le privilège exclusif de <strong>vider</strong> d'un seul clic les registres de comptabilité spécialisée (Maternité, Dispensaire, Laboratoire) en utilisant le bouton rouge <strong>"Vider la Compta"</strong> disponible sur chaque rapport.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EMPLOYEE/COLLABORATOR GUIDE CONTENT */}
              {guideSubTab === 'employee' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border p-3.5 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="text-slate-500 shrink-0 mt-0.5" size={16} />
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-xs">Didacticiel Opérationnel Officine</h4>
                        <p className="text-[11px] text-slate-500">
                          {isAdmin 
                            ? "Compte Administrateur : Vous possédez tous les accès d'administration et de supervision d'officine."
                            : `Compte Collaborateur (${currentUser?.name || 'Utilisateur'}). Découvrez les guides associés à vos habilitations de fonctionnalité :`}
                        </p>
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="grid grid-cols-3 gap-1.5 pt-1.5 text-[9px] text-center font-bold font-mono">
                        <div className={`p-1.5 rounded-lg border flex flex-col justify-center items-center gap-0.5 ${canAccessMaternity ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                          <span>Maternité</span>
                          <span className="text-[8px] font-extrabold uppercase">{canAccessMaternity ? '● Activé' : '○ Restreint'}</span>
                        </div>
                        <div className={`p-1.5 rounded-lg border flex flex-col justify-center items-center gap-0.5 ${canAccessDispensary ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                          <span>Dispensaire</span>
                          <span className="text-[8px] font-extrabold uppercase">{canAccessDispensary ? '● Activé' : '○ Restreint'}</span>
                        </div>
                        <div className={`p-1.5 rounded-lg border flex flex-col justify-center items-center gap-0.5 ${canAccessLaboratory ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                          <span>Laboratoire</span>
                          <span className="text-[8px] font-extrabold uppercase">{canAccessLaboratory ? '● Activé' : '○ Restreint'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div className="border-l-2 border-slate-400 pl-3 space-y-1">
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">🛒 Caisse de Vente & Encaissements</h5>
                      <p className="text-[11px] text-slate-500">
                        Ajoutez des médicaments au panier. Recherchez par nom ou CIP. Renseignez le nom du patient et choisissez le statut tiers payant (SESAM-Vitale) ou règlement autonome (Auto). Validez l'achat pour déduire automatiquement le stock et mettre à jour le tiroir-caisse.
                      </p>
                    </div>

                    <div className="border-l-2 border-slate-400 pl-3 space-y-1">
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">📦 Alerte Stocks & Catalogue CIP</h5>
                      <p className="text-[11px] text-slate-500">
                        Suivez les indicateurs de stocks. Un produit passant sous le seuil d'alerte configuré se colore en orange ou rouge pour notifier de lancer la commande auprès des laboratoires partenaires.
                      </p>
                    </div>

                    {canAccessMaternity && (
                      <div className="border-l-2 border-emerald-600 pl-3 space-y-1 bg-emerald-50/25 py-1.5 pr-2 rounded-r-lg">
                        <h5 className="font-black text-emerald-800 text-xs uppercase tracking-wider">🤰 Comptabilité Maternité</h5>
                        <p className="text-[11px] text-slate-600">
                          Saisissez les admissions de patientes en maternité, les hospitalisations et les accouchements assistés. Renseignez précisément le dossier d'imputation clinique et encaissez les frais correspondants pour le journal de caisse maternité.
                        </p>
                      </div>
                    )}

                    {canAccessDispensary && (
                      <div className="border-l-2 border-blue-600 pl-3 space-y-1 bg-blue-50/25 py-1.5 pr-2 rounded-r-lg">
                        <h5 className="font-black text-blue-800 text-xs uppercase tracking-wider">🏥 Comptabilité Dispensaire</h5>
                        <p className="text-[11px] text-slate-600">
                          Enregistrez les consultations médicales quotidiennes, les pansements administrés et les injections cliniques. Validez les fiches pour comptabiliser les recettes journalières d'actes d'officine.
                        </p>
                      </div>
                    )}

                    {canAccessLaboratory && (
                      <div className="border-l-2 border-purple-600 pl-3 space-y-1 bg-purple-50/25 py-1.5 pr-2 rounded-r-lg">
                        <h5 className="font-black text-purple-800 text-xs uppercase tracking-wider">🔬 Comptabilité Laboratoire</h5>
                        <p className="text-[11px] text-slate-600">
                          Saisissez les examens biologiques réalisés (analyses de sang, urine, prélèvements). Spécifiez le nom du biologiste exécutant et validez la fiche comptable de laboratoire pour un archivage rigoureux.
                        </p>
                      </div>
                    )}

                    <div className="border-l-2 border-slate-400 pl-3 space-y-1">
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">💵 Justification des Dépenses</h5>
                      <p className="text-[11px] text-slate-500">
                        Enregistrez chaque dépense d'exploitation (fournitures, petits achats). Elles apparaîtront en statut 'En attente' jusqu'à leur approbation par le pharmacien titulaire pour être intégrées au registre de caisse.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom contact help */}
            <div className="p-4 bg-slate-50 border-t text-center text-[11px] text-slate-500 font-bold">
              Une question ? Service technique GT NUMÉRIQUE au +229 01 69175081 ou par email à contact.gtnumerique@gmail.com
            </div>
          </div>

          {/* QUICK LINKS BENTO */}
          <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-3 shadow-md border border-emerald-900" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #047857, #022c22)' }}>
            <h4 className="font-black text-xs uppercase tracking-wider text-emerald-300">Ressources & Conformité d'Officine, Clinique & Centre de Santé</h4>
            <p className="text-[11px] text-slate-300">
              LOG PHARMA est homologué pour le suivi dématérialisé d'officine, de clinique ou centre de santé, et intègre les standards de traçabilité CIP13.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60">
                <p className="font-bold text-emerald-300">✅ Normes d'Officine & Clinique</p>
                <p className="text-slate-300 mt-1 font-semibold">Conforme directives dématérialisation et gestion de santé d'Afrique de l'Ouest</p>
              </div>
              <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60">
                <p className="font-bold text-emerald-300">🔒 Sécurité d'Accès</p>
                <p className="text-slate-300 mt-1 font-semibold">Authentification unique pour chaque collaborateur d'officine</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
