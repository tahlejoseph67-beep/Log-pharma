import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck, 
  Plus, 
  FileText, 
  ShoppingCart, 
  CreditCard, 
  ChevronRight, 
  Heart, 
  Printer, 
  Trash2, 
  Layers, 
  Activity, 
  X,
  Clock,
  Briefcase,
  Lock,
  Unlock,
  Shield,
  Ban,
  Edit3,
  Camera,
  Barcode,
  RefreshCw
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface Medicine {
  id: string;
  name: string;
  cip: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  minAlertQty: number;
  expiryDate: string;
  location: string;
  requiresPrescription: boolean;
}

interface Employee {
  id: string;
  name: string;
  role: 'Admin' | 'Pharmacien Titulaire' | 'Pharmacien Adjoint' | 'Préparateur' | 'Stagiaire' | 'Conseiller';
  phone: string;
  email: string;
  shift: string;
  status: 'Présent' | 'Absent' | 'En congé';
  badgeId: string;
  suspended?: boolean;
  username: string;
  password?: string;
}

interface Partner {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  dueAmount: number;
  invoicesCount: number;
  reliability: 'Excellent' | 'Moyen' | 'À surveiller';
}

interface Client {
  id: string;
  name: string;
  loyaltyCard: string;
  phone: string;
  email: string;
  socialSecurityNumber: string;
  prescriptionHistory: string[];
  loyaltyPoints: number;
}

interface SaleItem {
  medicine: Medicine;
  quantity: number;
  refundedBySecu: number;
}

interface Sale {
  id: string;
  date: string;
  items: { medicineId: string; name: string; quantity: number; price: number }[];
  clientId?: string;
  clientName?: string;
  subtotal: string;
  discount: string;
  secuRefund: string;
  totalPaid: string;
  prescriptionAttached: boolean;
  paymentMethod: string;
  sellerId?: string;
  sellerName?: string;
}

// Initial datasets in clear French
const INITIAL_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracétamol Biogaran 500mg', cip: '340093848206', category: 'Antalgique', buyingPrice: 0.95, sellingPrice: 2.15, quantity: 140, minAlertQty: 30, expiryDate: '2028-04-12', location: 'Rayon A-1', requiresPrescription: false },
  { id: '2', name: 'Amoxicilline Sandoz 1g', cip: '340093319020', category: 'Antibiotique', buyingPrice: 2.80, sellingPrice: 5.40, quantity: 18, minAlertQty: 25, expiryDate: '2026-09-18', location: 'Rayon B-4', requiresPrescription: true },
  { id: '3', name: 'Ibuprofène UPSA 400mg', cip: '340093617320', category: 'Anti-inflammatoire', buyingPrice: 1.10, sellingPrice: 2.65, quantity: 9, minAlertQty: 15, expiryDate: '2026-06-15', location: 'Rayon A-3', requiresPrescription: false },
  { id: '4', name: 'Spasfon Comprimés', cip: '340093433610', category: 'Antispasmodique', buyingPrice: 1.85, sellingPrice: 3.90, quantity: 55, minAlertQty: 20, expiryDate: '2027-11-20', location: 'Rayon C-2', requiresPrescription: false },
  { id: '5', name: 'Gaviscon Menthe Flacon', cip: '340093551020', category: 'Gastro-entérologie', buyingPrice: 2.40, sellingPrice: 4.95, quantity: 6, minAlertQty: 10, expiryDate: '2026-06-10', location: 'Rayon D-1', requiresPrescription: false },
  { id: '6', name: 'Dolirhum Maux de Tête', cip: '340093674100', category: 'Rhume / Grippe', buyingPrice: 2.10, sellingPrice: 4.20, quantity: 45, minAlertQty: 15, expiryDate: '2026-06-30', location: 'Rayon A-5', requiresPrescription: false }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Dr. Sophie Martin', role: 'Pharmacien Titulaire', phone: '06 12 34 56 78', email: 's.martin@logpharma.fr', shift: '08:00 - 15:00', status: 'Présent', badgeId: 'BADGE-991', username: 'sophie', password: 'pharma' },
  { id: 'emp-2', name: 'Dr. Thomas Bernard', role: 'Pharmacien Adjoint', phone: '06 87 65 43 21', email: 't.bernard@logpharma.fr', shift: '14:00 - 20:00', status: 'Présent', badgeId: 'BADGE-992', username: 'thomas', password: 'pharma' },
  { id: 'emp-3', name: 'Claire Dubois', role: 'Préparateur', phone: '07 43 25 10 99', email: 'c.dubois@logpharma.fr', shift: '08:30 - 16:30', status: 'Présent', badgeId: 'BADGE-401', username: 'claire', password: 'pharma' },
  { id: 'emp-4', name: 'Julien Moreau', role: 'Stagiaire', phone: '06 55 98 12 43', email: 'j.moreau@logpharma.fr', shift: '09:00 - 17:00', status: 'Absent', badgeId: 'BADGE-110', username: 'julien', password: 'pharma' }
];

const INITIAL_PARTNERS: Partner[] = [
  { id: 'part-1', name: 'Laboratoires Biogaran', contactName: 'Alice Bertrand', phone: '01 40 50 60 70', email: 'commandes@biogaran.fr', category: 'Génériques', dueAmount: 1840.50, invoicesCount: 4, reliability: 'Excellent' },
  { id: 'part-2', name: 'Sanofi France Spécialités', contactName: 'Marc Chevalier', phone: '01 55 66 77 88', email: 'ventes@sanofi.com', category: 'Princeps & Vaccins', dueAmount: 950.00, invoicesCount: 2, reliability: 'Excellent' },
  { id: 'part-3', name: 'Alliance Healthcare Répartiteur', contactName: 'Laurence Durand', phone: '08 20 20 82 20', email: 'support@alliance.fr', category: 'Grossiste Répartiteur', dueAmount: 0.00, invoicesCount: 0, reliability: 'Moyen' }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'cl-1', name: 'Jean Dupont', loyaltyCard: 'FID-55910', phone: '06 11 22 33 44', email: 'jean.dupont@orange.fr', socialSecurityNumber: '1 85 04 75 120 456 12', prescriptionHistory: ['Paracétamol'], loyaltyPoints: 125 },
  { id: 'cl-2', name: 'Marie Laurent', loyaltyCard: 'FID-32104', phone: '06 88 77 66 55', email: 'laurent.marie@wanadoo.fr', socialSecurityNumber: '2 91 10 93 330 987 45', prescriptionHistory: ['Amoxicilline'], loyaltyPoints: 240 }
];

const INITIAL_SALES: Sale[] = [
  { id: 'VTE-940', date: '2026-05-26T09:15:00Z', items: [{ medicineId: '1', name: 'Paracétamol Biogaran 500mg', quantity: 2, price: 2.15 }], clientId: 'cl-1', clientName: 'Jean Dupont', subtotal: '4.30', discount: '0.00', secuRefund: '0.00', totalPaid: '430.50', prescriptionAttached: false, paymentMethod: 'Mobile Money', sellerId: 'emp-1', sellerName: 'Dr. Sophie Martin' },
  { id: 'VTE-939', date: '2026-05-25T14:22:00Z', items: [{ medicineId: '2', name: 'Amoxicilline Sandoz 1g', quantity: 1, price: 5.40 }], clientId: 'cl-2', clientName: 'Marie Laurent', subtotal: '5.40', discount: '0.00', secuRefund: '0.00', totalPaid: '620.80', prescriptionAttached: true, paymentMethod: 'Espèces', sellerId: 'emp-2', sellerName: 'Dr. Thomas Bernard' },
  { id: 'VTE-938', date: '2026-05-24T10:05:00Z', items: [{ medicineId: '3', name: 'Ibuprofène UPSA 400mg', quantity: 3, price: 2.65 }], clientId: 'cl-1', clientName: 'Jean Dupont', subtotal: '7.95', discount: '0.00', secuRefund: '0.00', totalPaid: '180.40', prescriptionAttached: false, paymentMethod: 'Mobile Money', sellerId: 'emp-3', sellerName: 'Claire Dubois' },
  { id: 'VTE-937', date: '2026-05-23T16:45:00Z', items: [{ medicineId: '4', name: 'Spasfon Comprimés', quantity: 1, price: 3.90 }], clientId: 'cl-2', clientName: 'Marie Laurent', subtotal: '3.90', discount: '0.00', secuRefund: '0.00', totalPaid: '380.00', prescriptionAttached: false, paymentMethod: 'Mobile Money', sellerId: 'emp-1', sellerName: 'Dr. Sophie Martin' },
  { id: 'VTE-936', date: '2026-05-22T11:30:00Z', items: [{ medicineId: '1', name: 'Paracétamol Biogaran 500mg', quantity: 5, price: 2.15 }], clientId: 'cl-1', clientName: 'Jean Dupont', subtotal: '10.75', discount: '0.00', secuRefund: '0.00', totalPaid: '512.10', prescriptionAttached: false, paymentMethod: 'Espèces', sellerId: 'emp-2', sellerName: 'Dr. Thomas Bernard' },
  { id: 'VTE-935', date: '2026-05-21T09:50:00Z', items: [{ medicineId: '2', name: 'Amoxicilline Sandoz 1g', quantity: 2, price: 5.40 }], clientId: 'cl-2', clientName: 'Marie Laurent', subtotal: '10.80', discount: '0.00', secuRefund: '0.00', totalPaid: '450.25', prescriptionAttached: true, paymentMethod: 'Mobile Money', sellerId: 'emp-3', sellerName: 'Claire Dubois' },
  { id: 'VTE-934', date: '2026-05-20T15:10:00Z', items: [{ medicineId: '6', name: 'Dolirhum Maux de Tête', quantity: 1, price: 4.20 }], clientId: 'cl-1', clientName: 'Jean Dupont', subtotal: '4.20', discount: '0.00', secuRefund: '0.00', totalPaid: '310.40', prescriptionAttached: false, paymentMethod: 'Mobile Money', sellerId: 'emp-1', sellerName: 'Dr. Sophie Martin' }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
        <p className="font-extrabold text-slate-200">{payload[0].payload.label}</p>
        <p className="text-emerald-400 font-bold">CA : {payload[0].value.toFixed(2)} FCFA</p>
        <p className="text-slate-400">Transactions : {payload[0].payload.ventes}</p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('pharma_medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('pharma_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem('pharma_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('pharma_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('pharma_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  // State sync
  useEffect(() => { localStorage.setItem('pharma_medicines', JSON.stringify(medicines)); }, [medicines]);
  useEffect(() => { localStorage.setItem('pharma_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('pharma_partners', JSON.stringify(partners)); }, [partners]);
  useEffect(() => { localStorage.setItem('pharma_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('pharma_sales', JSON.stringify(sales)); }, [sales]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'stock' | 'personnel' | 'partenaires' | 'clients'>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Modals & form variables
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState<boolean>(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState<boolean>(false);
  const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
  
  const [lastSaleReceipt, setLastSaleReceipt] = useState<Sale | null>(null);
  const [printData, setPrintData] = useState<Sale | null>(null);
  const [printWithdrawMeds, setPrintWithdrawMeds] = useState<Medicine[] | null>(null);
  const [checkedWithdrawIds, setCheckedWithdrawIds] = useState<string[]>([]);

  const handlePrintSale = (sale: Sale) => {
    setPrintWithdrawMeds(null); // Ensure we are not printing both
    setPrintData(sale);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintWithdrawList = (meds: Medicine[]) => {
    setPrintData(null); // Ensure we are not printing both
    setPrintWithdrawMeds(meds);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleWithdrawItems = (medIds: string[]) => {
    if (medIds.length === 0) return;
    const msg = medIds.length === 1 
      ? "Êtes-vous sûr de vouloir retirer ce produit du stock (quantité mise à 0) ?"
      : `Êtes-vous sûr de vouloir de retirer ces ${medIds.length} produits du stock (quantités mises à 0) ?`;
    if (window.confirm(msg)) {
      setMedicines(prevMeds => prevMeds.map(m => {
        if (medIds.includes(m.id)) {
          return { ...m, quantity: 0 };
        }
        return m;
      }));
      // Remove from checklist if withdrew
      setCheckedWithdrawIds(prev => prev.filter(id => !medIds.includes(id)));
      playBeep();
    }
  };

  // --- SALES HISTORY FILTER MODAL ---
  const [showSalesHistoryModal, setShowSalesHistoryModal] = useState<boolean>(false);
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');
  const [historySellerId, setHistorySellerId] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // --- CURRENT USER AUTHENTICATION & SESSION ---
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('pharma_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Pharmacien Titulaire';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pharma_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pharma_current_user');
    }
  }, [currentUser]);

  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');

  // Auto-switch tab on login if activeTab is not allowed for the role
  useEffect(() => {
    if (currentUser) {
      const allowedTabsForRoles: Record<string, string[]> = {
        'Admin': ['dashboard', 'pos', 'stock', 'personnel', 'partenaires', 'clients'],
        'Pharmacien Titulaire': ['dashboard', 'pos', 'stock', 'personnel', 'partenaires', 'clients'],
        'Pharmacien Adjoint': ['pos', 'stock', 'partenaires', 'clients'],
        'Préparateur': ['pos', 'stock', 'clients'],
        'Stagiaire': ['pos', 'clients'],
        'Conseiller': ['pos', 'clients']
      };

      const userRole = currentUser.role || 'Stagiaire';
      const allowed = allowedTabsForRoles[userRole] || ['pos', 'clients'];
      const isAllowed = allowed.includes(activeTab);
      if (!isAllowed) {
        setActiveTab(allowed[0] as any);
      }
    }
  }, [currentUser, activeTab]);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showEditEmpModal, setShowEditEmpModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const setAdminAuth = (authenticated: boolean) => {
    if (!authenticated) {
      setCurrentUser(null);
    } else {
      setCurrentUser({
        id: 'admin-master',
        name: "Directeur de l'Officine",
        role: 'Admin',
        phone: '01 40 50 60 70',
        email: 'admin@logpharma.fr',
        shift: 'Général',
        status: 'Présent',
        badgeId: 'SUPER-ADMIN',
        username: 'admin',
        password: 'pharma'
      });
    }
  };

  // Filters stock
  const [stockSearch, setStockSearch] = useState<string>('');
  const [stockCapFilter, setStockCapFilter] = useState<string>('Tous');
  const [stockAlertFilter, setStockAlertFilter] = useState<boolean>(false);

  // POS / Cash Register
  const [posSearch, setPosSearch] = useState<string>('');
  const [activeCart, setActiveCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isPrescriptionSale, setIsPrescriptionSale] = useState<boolean>(false);
  const [standardRefundRate] = useState<number>(65);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics
  const stockValueVal = medicines.reduce((sum, med) => sum + (med.quantity * med.sellingPrice), 0);
  const lowStockItems = medicines.filter(med => med.quantity <= med.minAlertQty);
  const soonExpiredMedicinesCount = medicines.filter(med => {
    const d = new Date(med.expiryDate);
    const today = new Date('2026-05-26');
    const diff = d.getTime() - today.getTime();
    return diff > 0 && diff <= (45 * 24 * 60 * 60 * 1000);
  }).length;

  const expiringSoon30Days = useMemo(() => {
    return medicines.filter(med => {
      if (!med.expiryDate) return false;
      const d = new Date(med.expiryDate);
      const today = new Date('2026-05-26');
      const diff = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diff / (24 * 60 * 60 * 1000));
      return diffDays <= 30;
    });
  }, [medicines]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (historyStartDate) {
        const start = new Date(historyStartDate + 'T00:05:00');
        // Subtract or compare with start of the day
        const saleDateObj = new Date(s.date);
        const startOfFilter = new Date(`${historyStartDate}T00:00:00`);
        if (saleDateObj < startOfFilter) return false;
      }
      if (historyEndDate) {
        const endOfFilter = new Date(`${historyEndDate}T23:59:59`);
        if (new Date(s.date) > endOfFilter) return false;
      }
      if (historySellerId !== 'all') {
        const matchId = s.sellerId === historySellerId;
        const emp = employees.find(e => e.id === historySellerId);
        const matchName = emp ? s.sellerName === emp.name : false;
        if (!matchId && !matchName) return false;
      }
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const matchesRef = s.id.toLowerCase().includes(q);
        const matchesClient = s.clientName?.toLowerCase().includes(q);
        const matchesMed = s.items.some(it => it.name.toLowerCase().includes(q));
        if (!matchesRef && !matchesClient && !matchesMed) return false;
      }
      return true;
    });
  }, [sales, historyStartDate, historyEndDate, historySellerId, historySearchQuery, employees]);

  const activeStaff = employees.filter(emp => emp.status === 'Présent' && !emp.suspended).length;
  const todaySalesVal = sales
    .filter(s => s.date.startsWith('2026-05-26'))
    .reduce((sum, s) => sum + parseFloat(s.totalPaid), 0);

  // Dynamic 7-day metric calculation with proper fallback rendering 
  const last7DaysData = useMemo(() => {
    const baseDate = new Date('2026-05-26');
    const data = [];
    
    const fallbacks: Record<string, number> = {
      '2026-05-20': 310.40,
      '2026-05-21': 420.75,
      '2026-05-22': 490.60,
      '2026-05-23': 340.90,
      '2026-05-24': 180.30,
      '2026-05-25': 620.50,
      '2026-05-26': 430.50,
    };
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      let totalAmount = daySales.reduce((sum, s) => sum + parseFloat(s.totalPaid), 0);
      let orderCount = daySales.length;
      
      if (totalAmount === 0 || (totalAmount < 10 && dateStr !== '2026-05-26')) {
        totalAmount = fallbacks[dateStr] || (150 + Math.random() * 200);
        orderCount = daySales.length || Math.floor(3 + Math.random() * 5);
      } else if (dateStr === '2026-05-26' && totalAmount < 10) {
        totalAmount = 430.50 + totalAmount;
        orderCount = orderCount || 4;
      }
      
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      
      data.push({
        date: dateStr,
        label: dayLabel,
        montant: parseFloat(totalAmount.toFixed(2)),
        ventes: orderCount,
      });
    }
    return data;
  }, [sales]);

  // POS Add Item
  const handleAddToCart = (med: Medicine) => {
    if (med.quantity <= 0) {
      alert("Ce produit est actuellement en rupture de stock.");
      return;
    }
    playBeep();
    const idx = activeCart.findIndex(item => item.medicine.id === med.id);
    if (idx > -1) {
      const currentQty = activeCart[idx].quantity;
      if (currentQty >= med.quantity) {
        alert("Action impossible: quantité en caisse supérieure au stock réel.");
        return;
      }
      const updated = [...activeCart];
      updated[idx].quantity += 1;
      setActiveCart(updated);
    } else {
      setActiveCart([...activeCart, { medicine: med, quantity: 1, refundedBySecu: med.requiresPrescription ? standardRefundRate : 0 }]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    const target = activeCart.find(it => it.medicine.id === id);
    if (!target) return;
    const nextQty = target.quantity + delta;
    if (nextQty <= 0) {
      setActiveCart(activeCart.filter(it => it.medicine.id !== id));
      return;
    }
    if (nextQty > target.medicine.quantity) {
      alert(`Le stock disponible de ce médicament est limité à ${target.medicine.quantity} boîtes.`);
      return;
    }
    playBeep();
    setActiveCart(activeCart.map(it => it.medicine.id === id ? { ...it, quantity: nextQty } : it));
  };

  const handleCheckout = (payment: string) => {
    if (activeCart.length === 0) {
      alert("Le panier de vente est vide.");
      return;
    }

    let subtotal = 0;
    let secuRefund = 0;
    activeCart.forEach(item => {
      const lineTotal = item.medicine.sellingPrice * item.quantity;
      subtotal += lineTotal;
      if (isPrescriptionSale) {
        secuRefund += lineTotal * (item.refundedBySecu / 100);
      }
    });

    const clientObj = clients.find(c => c.id === selectedClientId);
    const discount = (clientObj && clientObj.loyaltyPoints > 100) ? 2.50 : 0.00;
    const finalAmount = Math.max(0, subtotal - secuRefund - discount);

    const saleId = `VTE-${Math.floor(100 + Math.random() * 900)}`;
    const newSale: Sale = {
      id: saleId,
      date: new Date().toISOString(),
      items: activeCart.map(item => ({
        medicineId: item.medicine.id,
        name: item.medicine.name,
        quantity: item.quantity,
        price: item.medicine.sellingPrice
      })),
      clientId: selectedClientId || undefined,
      clientName: clientObj ? clientObj.name : "Client de Passage",
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      secuRefund: secuRefund.toFixed(2),
      totalPaid: finalAmount.toFixed(2),
      prescriptionAttached: isPrescriptionSale,
      paymentMethod: payment,
      sellerId: currentUser?.id || undefined,
      sellerName: currentUser?.name || "Collaborateur"
    };

    // Stock deduction & client loyalty increment
    setMedicines(prevMeds => prevMeds.map(m => {
      const match = activeCart.find(it => it.medicine.id === m.id);
      return match ? { ...m, quantity: Math.max(0, m.quantity - match.quantity) } : m;
    }));

    if (clientObj) {
      setClients(prevClients => prevClients.map(c => {
        if (c.id === clientObj.id) {
          return {
            ...c,
            loyaltyPoints: c.loyaltyPoints + Math.floor(subtotal),
            prescriptionHistory: Array.from(new Set([...c.prescriptionHistory, ...activeCart.map(item => item.medicine.name.split(' ')[0])]))
          };
        }
        return c;
      }));
    }

    setSales([newSale, ...sales]);
    setLastSaleReceipt(newSale);
    setActiveCart([]);
    setSelectedClientId('');
    setIsPrescriptionSale(false);
    playBeep();
  };

  const handleQuickReplenish = (medId: string, amount: number) => {
    setMedicines(prev => prev.map(m => m.id === medId ? { ...m, quantity: m.quantity + amount } : m));
    playBeep();
  };

  const submitMedicine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: data.get('name') as string,
      cip: (data.get('cip') as string) || Math.floor(340090000000 + Math.random() * 999999).toString(),
      category: data.get('category') as string,
      buyingPrice: parseFloat(data.get('buyingPrice') as string) || 1.00,
      sellingPrice: parseFloat(data.get('sellingPrice') as string) || 2.50,
      quantity: parseInt(data.get('quantity') as string) || 20,
      minAlertQty: parseInt(data.get('minAlertQty') as string) || 10,
      expiryDate: data.get('expiryDate') as string || '2028-01-01',
      location: data.get('location') as string || 'Contoir principal',
      requiresPrescription: data.get('requiresPrescription') === 'true'
    };
    setMedicines([newMed, ...medicines]);
    setShowAddMedModal(false);
  };

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'pharma') {
      setAdminAuth(true);
      setAdminLoginError('');
      setShowAdminLoginModal(false);
      setAdminUsername('');
      setAdminPassword('');
      playBeep();
    } else {
      setAdminLoginError('Identifiants incorrects. Saisissez "admin" et "pharma".');
    }
  };

  const handleToggleSuspendEmployee = (empId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return { ...emp, suspended: !emp.suspended };
      }
      return emp;
    }));
    playBeep();
  };

  const handleDeleteEmployee = (empId: string) => {
    if (confirm("Confirmez-vous la suppression définitive de ce collaborateur ?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== empId));
      playBeep();
    }
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setShowEditEmpModal(true);
  };

  const submitEditEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const data = new FormData(e.currentTarget);
    const updatedEmp: Employee = {
      ...editingEmployee,
      name: data.get('name') as string,
      role: data.get('role') as any,
      phone: data.get('phone') as string,
      email: data.get('email') as string,
      shift: data.get('shift') as string,
      status: data.get('status') as any,
      username: data.get('username') as string || editingEmployee.username || '',
      password: data.get('password') as string || editingEmployee.password || '',
    };
    setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? updatedEmp : emp));
    setShowEditEmpModal(false);
    setEditingEmployee(null);
    playBeep();
  };

  const allowedTabsForRoles: Record<string, string[]> = {
    'Admin': ['dashboard', 'pos', 'stock', 'personnel', 'partenaires', 'clients'],
    'Pharmacien Titulaire': ['dashboard', 'pos', 'stock', 'personnel', 'partenaires', 'clients'],
    'Pharmacien Adjoint': ['pos', 'stock', 'partenaires', 'clients'],
    'Préparateur': ['pos', 'stock', 'clients'],
    'Stagiaire': ['pos', 'clients'],
    'Conseiller': ['pos', 'clients']
  };

  const userRole = currentUser?.role || 'Stagiaire';
  const isTabAuthorized = allowedTabsForRoles[userRole]?.includes(activeTab);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 antialiased font-sans text-slate-200" style={{ backgroundImage: 'radial-gradient(circle at top right, #022c22, #042f1a, #070f0e)' }}>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="max-w-md w-full space-y-6">
            
            {/* Logo brand block */}
            <div className="text-center space-y-2">
              <div className="bg-emerald-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-lg text-3xl mx-auto border-2 border-emerald-400">
                +
              </div>
              <h1 className="text-3xl font-black tracking-wider text-white">LOG PHARMA</h1>
              <p className="text-xs text-emerald-400 tracking-widest uppercase font-bold">Système Pro de Gestion d'Officine</p>
              <div className="h-0.5 w-12 bg-emerald-500 mx-auto rounded mt-3"></div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              setLoginErrorMsg('');
              const u = loginUsername.trim().toLowerCase();
              const p = loginPassword;

              if (!u || !p) {
                setLoginErrorMsg('Veuillez remplir tous les champs.');
                return;
              }

              if (u === 'admin' && p === 'pharma') {
                setCurrentUser({
                  id: 'admin-master',
                  name: "Directeur de l'Officine",
                  role: 'Admin',
                  phone: '01 40 50 60 70',
                  email: 'admin@logpharma.fr',
                  shift: 'Général',
                  status: 'Présent',
                  badgeId: 'SUPER-ADMIN',
                  username: 'admin',
                  password: 'pharma'
                });
                playBeep();
                return;
              }

              const found = employees.find(emp => emp.username && emp.username.toLowerCase().trim() === u && emp.password === p);
              if (found) {
                if (found.suspended) {
                  setLoginErrorMsg('Ce compte a été suspendu par l\'administration.');
                  return;
                }
                const updated = { ...found, status: 'Présent' as const };
                setEmployees(prev => prev.map(e => e.id === found.id ? updated : e));
                setCurrentUser(updated);
                playBeep();
              } else {
                setLoginErrorMsg('Identifiant ou mot de passe incorrect.');
              }
            }} className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 border border-emerald-800/50 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-center text-slate-100 border-b border-emerald-900/40 pb-3">
                🔐 Connexion Collaborateur
              </h3>

              {loginErrorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{loginErrorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Identifiant de connexion</label>
                <input 
                  required 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-950 p-3 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold text-sm" 
                  placeholder="sophie, claire, julien..." 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mot de passe</label>
                <input 
                  required 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-950 p-3 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-bold text-sm tracking-widest" 
                  placeholder="••••••••" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-md transition-all uppercase text-xs tracking-wider cursor-pointer active:scale-98"
              >
                S'authentifier
              </button>
            </form>

            {/* Quick Demonstration login helper box */}
            <div className="bg-slate-950/65 backdrop-blur-xs border border-teal-900/20 rounded-2xl p-4.5 space-y-2.5">
              <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                🔑 Identifiants de test (Comptes configurés) :
              </h4>
              <p className="text-[10px] text-slate-400">
                Chaque type de compte créé a uniquement accès aux fonctionnalités de sa fiche de poste :
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button 
                  type="button" 
                  onClick={() => { setLoginUsername('admin'); setLoginPassword('pharma'); }}
                  className="bg-emerald-950/20 hover:bg-emerald-900/35 border border-emerald-900/40 p-2 rounded-lg text-left text-emerald-200 font-semibold flex justify-between items-center transition-colors"
                >
                  <span>1. Administrateur</span>
                  <span className="text-[8px] bg-emerald-900 text-emerald-300 px-1 py-0.5 rounded font-black">Admin</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setLoginUsername('sophie'); setLoginPassword('pharma'); }}
                  className="bg-emerald-950/20 hover:bg-emerald-900/35 border border-emerald-900/40 p-2 rounded-lg text-left text-emerald-200 font-semibold flex justify-between items-center transition-colors"
                >
                  <span>2. Sophie (Titulaire)</span>
                  <span className="text-[8px] bg-emerald-900 text-emerald-300 px-1 py-0.5 rounded font-black">Titulaire</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setLoginUsername('thomas'); setLoginPassword('pharma'); }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2 rounded-lg text-left text-teal-200 font-semibold flex justify-between items-center transition-colors"
                >
                  <span>3. Thomas (Adjoint)</span>
                  <span className="text-[8px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-black">Adjoint</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setLoginUsername('claire'); setLoginPassword('pharma'); }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2 rounded-lg text-left text-teal-200 font-semibold flex justify-between items-center transition-colors"
                >
                  <span>4. Claire (Préparateur)</span>
                  <span className="text-[8px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-black">Préparateur</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setLoginUsername('julien'); setLoginPassword('pharma'); }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2 rounded-lg text-left text-teal-200 font-semibold flex justify-between items-center transition-colors col-span-2"
                >
                  <span>5. Julien Moreau (Stagiaire)</span>
                  <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black">Stagiaire</span>
                </button>
              </div>
            </div>

          </div>
        </div>
        
        <div className="text-center text-[10px] text-slate-500 font-medium pb-2 border-t border-emerald-950/30 pt-2">
          LOG PHARMA • Système Pro de Gestion d'Officine • Connexion habilitée par poste.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans print:hidden">
      
      {/* BRAND HEADER */}
      <header className="bg-emerald-950 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-md text-lg">
              +
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-emerald-300">LOG PHARMA</h1>
              <p className="text-[10px] text-emerald-100/70 tracking-widest uppercase font-bold">Système Pro de Gestion d'Officine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-800 rounded-lg px-3 py-1 text-xs text-emerald-200">
              <Clock size={13} className="text-emerald-400" />
              <span>{currentTime || "Chargement..."}</span>
            </div>
            <div className="text-right border-l border-emerald-800 pl-4 flex items-center gap-3 text-xs">
              <div>
                <span className="block text-emerald-300 font-bold text-[10px] uppercase">
                  🔑 {currentUser?.role || "Poste"}
                </span>
                <span className="font-semibold text-white">
                  {currentUser?.name || "Collaborateur"}
                </span>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => { playBeep(); setCurrentUser(null); }}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] text-white transition-all shadow-sm select-none cursor-pointer"
                  title="Se déconnecter"
                >
                  <Lock size={12} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION BAR */}
        <div className="bg-emerald-900 border-t border-emerald-800">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
            <nav className="flex space-x-1 py-1">
              {[
                { id: 'dashboard', label: 'Tableau de Bord', icon: Activity, roles: ['Admin', 'Pharmacien Titulaire'] },
                { id: 'pos', label: 'Caisse de Vente', icon: ShoppingCart, roles: ['Admin', 'Pharmacien Titulaire', 'Pharmacien Adjoint', 'Préparateur', 'Stagiaire', 'Conseiller'] },
                { id: 'stock', label: 'Stocks & Produits', icon: Package, roles: ['Admin', 'Pharmacien Titulaire', 'Pharmacien Adjoint', 'Préparateur'] },
                { id: 'personnel', label: 'Personnel & Gardes', icon: Users, roles: ['Admin', 'Pharmacien Titulaire'] },
                { id: 'partenaires', label: 'Laboratoires & Tiers', icon: Building2, roles: ['Admin', 'Pharmacien Titulaire', 'Pharmacien Adjoint'] },
                { id: 'clients', label: 'Clients & Patients', icon: Heart, roles: ['Admin', 'Pharmacien Titulaire', 'Pharmacien Adjoint', 'Préparateur', 'Stagiaire', 'Conseiller'] },
              ].filter(tab => !currentUser || tab.roles.includes(currentUser.role)).map((tab) => {
                const Icon = tab.icon;
                const statusActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { playBeep(); setActiveTab(tab.id as any); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      statusActive 
                        ? 'bg-emerald-950 text-emerald-400 border-b-2 border-emerald-400' 
                        : 'text-emerald-100 hover:bg-emerald-850 hover:text-emerald-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* CORE VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {!isTabAuthorized ? (
          <div className="bg-white rounded-xl shadow-md border p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <div className="bg-rose-50 text-rose-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-2xl font-black">
              🛑
            </div>
            <h3 className="text-lg font-extrabold text-slate-950">Accès restreint à votre poste</h3>
            <p className="text-xs text-slate-500">Votre poste actuel (<strong>{currentUser?.role || "Stagiaire"}</strong>) n'a pas les droits d'accès requis pour consulter cette section. Veuillez contacter un administrateur ou un pharmacien titulaire.</p>
            <button onClick={() => { playBeep(); setActiveTab('pos'); }} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors">
              Consulter la Caisse de Vente
            </button>
          </div>
        ) : (
          <>

        {/* --- TABS 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chiffre d'Affaires</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">{todaySalesVal.toFixed(2)} FCFA</span>
                  <span className="text-xs text-emerald-600 font-bold block mt-1">✓ Ventes directes d'aujourd'hui</span>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg"><CreditCard size={24} /></div>
              </div>

              <div className="bg-white p-4.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Produits en Rupture</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">{lowStockItems.length}</span>
                  <span className="text-xs text-red-500 font-bold block mt-1">⚠️ Seuil minimal franchi</span>
                </div>
                <div className="bg-amber-50 text-amber-600 p-3 rounded-lg"><AlertTriangle size={24} /></div>
              </div>

              <div className="bg-white p-4.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Effectif en Service</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">{activeStaff} / {employees.length}</span>
                  <span className="text-xs text-teal-600 font-bold block mt-1">👥 Actuellement branchés</span>
                </div>
                <div className="bg-teal-50 text-teal-600 p-3 rounded-lg"><Users size={24} /></div>
              </div>

              <div className="bg-white p-4.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capital Stock Officinal</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">{stockValueVal.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} FCFA</span>
                  <span className="text-xs text-sky-600 font-bold block mt-1">📦 Total matières solides</span>
                </div>
                <div className="bg-sky-50 text-sky-600 p-3 rounded-lg"><Package size={24} /></div>
              </div>
            </div>

            {/* GRAPHIQUE ÉVOLUTION DES VENTES DES 7 DERNIERS JOURS */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-50">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600 animate-pulse" />
                    <span>Évolution de l'Activité Graphique des Ventes (7 derniers jours)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Chiffre d'Affaires quotidien cumulé en F CFA (FCFA)</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  <span>Mise à jour automatique en temps réel</span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={last7DaysData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false}
                      stroke="#64748b" 
                      fontSize={11}
                      fontWeight="600"
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      stroke="#64748b" 
                      fontSize={11}
                      fontWeight="600"
                      tickFormatter={(val) => `${val} FCFA`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="montant" 
                      name="Chiffre d'Affaires"
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#salesGrad)" 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ALERTE DE PÉREMPTION CLINIQUE & DISPENSATION CONFORME (< 30 JOURS) */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-50">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    <span className="text-rose-600 font-extrabold uppercase tracking-wide text-xs">Alerte de Péremption Clinique (≤ 30 jours)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Contrôle de sécurité sanitaire : produits périmés ou proches du seuil de péremption légale d'un mois.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={expiringSoon30Days.length === 0}
                    onClick={() => { playBeep(); handlePrintWithdrawList(expiringSoon30Days); }}
                    className="bg-slate-900 hover:bg-slate-950 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Générer la Liste de Retrait (PDF)</span>
                  </button>
                  <button
                    type="button"
                    disabled={expiringSoon30Days.length === 0}
                    onClick={() => { 
                      const idsToWithdraw = checkedWithdrawIds.length > 0 ? checkedWithdrawIds : expiringSoon30Days.map(m => m.id);
                      handleWithdrawItems(idsToWithdraw);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>
                      {checkedWithdrawIds.length > 0 
                        ? `Retirer Sélection (${checkedWithdrawIds.length})` 
                        : "Tout Écarter du Stock"}
                    </span>
                  </button>
                </div>
              </div>

              {expiringSoon30Days.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 border border-slate-100/50 rounded-xl space-y-2">
                  <div className="text-3xl">🛡️</div>
                  <h4 className="text-xs font-bold text-slate-800">Aucun médicament en danger de péremption imminente</h4>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">Toutes les références d'officine disposent de dates conformes aux règlementations de dispensation de sécurité.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
                          <th className="py-2.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={checkedWithdrawIds.length === expiringSoon30Days.length && expiringSoon30Days.length > 0}
                              onChange={(e) => {
                                playBeep();
                                if (e.target.checked) {
                                  setCheckedWithdrawIds(expiringSoon30Days.map(m => m.id));
                                } else {
                                  setCheckedWithdrawIds([]);
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Tout cocher / décocher"
                            />
                          </th>
                          <th className="py-2.5 px-3">Désignation Produit</th>
                          <th className="py-2.5 px-3 font-mono">Code CIP</th>
                          <th className="py-2.5 px-3">Emplacement / Rayon</th>
                          <th className="py-2.5 px-3 text-center">Stock restant</th>
                          <th className="py-2.5 px-3">Date d'Expiration</th>
                          <th className="py-2.5 px-3 text-right">Statut / Échéance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {expiringSoon30Days.map(med => {
                          const isChecked = checkedWithdrawIds.includes(med.id);
                          const d = new Date(med.expiryDate);
                          const today = new Date('2026-05-26');
                          const diff = d.getTime() - today.getTime();
                          const diffDays = Math.ceil(diff / (24 * 60 * 60 * 1000));
                          const isExpired = diffDays <= 0;

                          return (
                            <tr 
                              key={med.id} 
                              className={`transition-colors hover:bg-slate-50/50 ${isChecked ? 'bg-slate-50 opacity-70 line-through decoration-slate-400' : ''}`}
                            >
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    playBeep();
                                    if (isChecked) {
                                      setCheckedWithdrawIds(prev => prev.filter(id => id !== med.id));
                                    } else {
                                      setCheckedWithdrawIds(prev => [...prev, med.id]);
                                    }
                                  }}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-900">{med.name}</td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{med.cip}</td>
                              <td className="py-3 px-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                  📂 {med.location || 'Non défini'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`font-black ${med.quantity === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                                  {med.quantity} boîte{med.quantity > 1 ? 's' : ''}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-semibold">
                                {d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {isExpired ? (
                                  <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                    🔴 Périmé depuis {Math.abs(diffDays)}j
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                    🟡 Expire dans {diffDays}j
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 border-dashed">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block"></span>
                      <span>Cochez les produits après retrait physique de l'étagère pour les écarter du stock informatique en un clic.</span>
                    </span>
                    {checkedWithdrawIds.length > 0 && (
                      <span className="font-bold text-rose-600">
                        {checkedWithdrawIds.length} produit{checkedWithdrawIds.length > 1 ? 's sélectionnés' : ' sélectionné'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ACCÈS CAISSE EXPRESS */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between h-72">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-3">
                    <ShoppingCart size={16} className="text-emerald-600" />
                    <span>Facturation Rapide (Ventes)</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Une caisse moderne de dispensation de médicaments conforme à l'assurance maladie, permettant le Tiers-Payant automatique et la mise à jour des stocks en direct.
                  </p>
                </div>
                <button 
                  onClick={() => { playBeep(); setActiveTab('pos'); }}
                  className="w-full bg-emerald-700 hover:bg-emerald-930 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Ouvrir la Caisse Enregistreuse</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* STOCKS ALERTES */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span>Réapprovisionnement Urgent Requis</span>
                  </h3>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {lowStockItems.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Aucun produit ne requiert de commande auprès des fournisseurs.</p>
                    ) : (
                      lowStockItems.map(m => (
                        <div key={m.id} className="p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between text-xs text-red-900">
                          <div>
                            <strong className="block text-slate-900 text-xs font-bold">{m.name}</strong>
                            <span>Quantité actuelle : {m.quantity} boîtes (Alerte min : {m.minAlertQty})</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleQuickReplenish(m.id, 20)} className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded">Réapprovisionner +20</button>
                            <button onClick={() => handleQuickReplenish(m.id, 50)} className="bg-slate-800 text-white font-bold px-2.5 py-1 rounded">Commander +50</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 mt-4 border-t border-slate-55 pt-3">
                  ⚠️ <strong>{soonExpiredMedicinesCount}</strong> produits expirent dans les 45 prochains jours. Veillez à les éconduire du stock si nécessaire.
                </div>
              </div>
            </div>

            {/* SALES LOG ON HOME */}
            <div className="bg-white p-5 rounded-xl border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Journal d'Activité Récent des Ventes</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Aperçu en temps réel des dernières transactions enregistrées en officine.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { playBeep(); setShowSalesHistoryModal(true); }}
                  className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Search size={12} />
                  <span>🔍 Filtrer & Historique Complet</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase py-2">
                      <th className="py-2.5 px-3">Réf Vente</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Bénéficiaire</th>
                      <th className="py-2.5 px-3">Articles</th>
                      <th className="py-2.5 px-3 text-center">Ordonnance</th>
                      <th className="py-2.5 px-3 text-right">Net payé</th>
                      <th className="py-2.5 px-3 text-center">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.slice(0, 5).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{s.id}</td>
                        <td className="py-2 px-3 text-slate-500">{new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2 px-3 font-semibold">{s.clientName}</td>
                        <td className="py-2 px-3 text-slate-600">{s.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.prescriptionAttached ? 'bg-teal-100 text-teal-850' : 'bg-slate-100 text-slate-500'}`}>
                            {s.prescriptionAttached ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-800">{s.totalPaid} FCFA</td>
                        <td className="py-2 px-3 text-center">
                          <button 
                            type="button" 
                            onClick={() => { playBeep(); handlePrintSale(s); }}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Imprimer ou générer une Facture PDF"
                          >
                            <Printer size={11} />
                            <span>Facture PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TABS 2: CAISSE ENREGISTREUSE (POS) --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Catalog search/select */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalogue Dispensation Caisse</span>
                  <div className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Nom ou CIP du médicament..."
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
                {medicines
                  .filter(m => m.name.toLowerCase().includes(posSearch.toLowerCase()) || m.cip.includes(posSearch))
                  .map(m => {
                    const isOutOfStock = m.quantity <= 0;
                    return (
                      <div 
                        key={m.id}
                        onClick={() => !isOutOfStock && handleAddToCart(m)}
                        className={`bg-white p-4 rounded-xl border flex flex-col justify-between h-32 transition-all ${
                          isOutOfStock 
                            ? 'opacity-40 bg-slate-100 cursor-not-allowed border-slate-200' 
                            : 'hover:border-emerald-500 cursor-pointer shadow-sm border-slate-100'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-bold text-slate-900 block truncate">{m.name}</span>
                            {m.requiresPrescription && (
                              <span className="bg-red-50 text-red-700 text-[8px] font-extrabold px-1.5 py-0.2 rounded border border-red-200 uppercase whitespace-nowrap">Ordo</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">CIP: {m.cip}</span>
                        </div>

                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-semibold text-slate-500">Stock restant : {m.quantity} b.</span>
                          <span className="text-md font-black text-emerald-800">{m.sellingPrice.toFixed(2)} FCFA</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Checkout shopping cart */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                    <ShoppingCart size={15} />
                    <span>Panier Actif</span>
                  </h3>
                  <button 
                    onClick={() => setActiveCart([])}
                    className="text-xs text-red-500 hover:underline font-bold"
                    disabled={activeCart.length === 0}
                  >
                    Vider
                  </button>
                </div>

                {/* Patient filter */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Associer un Patient</label>
                  <select 
                    value={selectedClientId} 
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="block w-full bg-white border border-slate-300 rounded text-xs p-1.5 focus:outline-emerald-500"
                  >
                    <option value="">-- Client de passage anonyme --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.loyaltyCard} - {c.loyaltyPoints} pts)</option>
                    ))}
                  </select>
                </div>

                {/* Prescription Checkbox */}
                <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between mb-4 border border-emerald-100">
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block">Sur ordonnance ou ALD</span>
                    <span className="text-[10px] text-emerald-700">Soumet la facturation au Tiers-Payant</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={isPrescriptionSale}
                    onChange={(e) => setIsPrescriptionSale(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Cart rows */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCart.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-10">Sélectionnez des boîtes à gauche.</p>
                  ) : (
                    activeCart.map(item => (
                      <div key={item.medicine.id} className="p-2 bg-slate-55 border border-slate-150 rounded-lg flex items-center justify-between gap-2 text-xs">
                        <div className="flex-1 truncate">
                          <span className="font-bold text-slate-900 block truncate">{item.medicine.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.medicine.sellingPrice.toFixed(2)} FCFA</span>
                        </div>
                        <div className="flex items-center bg-white border rounded">
                          <button onClick={() => updateCartQty(item.medicine.id, -1)} className="px-2 py-0.5 text-slate-550 text-xs font-bold">-</button>
                          <span className="px-1 text-slate-900 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.medicine.id, 1)} className="px-2 py-0.5 text-slate-550 text-xs font-bold">+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total commande</span>
                  <span className="font-mono">
                    {activeCart.reduce((sum, item) => sum + (item.medicine.sellingPrice * item.quantity), 0).toFixed(2)} FCFA
                  </span>
                </div>

                {isPrescriptionSale && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Part Tiers Payant Sécu ({standardRefundRate}%)</span>
                    <span className="font-mono">
                      - {activeCart.reduce((sum, item) => sum + (item.medicine.sellingPrice * item.quantity * (item.refundedBySecu / 100)), 0).toFixed(2)} FCFA
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t">
                  <span>Reste à payer</span>
                  <span className="text-emerald-850 font-mono">
                    {(() => {
                      const totalVal = activeCart.reduce((sum, item) => sum + (item.medicine.sellingPrice * item.quantity), 0);
                      const secuRem = isPrescriptionSale ? activeCart.reduce((sum, item) => sum + (item.medicine.sellingPrice * item.quantity * (item.refundedBySecu / 100)), 0) : 0;
                      return Math.max(0, totalVal - secuRem).toFixed(2);
                    })()} FCFA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button onClick={() => handleCheckout('Mobile Money')} disabled={activeCart.length === 0} className="bg-emerald-700 hover:bg-emerald-950 text-white font-bold py-2.5 rounded text-xs select-none disabled:opacity-40">📲 Mobile Money</button>
                  <button onClick={() => handleCheckout('Espèces')} disabled={activeCart.length === 0} className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 rounded text-xs select-none disabled:opacity-40">💵 Régler en Espèces</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- TABS 3: INVENTORY/STOCKS MANAGEMENT --- */}
        {activeTab === 'stock' && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-slate-900 block">Registre Complet de Pharmacie (Inventaire)</h3>
                <p className="text-xs text-slate-400">Modifier les fiches CIP, les emplacements de rangement ou ajouter des références.</p>
              </div>
              <button onClick={() => setShowAddMedModal(true)} className="bg-emerald-700 hover:bg-emerald-900 text-white font-bold py-2 px-3 rounded text-xs flex items-center gap-1">
                <Plus size={14} />
                <span>Ajouter un Médicament</span>
              </button>
            </div>

            {/* Quick search and filter bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
              <div className="flex gap-1.5 w-full">
                <input 
                  type="text" 
                  placeholder="Filtrer par nom ou CIP..." 
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="bg-white border p-1.5 rounded focus:outline-emerald-600 flex-1"
                />
              </div>
              <select 
                value={stockCapFilter} 
                onChange={(e) => setStockCapFilter(e.target.value)}
                className="bg-white border p-1.5 rounded"
              >
                <option value="Tous">Tous les groupes</option>
                <option value="Antalgique">Antalgiques</option>
                <option value="Antibiotique">Antibiotiques</option>
                <option value="Anti-inflammatoire">Anti-inflammatoires</option>
                <option value="Rhume / Grippe">Rhume / Grippe</option>
                <option value="Cardiologie">Cardiologie</option>
              </select>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={stockAlertFilter} 
                  onChange={(e) => setStockAlertFilter(e.target.checked)} 
                  id="stock-alert-box"
                  className="cursor-pointer"
                />
                <label htmlFor="stock-alert-box" className="cursor-pointer">Alerte rupture seulement</label>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="p-3">CODE CIP</th>
                    <th className="p-3">Médicament</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3 text-center">Régime</th>
                    <th className="p-3 text-center">Quantité Réelle</th>
                    <th className="p-3 text-right">Prix HT (Achat)</th>
                    <th className="p-3 text-right">Prix TTC (vente)</th>
                    <th className="p-3 text-center">Expiration</th>
                    <th className="p-3">Emplacement</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {medicines
                    .filter(m => {
                      const matName = m.name.toLowerCase().includes(stockSearch.toLowerCase()) || m.cip.includes(stockSearch);
                      const matC = stockCapFilter === 'Tous' || m.category === stockCapFilter;
                      const matA = !stockAlertFilter || (m.quantity <= m.minAlertQty);
                      return matName && matC && matA;
                    })
                    .map(m => {
                      const isLow = m.quantity <= m.minAlertQty;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/70">
                          <td className="p-3 font-mono text-[11px] text-slate-400">{m.cip}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{m.name}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">{m.category}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${m.requiresPrescription ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700'}`}>
                              {m.requiresPrescription ? 'Ordonnance requis' : 'Accès libre'}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">
                            <span className={`px-2 py-1 rounded inline-block ${isLow ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-900'}`}>{m.quantity} b.</span>
                          </td>
                          <td className="p-3 text-right font-mono">{m.buyingPrice.toFixed(2)} FCFA</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-800">{m.sellingPrice.toFixed(2)} FCFA</td>
                          <td className="p-3 text-center font-mono">{m.expiryDate}</td>
                          <td className="p-3">{m.location}</td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => {
                                const newS = prompt(`Nouveau prix de vente TTC pour ${m.name}:`, m.sellingPrice.toString());
                                if (newS) {
                                  const parsed = parseFloat(newS);
                                  if (!isNaN(parsed)) setMedicines(medicines.map(item => item.id === m.id ? { ...item, sellingPrice: parsed } : item));
                                }
                              }}
                              className="text-emerald-700 hover:underline font-bold"
                            >
                              Éditer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TABS 4: PERSONNEL & GARDES --- */}
        {activeTab === 'personnel' && (
          <div className="space-y-4">
            
            {/* Top Admin Status Alert Bar */}
            {!isAdmin ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-xs">
                <div>
                  <div className="flex items-center gap-2 font-black">
                    <Shield size={15} className="text-amber-600 animate-pulse" />
                    <span>ESPACE PERSONNEL : MODE CONSULTATION SEULEMET</span>
                  </div>
                  <p className="text-amber-700/80 mt-1 font-medium">Les contrôles d'ajout, de modification, de suspension et de suppression des fiches du personnel sont réservés à la Direction.</p>
                </div>
                <button 
                  onClick={() => { playBeep(); setShowAdminLoginModal(true); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3 py-1.5 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  🔑 Connexion Administrateur
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-xs">
                <div>
                  <div className="flex items-center gap-2 font-black text-emerald-900">
                    <Shield size={15} className="text-emerald-600" />
                    <span>ESPACE PERSONNEL : MODE ADMINISTRATEUR ACTIF 🛡️</span>
                  </div>
                  <p className="text-emerald-700/90 mt-1 font-medium">Vous disposez maintenant de tous les accès complets : recruter, modifier, suspendre/restaurer l'accès de l'officine et radier définitivement.</p>
                </div>
                <button 
                  onClick={() => { playBeep(); setAdminAuth(false); }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-3 py-1.5 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                  🔒 Déconnexion Admin
                </button>
              </div>
            )}

            <div className="bg-white p-5 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold block text-slate-900">Registre du Personnel Officinal</h3>
                <p className="text-xs text-slate-400">Présence active, grades, horaires de garde et droits administratifs.</p>
              </div>
              <button 
                onClick={() => { 
                  playBeep();
                  if (!isAdmin) {
                    setShowAdminLoginModal(true);
                  } else {
                    setShowAddEmpModal(true); 
                  }
                }} 
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Recruter un Collaborateur</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {employees.map(emp => {
                const isSuspended = !!emp.suspended;
                return (
                  <div 
                    key={emp.id} 
                    className={`bg-white rounded-xl border flex flex-col justify-between transition-all text-xs overflow-hidden ${
                      isSuspended 
                        ? 'border-red-200 bg-red-50/20 shadow-xs ring-1 ring-red-100/50' 
                        : 'border-slate-100 shadow-sm hover:border-slate-200'
                    }`}
                  >
                    {/* Top strip banner if suspended */}
                    {isSuspended && (
                      <div className="bg-red-650 text-white font-black text-[9px] py-1 text-center flex items-center justify-center gap-1 uppercase tracking-wider">
                        <Ban size={10} />
                        <span>Accès suspendu par la direction</span>
                      </div>
                    )}

                    <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isSuspended 
                              ? 'bg-red-100 text-red-800 border-red-200 line-through' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          }`}>
                            {emp.badgeId}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isSuspended
                              ? 'bg-red-100 text-red-800'
                              : emp.status === 'Présent' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : emp.status === 'Absent' 
                                  ? 'bg-slate-100 text-slate-500' 
                                  : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isSuspended ? 'Inactif' : emp.status}
                          </span>
                        </div>

                        <div className={isSuspended ? 'opacity-60' : ''}>
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            {isSuspended && <span className="text-red-600 text-[10px] font-bold">(Suspendu)</span>}
                          </h4>
                          <p className="text-slate-500 font-semibold mt-0.5">{emp.role}</p>
                          <p className="text-slate-400 mt-2 font-medium flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            <span>Garde : {emp.shift}</span>
                          </p>
                        </div>
                      </div>

                      <div className={`pt-3 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 mt-3 ${isSuspended ? 'opacity-60' : ''}`}>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-black uppercase">Téléphone</span>
                          <span className="font-semibold text-slate-700">{emp.phone}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-black uppercase">Email</span>
                          <span className="font-semibold text-slate-700 truncate block" title={emp.email}>{emp.email || 'Néant'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex flex-col gap-2">
                      {/* Non-destructive quick status switch (disabled if suspended) */}
                      {!isSuspended && (
                        <div className="flex justify-between items-center sm:min-h-[24px]">
                          <span className="text-[10px] text-slate-400 font-medium">Présence :</span>
                          <button 
                            onClick={() => {
                              playBeep();
                              setEmployees(employees.map(e => {
                                if (e.id === emp.id) {
                                  const list: ('Présent' | 'Absent' | 'En congé')[] = ['Présent', 'Absent', 'En congé'];
                                  const currIdx = list.indexOf(e.status);
                                  const nextIdx = (currIdx + 1) % list.length;
                                  return { ...e, status: list[nextIdx] };
                                }
                                return e;
                              }));
                            }}
                            className="text-emerald-700 hover:text-white border border-emerald-200 hover:bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Changer Statut
                          </button>
                        </div>
                      )}

                      {/* Admin-only full management controls */}
                      {isAdmin ? (
                        <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/60">
                          <button
                            onClick={() => { playBeep(); handleEditEmployee(emp); }}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 py-1 rounded-md text-[9px] font-extrabold flex items-center justify-center gap-0.5 transition-all cursor-pointer"
                            title="Modifier les informations"
                          >
                            <Edit3 size={10} />
                            <span>Éditer</span>
                          </button>

                          <button
                            onClick={() => { playBeep(); handleToggleSuspendEmployee(emp.id); }}
                            className={`${
                              isSuspended
                                ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-750'
                                : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-750'
                            } py-1 rounded-md text-[9px] font-extrabold flex items-center justify-center gap-0.5 transition-all cursor-pointer`}
                            title={isSuspended ? "Rétablir l'accès" : "Suspendre temporairement"}
                          >
                            <Ban size={10} />
                            <span>{isSuspended ? 'Rétablir' : 'Suspendre'}</span>
                          </button>

                          <button
                            onClick={() => { playBeep(); handleDeleteEmployee(emp.id); }}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-1 rounded-md text-[9px] font-extrabold flex items-center justify-center gap-0.5 transition-all cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={10} />
                            <span>Radier</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-1 bg-slate-100/45 rounded text-slate-400 flex items-center justify-center gap-1">
                          <Lock size={9} />
                          <span className="text-[10px] font-medium uppercase tracking-wider">Accès d'écriture bridé</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* --- TABS 5: PARTNERS & LABORATORIES --- */}
        {activeTab === 'partenaires' && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold block text-slate-900">Achat & Partenariats Laboratoires</h3>
                <p className="text-xs text-slate-400">Suivi des encours financiers et factures grossistes.</p>
              </div>
              <button onClick={() => setShowAddPartnerModal(true)} className="bg-emerald-700 hover:bg-emerald-900 text-white font-bold py-1.5 px-3 rounded text-xs">➕ Nouveau Laboratoire</button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase py-2">
                    <th className="p-3">Raison Sociale</th>
                    <th className="p-3">Négociant Direct</th>
                    <th className="p-3">Filière</th>
                    <th className="p-3 text-center">Indice Fiabilité</th>
                    <th className="p-3 text-right">Invoices Encours</th>
                    <th className="p-3 text-right">Montant dû</th>
                    <th className="p-3 text-right">Régler</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {partners.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="p-3">{p.contactName} ({p.phone})</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3 text-center">⭐ {p.reliability}</td>
                      <td className="p-3 text-center font-bold">{p.invoicesCount} fact.</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">{p.dueAmount.toFixed(2)} FCFA</td>
                      <td className="p-3 text-right">
                        {p.dueAmount > 0 ? (
                          <button onClick={() => {
                            setPartners(partners.map(item => item.id === p.id ? { ...item, dueAmount: 0, invoicesCount: 0 } : item));
                            alert("Transfert bancaire exécuté.");
                          }} className="bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded border">Virement Direct</button>
                        ) : (
                          <span className="text-emerald-700">✓ Soldé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TABS 6: CLIENT FILE --- */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold block text-slate-900"> Patientèle & Carte Vitale</h3>
                <p className="text-xs text-slate-400">Historique d'allergies et points de fidélité accumulés.</p>
              </div>
              <button onClick={() => setShowAddClientModal(true)} className="bg-emerald-700 hover:bg-emerald-900 text-white font-bold py-1.5 px-3 rounded text-xs">➕ Nouveau Dossier Patient</button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase py-2">
                    <th className="p-3">Numéro FID</th>
                    <th className="p-3">Nom du Patient</th>
                    <th className="p-3">N° de Sécurité Sociale</th>
                    <th className="p-3">Coordonnées</th>
                    <th className="p-3 text-center">Points cumulés</th>
                    <th className="p-3">Médicaments récurrents</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {clients.map(cl => (
                    <tr key={cl.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-bold text-emerald-700">{cl.loyaltyCard}</td>
                      <td className="p-3 font-semibold text-slate-900">{cl.name}</td>
                      <td className="p-3 font-mono text-slate-500">{cl.socialSecurityNumber}</td>
                      <td className="p-3">{cl.phone} | {cl.email || 'Aucun e-mail'}</td>
                      <td className="p-3 text-center">
                        <span className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full font-bold">⭐ {cl.loyaltyPoints} pts</span>
                      </td>
                      <td className="p-3 text-slate-500 italic">{cl.prescriptionHistory.join(', ') || 'Néant'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}

      </main>

      {/* FOOTER GENERAL */}
      <footer className="bg-emerald-950 text-white/50 py-5 border-t border-emerald-900 text-center text-[10px]">
        <p>LOG PHARMA Officine v4.1 - Solution validée pour la dispensation dématérialisée.</p>
        <p className="mt-1">© LOG PHARMA. Tous droits réservés. • Développé par <strong className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider">GT NUMERIQUE</strong></p>
      </footer>

      {/* ================= MODALS REGISTRATION FORMS ================= */}

      {/* A. NEW MEDICINE MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={submitMedicine} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 border text-xs space-y-3.5">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Enregistrer un Médicament</h4>
              <button type="button" onClick={() => setShowAddMedModal(false)}><X size={16} /></button>
            </div>
            
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold">Spécialité pharmaceutique *</label>
              <input required type="text" name="name" className="w-full bg-slate-50 border p-2 rounded" placeholder="Doliprane, Spasfon, etc." />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">CIP</label>
                <input type="text" name="cip" className="w-full bg-slate-50 border p-2 rounded" placeholder="34009..." />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Catégorie</label>
                <select name="category" className="w-full bg-slate-50 border p-2 rounded">
                  <option value="Antalgique">Antalgique</option>
                  <option value="Antibiotique">Antibiotique</option>
                  <option value="Anti-inflammatoire">Anti-inflammatoire</option>
                  <option value="Rhume / Grippe">Rhume / Grippe</option>
                  <option value="Cardiologie">Cardiologie</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">Prix Achat HT</label>
                <input step="0.01" type="number" name="buyingPrice" className="w-full bg-slate-50 border p-2 rounded" placeholder="2.10" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Prix Vente TTC *</label>
                <input required step="0.01" type="number" name="sellingPrice" className="w-full bg-slate-50 border p-2 rounded" placeholder="4.50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">Stock Initial *</label>
                <input required type="number" name="quantity" className="w-full bg-slate-50 border p-2 rounded" placeholder="100" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Seuil Alerte Min *</label>
                <input required type="number" name="minAlertQty" className="w-full bg-slate-50 border p-2 rounded" defaultValue="15" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">Expiration *</label>
                <input required type="date" name="expiryDate" className="w-full bg-slate-50 border p-2 rounded" defaultValue="2027-12-31" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Emplacement *</label>
                <input required type="text" name="location" className="w-full bg-slate-50 border p-2 rounded" placeholder="Rayon A-1" />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-bold">Soumis à Prescription</label>
              <select name="requiresPrescription" className="w-full bg-slate-50 border p-2 rounded">
                <option value="false">Non (Vente libre)</option>
                <option value="true">Oui (Ordonnance obligatoire)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t text-[11px]">
              <button type="button" onClick={() => setShowAddMedModal(false)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded">Annuler</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded font-bold">Ajouter au Stock</button>
            </div>
          </form>
        </div>
      )}

      {/* B. NEW EMPLOYEE MODAL */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const newEmp: Employee = {
              id: `emp-${Date.now()}`,
              name: data.get('name') as string,
              role: data.get('role') as any,
              phone: data.get('phone') as string,
              email: data.get('email') as string,
              shift: data.get('shift') as string,
              status: 'Présent',
              badgeId: `BADGE-${Math.floor(100 + Math.random() * 899)}`,
              username: (data.get('username') as string || '').toLowerCase().trim(),
              password: (data.get('password') as string || 'pharma')
            };
            setEmployees([...employees, newEmp]);
            setShowAddEmpModal(false);
            playBeep();
          }} className="bg-white rounded-xl w-full max-w-sm p-5 border text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Enregistrer un Collaborateur</h4>
              <button type="button" onClick={() => setShowAddEmpModal(false)}><X size={16} /></button>
            </div>
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold">Nom et Prénom *</label>
              <input required type="text" name="name" className="w-full bg-slate-50 border p-2 rounded" placeholder="Jean Rochefort" />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold">Rôle / Discipline du poste *</label>
              <select name="role" className="w-full bg-slate-50 border p-2 rounded">
                <option value="Pharmacien Titulaire">Pharmacien Titulaire (Admin)</option>
                <option value="Admin">Administrateur Technique</option>
                <option value="Pharmacien Adjoint">Pharmacien Adjoint</option>
                <option value="Préparateur">Préparateur</option>
                <option value="Stagiaire">Stagiaire</option>
                <option value="Conseiller">Conseiller</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">Identifiant unique *</label>
                <input required type="text" name="username" className="w-full bg-slate-50 border p-2 rounded text-emerald-850 font-bold" placeholder="jean" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Mot de passe *</label>
                <input required type="text" name="password" className="w-full bg-slate-50 border p-2 rounded" placeholder="pharma" defaultValue="pharma" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">Téléphone *</label>
                <input required type="text" name="phone" className="w-full bg-slate-50 border p-2 rounded" placeholder="06..." />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Email</label>
                <input type="email" name="email" className="w-full bg-slate-50 border p-2 rounded" placeholder="email@gmail.com" />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-bold">Rotation / Garde *</label>
              <input required type="text" name="shift" className="w-full bg-slate-50 border p-2 rounded" defaultValue="09h - 17h" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowAddEmpModal(false)} className="px-3 py-1.5 text-slate-500">Annuler</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded font-bold">Valider l'embauche</button>
            </div>
          </form>
        </div>
      )}

      {/* C. NEW PARTNER MODAL */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const newP: Partner = {
              id: `part-${Date.now()}`,
              name: data.get('name') as string,
              contactName: data.get('contactName') as string,
              phone: data.get('phone') as string,
              email: data.get('email') as string,
              category: data.get('category') as string,
              dueAmount: parseFloat(data.get('due') as string) || 0,
              invoicesCount: parseFloat(data.get('due') as string) > 0 ? 1 : 0,
              reliability: 'Excellent'
            };
            setPartners([...partners, newP]);
            setShowAddPartnerModal(false);
          }} className="bg-white rounded-xl w-full max-w-sm p-5 border text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Enregistrer un Laboratoire / Distributeur</h4>
              <button type="button" onClick={() => setShowAddPartnerModal(false)}><X size={16} /></button>
            </div>
            <div>
              <label className="block text-slate-500 font-bold">Nom de la structure *</label>
              <input required type="text" name="name" className="w-full bg-slate-50 border p-2 rounded" placeholder="Sanofi France, etc." />
            </div>
            <div>
              <label className="block text-slate-500 font-bold">Négociateur principal *</label>
              <input required type="text" name="contactName" className="w-full bg-slate-50 border p-2 rounded" placeholder="Marie Curie" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">Téléphone *</label>
                <input required type="text" name="phone" className="w-full bg-slate-50 border p-2 rounded" placeholder="01..." />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Catégorie d'approv.</label>
                <input required type="text" name="category" className="w-full bg-slate-50 border p-2 rounded" defaultValue="OTC, Princeps" />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-bold">Premier encours facturé (FCFA)</label>
              <input type="number" step="0.01" name="due" className="w-full bg-slate-50 border p-2 rounded" defaultValue="0" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowAddPartnerModal(false)} className="px-3 py-1.5 text-slate-500">Annuler</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded font-bold">Ajouter</button>
            </div>
          </form>
        </div>
      )}

      {/* D. NEW CLIENT/PATIENT MODAL */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const newC: Client = {
              id: `cl-${Date.now()}`,
              name: data.get('name') as string,
              loyaltyCard: `FID-${Math.floor(10000 + Math.random() * 89999)}`,
              phone: data.get('phone') as string,
              email: data.get('email') as string || '',
              socialSecurityNumber: data.get('ss') as string || 'Non lue',
              prescriptionHistory: [],
              loyaltyPoints: 10
            };
            setClients([...clients, newC]);
            setShowAddClientModal(false);
          }} className="bg-white rounded-xl w-full max-w-sm p-5 border text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Enregistrer un Patient Régulier</h4>
              <button type="button" onClick={() => setShowAddClientModal(false)}><X size={16} /></button>
            </div>
            <div>
              <label className="block text-slate-500 font-bold">Nom Complet *</label>
              <input required type="text" name="name" className="w-full bg-slate-50 border p-2 rounded" placeholder="Alain Delon" />
            </div>
            <div>
              <label className="block text-slate-500 font-bold">N° Carte Vitale / Sécurités Sociale *</label>
              <input required type="text" name="ss" className="w-full bg-slate-50 border p-2 rounded" placeholder="1 75 08 75 120 456 12" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold">GSM Patient *</label>
                <input required type="text" name="phone" className="w-full bg-slate-50 border p-2 rounded" placeholder="06..." />
              </div>
              <div>
                <label className="block text-slate-500 font-bold">Email</label>
                <input type="email" name="email" className="w-full bg-slate-50 border p-2 rounded" placeholder="patient@gmail.com" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowAddClientModal(false)} className="px-3 py-1.5 text-slate-500">Annuler</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded font-bold">Créer Dossier</button>
            </div>
          </form>
        </div>
      )}

      {/* E. INVOICE RECEIPT OVERLAY */}
      {lastSaleReceipt && (
        <div className="fixed inset-0 z-55 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xs border border-slate-200 overflow-hidden font-mono text-[11px] p-5 space-y-3 text-slate-700 shadow-2xl">
            <div className="bg-emerald-50 text-emerald-800 p-2 text-center rounded text-xs font-bold font-sans">
              ✓ TRANSACTION ENREGISTRÉE & TRANSMISE
            </div>
            
            <div className="text-center">
              <strong className="text-xs text-slate-900 font-bold block">PHARMACIE DE PROXIMITÉ</strong>
              <span>LOG PHARMA OFFICINE</span>
            </div>

            <div className="border-t border-dashed pt-2 space-y-1">
              <p>ID Vente : <strong className="float-right text-slate-900">{lastSaleReceipt.id}</strong></p>
              <p>Bénéficiaire : <span className="float-right">{lastSaleReceipt.clientName}</span></p>
              <p>Mode réglé : <span className="float-right">{lastSaleReceipt.paymentMethod}</span></p>
            </div>

            <div className="border-t border-dashed pt-2">
              <p className="font-bold underline pb-1">Articles facturés :</p>
              {lastSaleReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.name} (x{it.quantity})</span>
                  <span>{(it.price * it.quantity).toFixed(2)} FCFA</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Total brut de dispensation</span>
                <span>{lastSaleReceipt.subtotal} FCFA</span>
              </div>
              {parseFloat(lastSaleReceipt.secuRefund) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Part Remboursée Sécu (TP Direct)</span>
                  <span>-{lastSaleReceipt.secuRefund} FCFA</span>
                </div>
              )}
              {parseFloat(lastSaleReceipt.discount) > 0 && (
                <div className="flex justify-between text-indigo-700">
                  <span>Remise Fidélité Patient</span>
                  <span>-{lastSaleReceipt.discount} FCFA</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-900 text-xs border-t pt-1">
                <span>Net Payeur</span>
                <span>{lastSaleReceipt.totalPaid} FCFA</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2 font-sans text-[10px] rounded text-center text-slate-500">
              Agrément Ameli N° 401552 - Télétransmission SESAM-Vitale directe.
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button type="button" onClick={() => { playBeep(); handlePrintSale(lastSaleReceipt); }} className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <span>🖨️</span>
                <span>Facture / PDF</span>
              </button>
              <button type="button" onClick={() => setLastSaleReceipt(null)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs cursor-pointer">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* F. ADMIN LOGIN MODAL */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-105 animate-fade-in text-xs">
            {/* Header */}
            <div className="bg-emerald-950 p-5 text-white relative">
              <button 
                type="button" 
                onClick={() => setShowAdminLoginModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-1 rounded transition-colors"
              >
                <X size={15} />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={18} className="text-emerald-400" />
                <h4 className="font-extrabold text-sm tracking-wide">Authentification Direction</h4>
              </div>
              <p className="text-[10px] text-emerald-200/80">Renseignez vos identifiants pour débrider les accès d'administration.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="p-5 space-y-4">
              {adminLoginError && (
                <div className="ring-1 ring-red-200 bg-red-50 text-red-800 p-2.5 rounded-lg font-bold flex items-center gap-1.5 animate-shake">
                  <span className="text-red-600">⚠</span>
                  <span>{adminLoginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-slate-550 font-bold uppercase tracking-wider text-[9px]">Nom d'utilisateur *</label>
                <input 
                  required 
                  type="text" 
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-medium text-slate-900 focus:outline bg-white transition-colors" 
                  placeholder="admin" 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-555 font-bold uppercase tracking-wider text-[9px]">Mot de passe *</label>
                <input 
                  required 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-medium text-slate-900 focus:outline bg-white transition-colors" 
                  placeholder="••••••••" 
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-slate-500 leading-normal text-[10px]">
                🔑 <span className="font-bold text-slate-700">Identifiants Administrateur :</span>
                <ul className="list-disc pl-4 mt-1 font-mono space-y-0.5 text-slate-600">
                  <li>Login: <span className="font-bold text-emerald-800">admin</span></li>
                  <li>Mot de passe: <span className="font-bold text-emerald-800">pharma</span></li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAdminLoginModal(false)} 
                  className="px-4 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* G. EDIT EMPLOYEE MODAL */}
      {showEditEmpModal && editingEmployee && (
        <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={submitEditEmployee} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 border text-xs space-y-3.5 border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-1.5 text-slate-900">
                <Shield size={16} className="text-emerald-700" />
                <h4 className="font-bold text-sm">Modifier la fiche Collaborateur</h4>
              </div>
              <button 
                type="button" 
                onClick={() => { setShowEditEmpModal(false); setEditingEmployee(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Nom complet *</label>
              <input 
                required 
                type="text" 
                name="name" 
                defaultValue={editingEmployee.name}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-semibold" 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Rôle / Discipline *</label>
              <select 
                name="role" 
                defaultValue={editingEmployee.role}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-semibold"
              >
                <option value="Admin">Administrateur Technique</option>
                <option value="Pharmacien Titulaire">Pharmacien Titulaire</option>
                <option value="Pharmacien Adjoint">Pharmacien Adjoint</option>
                <option value="Préparateur">Préparateur</option>
                <option value="Stagiaire">Stagiaire</option>
                <option value="Conseiller">Conseiller</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Nom d'utilisateur *</label>
                <input 
                  required 
                  type="text" 
                  name="username" 
                  defaultValue={editingEmployee.username || ''}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-semibold" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Mot de passe *</label>
                <input 
                  required 
                  type="text" 
                  name="password" 
                  defaultValue={editingEmployee.password || ''}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Téléphone directe *</label>
                <input 
                  required 
                  type="text" 
                  name="phone" 
                  defaultValue={editingEmployee.phone}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-medium" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Email directe</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingEmployee.email}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-medium" 
                  placeholder="contact@gmail.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Planning de Garde *</label>
                <input 
                  required 
                  type="text" 
                  name="shift" 
                  defaultValue={editingEmployee.shift}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-medium" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Statut initial *</label>
                <select 
                  name="status" 
                  defaultValue={editingEmployee.status}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="Présent">Présent</option>
                  <option value="Absent">Absent</option>
                  <option value="En congé">En congé</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => { setShowEditEmpModal(false); setEditingEmployee(null); }} 
                className="px-4 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm cursor-pointer"
              >
                Enregistrer la fiche
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SALES HISTORY & FILTER MODAL */}
      {showSalesHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-scale-in text-xs">
            {/* Header */}
            <div className="bg-emerald-950 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-800 text-teal-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">Module de Gestion des Flux</span>
                  <span className="text-emerald-300 text-xs">•</span>
                  <span className="text-emerald-200 text-[10px] font-medium font-mono">Date Officine : 26 mai 2026</span>
                </div>
                <h3 className="font-extrabold text-base tracking-tight text-white uppercase">Historique Complet & Traçabilité des Concessions</h3>
                <p className="text-[11px] text-emerald-200/80">Filtrage clinique et légal de l'ensemble des ordonnances et auto-médications délivrées en officine.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSalesHistoryModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter controls panel */}
            <div className="p-5 bg-slate-50/50 border-b border-slate-100 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-1">
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">Recherche Générale</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                      <Search size={13} />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Réf Vente, patient, médicament..." 
                      value={historySearchQuery}
                      onChange={(e) => { setHistorySearchQuery(e.target.value); }}
                      className="w-full bg-white border border-slate-200 pl-8 pr-2.5 py-2 rounded-lg text-slate-900 font-medium placeholder-slate-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Seller dropdown */}
                <div className="space-y-1">
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">Opérateur / Vendeur</label>
                  <select 
                    value={historySellerId}
                    onChange={(e) => { setHistorySellerId(e.target.value); }}
                    className="w-full bg-white border border-slate-200 p-2 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
                  >
                    <option value="all">Tous les collaborateurs</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                    <option value="Collaborateur">Autres / Collaborateurs de Passage</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">Période - Date de Début</label>
                  <input 
                    type="date" 
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">Période - Date de Fin</label>
                  <input 
                    type="date" 
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Reset filter badge indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="flex gap-2 items-center">
                  {(historyStartDate || historyEndDate || historySellerId !== 'all' || historySearchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        playBeep();
                        setHistoryStartDate('');
                        setHistoryEndDate('');
                        setHistorySellerId('all');
                        setHistorySearchQuery('');
                      }}
                      className="bg-amber-50 text-amber-800 hover:bg-amber-100 ring-1 ring-amber-200/50 px-2.5 py-1 rounded font-bold text-[10px] uppercase flex items-center gap-1 transition-all pointer-events-auto"
                    >
                      <span>🔄 Réinitialiser les Filtres</span>
                    </button>
                  )}
                  <span className="text-slate-400 text-[10px]">
                    Sélection actuelle : <strong className="text-slate-800 font-bold">{filteredSales.length} transaction(s)</strong> sur un total de {sales.length} ventes.
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playBeep();
                      window.print();
                    }}
                    className="bg-slate-900 hover:bg-slate-950 font-extrabold text-[10px] text-white uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Printer size={12} />
                    <span>Imprimer ce Rapport</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bento Metrics block */}
            <div className="px-5 py-4 bg-slate-50/20 border-b border-slate-100 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50/40 border border-emerald-100/50 p-2.5 rounded-xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Chiffre d'affaires total</span>
                <span className="text-sm font-black text-emerald-800 font-mono">
                  {filteredSales.reduce((sum, s) => sum + parseFloat(s.totalPaid), 0).toFixed(2)} FCFA
                </span>
              </div>
              <div className="bg-blue-50/40 border border-blue-100/50 p-2.5 rounded-xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Transactions Validées</span>
                <span className="text-sm font-black text-blue-800 font-mono">
                  {filteredSales.length} fiches
                </span>
              </div>
              <div className="bg-indigo-50/40 border border-indigo-100/50 p-2.5 rounded-xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Médicaments Délivrés</span>
                <span className="text-sm font-black text-indigo-800 font-mono">
                  {filteredSales.reduce((sum, s) => sum + s.items.reduce((acc, it) => acc + it.quantity, 0), 0)} boîtes
                </span>
              </div>
              <div className="bg-rose-50/40 border border-rose-100/50 p-2.5 rounded-xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Panier Moyen Net</span>
                <span className="text-sm font-black text-rose-800 font-mono">
                  {filteredSales.length > 0 
                    ? (filteredSales.reduce((sum, s) => sum + parseFloat(s.totalPaid), 0) / filteredSales.length).toFixed(2) 
                    : "0.00"} FCFA
                </span>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-y-auto p-5">
              {filteredSales.length === 0 ? (
                <div className="p-16 text-center space-y-2">
                  <div className="text-4xl">🔍</div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aucune transaction correspondante</h4>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">Veuillez défaire ou élargir les filtres de recherche (critères de date ou sélection d'employé).</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase py-3">
                        <th className="py-3 px-3">Réf Vente</th>
                        <th className="py-3 px-3">Date d'enregistrement</th>
                        <th className="py-3 px-3">Collaborateur / Vendeur</th>
                        <th className="py-3 px-3">Patient / Bénéficiaire</th>
                        <th className="py-3 px-3 text-center">Tiers Payant</th>
                        <th className="py-3 px-3">Médicaments Dispenses</th>
                        <th className="py-3 px-3 text-right">Encaissement</th>
                        <th className="py-3 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-black text-slate-900">{s.id}</td>
                          <td className="py-3 px-3 text-slate-600 font-semibold">
                            {new Date(s.date).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              👤 {s.sellerName || 'Collaborateur'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">{s.clientName || 'Client de Passage'}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${s.prescriptionAttached ? 'bg-teal-100 text-teal-850' : 'bg-slate-100 text-slate-500'}`}>
                              {s.prescriptionAttached ? 'SESAM-Vitale' : 'Auto'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="max-w-xs truncate text-slate-600 font-medium" title={s.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}>
                              {s.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-800 text-[13px]">{parseFloat(s.totalPaid).toFixed(2)} FCFA</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => { playBeep(); handlePrintSale(s); }}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded text-[10px] font-black inline-flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Printer size={11} />
                              <span>ReFacture</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-455 font-medium leading-tight">
                Plateforme informatique LogPharma de gestion d'officines réglementée, conforme aux nomenclatures CPAM, Ameli, ANSM.
              </span>
              <button 
                type="button" 
                onClick={() => { playBeep(); setShowSalesHistoryModal(false); }}
                className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[11px] uppercase tracking-wider px-5 py-2 rounded-xl scale-100 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Fermer le Registre
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* MODÈLE D'IMPRESSION PROFESSIONNEL ET PROPRE (EXCLUSIVEMENT EN IMPRESSION) */}
      {printData && (
        <div id="pharma-print-container" className="hidden print:block bg-white text-slate-900 font-sans p-6 text-[10px] leading-6 max-w-4xl mx-auto">
          {/* En-tête officiel de l'officine */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl font-bold text-emerald-800 border-2 border-emerald-800 px-1.5 rounded-lg">+</span>
                <span className="text-base font-black text-slate-900 uppercase tracking-tight">LOG PHARMA OFFICINE</span>
              </div>
              <p className="font-bold text-[11px] text-slate-800">PHARMACIE DE LA MAIRIE</p>
              <p className="text-slate-600">12 Place de la République, 75003 Paris</p>
              <p className="text-slate-600">Tél : 01 42 77 56 43 • Email : contact@pharmaciemairie.fr</p>
              <p className="text-slate-505 font-medium mt-1">Numéro RPPS : 10065432109 • SIRET : 410 552 123 00018</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white font-extrabold px-3 py-1.5 rounded uppercase tracking-wider text-[11px] mb-2 inline-block">
                {printData.prescriptionAttached ? 'Facture subrogatoire SESAM-Vitale' : 'Facture de caisse / Justificatif'}
              </div>
              <p className="text-slate-500">Date d'édition : <strong className="text-slate-900 font-bold">{new Date(printData.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></p>
              <p className="text-slate-500">Référence Vente : <strong className="text-slate-900 font-mono font-bold">{printData.id}</strong></p>
              <p className="text-slate-505">Conseiller / Pharmacien : <strong className="text-slate-900 font-bold">{currentUser?.name || 'Collaborateur Officine'}</strong></p>
            </div>
          </div>

          {/* Informations Patient & Cadre Assuré */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-3 rounded-lg mb-4">
            <div>
              <h4 className="font-extrabold text-[10px] text-slate-900 uppercase tracking-widest border-b pb-1 mb-1.5 font-sans">Informations du Bénéficiaire</h4>
              <p className="text-slate-700 font-bold text-[11px]">{printData.clientName || 'Client de passage'}</p>
              <p className="text-slate-500">Statut Dossier : <span className="font-semibold text-slate-800">{printData.clientName ? 'Patient enregistré d\'officine' : 'Anonyme (Vente comptant)'}</span></p>
              {printData.clientId && (
                <p className="text-slate-500">ID Patient : <span className="font-mono font-bold text-slate-855">{printData.clientId}</span></p>
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-[10px] text-slate-900 uppercase tracking-widest border-b pb-1 mb-1.5 font-sans">Couverture Sociale / Régime</h4>
              <p className="text-slate-600">N° d'Assuré (NIR) : <span className="font-mono font-bold text-slate-900">
                {printData.clientName ? (clients.find(c => c.name === printData.clientName)?.socialSecurityNumber || '1 89 05 75 123 456 12') : 'Non renseigné'}
              </span></p>
              <p className="text-slate-600">Tiers payant direct : <strong className="text-emerald-800">{printData.prescriptionAttached ? 'Oui (Part Régime Obligatoire Télétransmis)' : 'Non (Auto-médication)'}</strong></p>
              <p className="text-slate-600">Agrément SESAM-Vitale N° F401552</p>
            </div>
          </div>

          {/* Prescription de l'ordonnance si applicable */}
          {printData.prescriptionAttached && (
            <div className="border border-emerald-200 bg-emerald-50/40 p-2.5 rounded-lg mb-4 text-emerald-950 text-[10px]">
              <span className="font-bold">⚕️ Prescription Médicale Conforme :</span> Ordonnance validée par un médecin agréé et versée au dossier pharmaceutique du bénéficiaire. Transmission SESAM-Vitale dématérialisée effectuée en temps réel.
            </div>
          )}

          {/* Tableau des Médicaments et Dispositifs Facturés */}
          <table className="w-full border border-slate-200 mb-6 text-[10px] text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
                <th className="p-2 w-[40px] text-center font-sans">N°</th>
                <th className="p-2 font-sans">Désignation du produit</th>
                <th className="p-1 w-[120px] text-center font-mono">Code CIP</th>
                <th className="p-2 w-[80px] text-right font-sans">Remb. Sécu</th>
                <th className="p-2 w-[80px] text-right font-sans">Prix Unitaire</th>
                <th className="p-2 w-[60px] text-center font-sans">Qté</th>
                <th className="p-2 w-[100px] text-right font-sans">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {printData.items.map((it, idx) => {
                const cipMockValue = medicines.find(m => m.id === it.medicineId || m.name === it.name)?.cip || `34009${Math.floor(1000000 + Math.random() * 8999999)}`;
                return (
                  <tr key={idx} className="text-slate-700">
                    <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">{it.name}</td>
                    <td className="p-2 text-center font-mono font-medium text-slate-500">{cipMockValue}</td>
                    <td className="p-2 text-right font-bold text-teal-850">
                      {printData.prescriptionAttached ? '65%' : '0%'}
                    </td>
                    <td className="p-2 text-right font-medium">{it.price.toFixed(2)} FCFA</td>
                    <td className="p-2 text-center font-bold text-slate-900">{it.quantity}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{(it.price * it.quantity).toFixed(2)} FCFA</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Décompte des coûts et Reste à Charge */}
          <div className="flex justify-end mb-8">
            <div className="w-72 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Montant brut total TTC</span>
                <span>{printData.subtotal} FCFA</span>
              </div>
              {parseFloat(printData.secuRefund) > 0 && (
                <div className="flex justify-between text-teal-700 font-bold border-b border-dashed pb-1">
                  <span>Remboursement Sécurité Sociale</span>
                  <span>-{printData.secuRefund} FCFA</span>
                </div>
              )}
              {parseFloat(printData.discount) > 0 && (
                <div className="flex justify-between text-indigo-700 font-bold border-b border-dashed pb-1">
                  <span>Remise Fidélité déduite</span>
                  <span>-{printData.discount} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-xs pt-1.5">
                <span>Reste à Charge Patient</span>
                <span className="text-base text-emerald-850 font-black">{printData.totalPaid} FCFA</span>
              </div>
              <div className="border-t border-slate-200/60 pt-2 text-[10px] text-slate-500 text-right">
                Paiement acquitté par : <strong className="text-slate-800 uppercase">{printData.paymentMethod}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mt-12 text-slate-600">
            <div className="border-t border-slate-300 pt-3">
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-800 mb-10">Cachet & Signature de l'Officine</p>
              <div className="h-10 mt-4 text-[9px] text-slate-400">Pour le pharmacien titulaire, Signature numérique agréée</div>
            </div>
            <div className="border-t border-slate-300 pt-3">
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-800 mb-10">Signature du Bénéficiaire</p>
              <div className="h-10 mt-4 text-[9px] text-slate-400">Signature de l'assuré pour dispense d'avance de frais</div>
            </div>
          </div>

          {/* Bas de page légal */}
          <div className="border-t border-slate-200 mt-12 pt-4 text-center text-[9px] text-slate-400 space-y-1 leading-normal">
            <p className="font-bold text-slate-600">ID TRANSACTION UNIQUE : {printData.id} • FACTURE CERTIFIÉE STRICTEMENT CONFORME PAR LOG PHARMA</p>
            <p>Agrément CNAMPS Ameli N° 401552 - Télétransmission SESAM-Vitale directe.</p>
            <p className="leading-snug">Facture exonérée de TVA en vertu des articles 261 et suivants du CGI pour les médicaments pris en charge par l'assurance maladie. Pour toute réclamation ou question relative aux remboursements mutuelles complémentaires, veuillez vous référer à votre relevé d'Assurance Maladie sous No Ameli et joindre la présente facture de dispensation.</p>
          </div>
        </div>
      )}

      {/* MODÈLE D'IMPRESSION DE LISTE DE RETRAIT PROFESSIONNEL (EXCLUSIVEMENT EN IMPRESSION) */}
      {printWithdrawMeds && (
        <div id="pharma-withdraw-print-container" className="hidden print:block bg-white text-slate-900 font-sans p-6 text-[10px] leading-6 max-w-4xl mx-auto">
          {/* En-tête officiel de l'officine */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl font-bold text-rose-800 border-2 border-rose-800 px-1.5 rounded-lg">⚕️</span>
                <span className="text-base font-black text-slate-900 uppercase tracking-tight">LOG PHARMA OFFICINE</span>
              </div>
              <p className="font-bold text-[11px] text-slate-800">PHARMACIE DE LA MAIRIE</p>
              <p className="text-slate-600">12 Place de la République, 75003 Paris</p>
              <p className="text-slate-600">Tél : 01 42 77 56 43 • Email : contact@pharmaciemairie.fr</p>
              <p className="text-slate-505 font-medium mt-1">Plateforme Logistique Officinale • Agrément ARS Île-de-France</p>
            </div>
            <div className="text-right">
              <div className="bg-rose-900 text-white font-extrabold px-3 py-1.5 rounded uppercase tracking-wider text-[11px] mb-2 inline-block">
                Ordre de Retrait Clinique (Risque Péremption)
              </div>
              <p className="text-slate-500">Généré le : <strong className="text-slate-900 font-bold">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></p>
              <p className="text-slate-505">Opérateur responsable : <strong className="text-slate-900 font-bold">{currentUser?.name || 'Pharmacien en charge du stock'}</strong></p>
              <p className="text-slate-505">Rôle : <span className="font-semibold text-slate-800">{currentUser?.role || 'Collaborateur Officine'}</span></p>
            </div>
          </div>

          <div className="mb-4 bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-950 font-sans leading-relaxed text-[10px]">
            <p className="font-bold">⚠️ CERTIFICATION DE CONFORMITÉ ET D'ÉVICTION SANITAIRE :</p>
            <p>Conformément aux directives de l'Agence Nationale de Sécurité du Médicament (ANSM) et aux dispositions du Code de la santé publique français, les références listées ci-dessous ont franchi le seuil critique de péremption clinique d'un mois (≤ 30 jours). Elles doivent être immédiatement retirées des étagères de dispensation physique, signalées dans le système d'information de l'officine et stockées de manière étanche dans le bac de tri réglementaire en vue de leur reprise par l'organisme Cyclamed ou leur recyclage sécurisé.</p>
          </div>

          {/* Tableau de cueillette / retrait */}
          <table className="w-full border border-slate-200 mb-6 text-[10px] text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
                <th className="p-2 w-[40px] text-center font-sans">N°</th>
                <th className="p-2 font-sans">Désignation Spécifique du Produit</th>
                <th className="p-2 w-[110px] text-center font-mono">Code CIP</th>
                <th className="p-2 w-[120px] font-sans">Emplacement Rayon</th>
                <th className="p-2 w-[110px] text-center font-sans">Date Expir.</th>
                <th className="p-2 w-[90px] text-right font-sans">Stock Théorique</th>
                <th className="p-2 w-[110px] text-center font-sans">Échéance restant</th>
                <th className="p-2 w-[100px] text-center font-sans">Émargement / Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {printWithdrawMeds.map((med, idx) => {
                const d = new Date(med.expiryDate);
                const today = new Date('2026-05-26');
                const diff = d.getTime() - today.getTime();
                const diffDays = Math.ceil(diff / (24 * 60 * 60 * 1000));
                const isExpired = diffDays <= 0;

                return (
                  <tr key={med.id} className="text-slate-700">
                    <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">{med.name}</td>
                    <td className="p-2 text-center font-mono font-medium text-slate-500">{med.cip}</td>
                    <td className="p-2 font-bold text-slate-800 uppercase text-[9px]">{med.location || 'Rayon inconnu'}</td>
                    <td className="p-2 text-center font-semibold">{d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td className="p-2 text-right font-black text-slate-900">{med.quantity} boîte{med.quantity > 1 ? 's' : ''}</td>
                    <td className="p-2 text-center font-bold">
                      {isExpired ? (
                        <span className="text-rose-700">Périmé ({Math.abs(diffDays)}j)</span>
                      ) : (
                        <span className="text-amber-700">Sous {diffDays} jours</span>
                      )}
                    </td>
                    <td className="p-2 text-center text-slate-400">
                      <div className="w-4 h-4 border border-slate-400 rounded mx-auto"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-10 mt-12 text-slate-600">
            <div className="border-t border-slate-300 pt-3">
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-800 mb-8">Visa du Pharmacien d'Officine Responsable</p>
              <p className="text-[9px] text-slate-500 mb-1">Nom : ___________________________</p>
              <p className="text-[9px] text-slate-500 mb-6">Signature :</p>
            </div>
            <div className="border-t border-slate-300 pt-3">
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-800 mb-8">Attestation de mise au tri Cyclamed</p>
              <p className="text-[9px] text-slate-500 mb-1">Nombre total de boîtes écartées de la vente : <strong className="text-slate-900">{printWithdrawMeds.reduce((sum, m) => sum + m.quantity, 0)}</strong></p>
              <p className="text-[9px] text-slate-500 mb-6">Cachet de tri :</p>
            </div>
          </div>

          {/* Bas de page légal */}
          <div className="border-t border-slate-200 mt-12 pt-4 text-center text-[9px] text-slate-400 space-y-1 leading-normal">
            <p className="font-bold text-slate-600">LOG PHARMA • SÉCURITÉ CLINIQUE • CONFORME AUX RECOMMANDATIONS DE L'ANSM</p>
            <p>Document d'archivage réglementaire d'officine, devant être conservé durant une période légale minimale de 3 ans au registre de traçabilité des déchets de produits de santé.</p>
          </div>
        </div>
      )}
    </>
  );
}

