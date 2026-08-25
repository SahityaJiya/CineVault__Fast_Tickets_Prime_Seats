'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Utensils, 
  Plus, 
  Minus,
  Mail,
  AlertTriangle,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  X,
  Smartphone,
  Wallet,
  Zap,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'fnb-1',
    name: 'Jumbo Butter Popcorn + Large Coke',
    description: 'Fresh warm gourmet butter popcorn (180g) with 650ml chilled Coke.',
    price: 390,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fnb-2',
    name: 'Loaded Cheese Jalapeño Nachos',
    description: 'Crispy Mexican corn tortilla chips served with warm salsa dip.',
    price: 280,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fnb-3',
    name: 'Caramel Crunch Gourmet Popcorn',
    description: 'Signature large tub coated with slow-cooked rich artisan caramel.',
    price: 320,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fnb-4',
    name: 'Chilled Cold Coffee Frappe',
    description: 'Whipped iced espresso blend with creamy chocolate drizzle.',
    price: 240,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=80',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const showId = (params?.showId as string) || '';
  
  const seatIdsFromUrl = searchParams.get('seatIds') ? searchParams.get('seatIds')!.split(',').filter(Boolean) : [];
  const selectedSeatIds = seatIdsFromUrl;

  const seatLabelsFromUrl = searchParams.get('seats') ? searchParams.get('seats')!.split(',').filter(Boolean) : [];
  const selectedSeatLabels = seatLabelsFromUrl.length > 0 ? seatLabelsFromUrl : selectedSeatIds.map((_, i) => `Seat ${i + 1}`);

  const ticketTotal = searchParams.get('total') ? parseFloat(searchParams.get('total')!) : selectedSeatIds.length * 300;

  const [fnbCart, setFnbCart] = useState<Record<string, number>>({});
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Razorpay Simulation State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [rzpTab, setRzpTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('gpay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleAddItem = (id: string) => {
    setFnbCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFnbCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] -= 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const fnbTotal = Object.entries(fnbCart).reduce((total, [id, qty]) => {
    const item = FOOD_ITEMS.find((f) => f.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const convenienceFee = selectedSeatIds.length > 0 ? 35 : 0;
  const gst = Math.round((convenienceFee + fnbTotal) * 0.18);
  const grandTotal = ticketTotal + fnbTotal + convenienceFee + gst;

  const handleOpenRazorpay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setEmailError('Please enter a valid email address to receive your tickets.');
      return;
    }

    setEmailError('');
    setShowRazorpayModal(true);
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        const queryParams = new URLSearchParams({
          showId: showId,
          seats: selectedSeatIds.join(','),
          email: customerEmail.trim().toLowerCase(),
          total: grandTotal.toString(),
        });

        router.push(`/booking/confirmation?${queryParams.toString()}`);
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          href={`/booking/${showId}`}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Seat Matrix
        </Link>
        <span className="font-bold text-sm tracking-wide text-zinc-200 uppercase">
          Review & Checkout
        </span>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timer Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>Your seats are locked for 10 minutes. Please finalize payment.</span>
          </div>
          <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-200 text-xs">
            09:30
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* F&B Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-rose-500" /> Grab a Bite (F&B Combos)
              </h2>
              <span className="text-xs text-zinc-500">Pick up at cinema concession counter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FOOD_ITEMS.map((item) => {
                const count = fnbCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition flex gap-4"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover bg-zinc-800 flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-extrabold text-white">₹{item.price}</span>
                        {count > 0 ? (
                          <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 hover:bg-zinc-700 rounded text-zinc-300 transition"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-1">{count}</span>
                            <button
                              type="button"
                              onClick={() => handleAddItem(item.id)}
                              className="p-1 hover:bg-zinc-700 rounded text-zinc-300 transition"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(item.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-rose-600 text-xs font-semibold text-zinc-200 hover:text-white transition border border-zinc-700 hover:border-rose-500"
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Pay Action */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleOpenRazorpay}
              className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 sticky top-20 shadow-2xl space-y-5"
            >
              <div className="space-y-2.5 text-xs text-zinc-300 pb-4 border-b border-zinc-800/80">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Selected Seats ({selectedSeatLabels.length}):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedSeatLabels.join(', ') || 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tickets Subtotal:</span>
                  <span className="font-semibold text-white">₹{ticketTotal}</span>
                </div>
                {fnbTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">F&B Total:</span>
                    <span className="font-semibold text-white">₹{fnbTotal}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Convenience Fee:</span>
                  <span className="font-semibold text-white">₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Integrated GST (18%):</span>
                  <span className="font-semibold text-white">₹{gst}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-rose-500" /> Email for E-Ticket & Pass
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
                />
                {emailError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {emailError}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Total Payable</span>
                <span className="text-xl font-black text-white">₹{grandTotal}</span>
              </div>

              <button
                type="submit"
                disabled={selectedSeatIds.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                <Zap className="h-4 w-4 fill-current" />
                Pay ₹{grandTotal} with Razorpay
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Secured by Razorpay • 256-bit SSL Encryption</span>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* RAZORPAY MODAL SIMULATION */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0c1222] border border-[#1e293b] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Razorpay Top Header */}
            <div className="bg-[#020617] p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/30">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">Razorpay Trusted Business</h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold uppercase">Test Mode</span>
                  </div>
                  <p className="text-xs text-zinc-400">CineVault Entertainment Pvt Ltd</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Amount</span>
                <span className="text-lg font-black text-white">₹{grandTotal}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowRazorpayModal(false)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Razorpay Body */}
            {paymentSuccess ? (
              <div className="p-10 text-center space-y-3">
                <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-white">Payment Successful!</h3>
                <p className="text-xs text-zinc-400">Razorpay Payment ID: pay_sim_{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                <p className="text-xs text-emerald-400 font-semibold">Generating your movie passes & dispatching email...</p>
              </div>
            ) : (
              <div className="grid grid-cols-12 min-h-[340px]">
                {/* Left Side Navigation Tabs */}
                <div className="col-span-4 bg-[#090e1a] border-r border-[#1e293b] p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setRzpTab('upi')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                      rzpTab === 'upi' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> UPI Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setRzpTab('card')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                      rzpTab === 'card' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" /> Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setRzpTab('netbanking')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                      rzpTab === 'netbanking' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" /> Netbanking
                  </button>
                  <button
                    type="button"
                    onClick={() => setRzpTab('wallet')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                      rzpTab === 'wallet' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                  >
                    <Wallet className="h-3.5 w-3.5" /> Wallets
                  </button>
                </div>

                {/* Right Side Tab Contents */}
                <div className="col-span-8 p-5 flex flex-col justify-between space-y-4">
                  
                  {/* UPI Option */}
                  {rzpTab === 'upi' && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-zinc-300 block">Select your Preferred UPI App</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('gpay')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                            selectedUpiApp === 'gpay' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e293b] bg-[#020617] text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="h-6 w-6 rounded-full bg-white text-zinc-950 font-black flex items-center justify-center text-[10px]">G</span>
                          Google Pay
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('phonepe')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                            selectedUpiApp === 'phonepe' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e293b] bg-[#020617] text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="h-6 w-6 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-[10px]">पे</span>
                          PhonePe
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('paytm')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                            selectedUpiApp === 'paytm' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e293b] bg-[#020617] text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="h-6 w-6 rounded-full bg-cyan-500 text-white font-black flex items-center justify-center text-[10px]">P</span>
                          Paytm UPI
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('qr')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                            selectedUpiApp === 'qr' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e293b] bg-[#020617] text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <QrCode className="h-5 w-5 text-zinc-300" />
                          Dynamic QR
                        </button>
                      </div>

                      {selectedUpiApp === 'qr' && (
                        <div className="p-3 bg-[#020617] border border-[#1e293b] rounded-xl flex items-center gap-3">
                          <div className="p-1 bg-white rounded-lg">
                            <QrCode className="h-12 w-12 text-zinc-950" />
                          </div>
                          <p className="text-[11px] text-zinc-400">Scan this QR with any UPI app to pay instantly.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Option */}
                  {rzpTab === 'card' && (
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1">Card Number (Test Simulation)</label>
                        <input
                          type="text"
                          defaultValue="4532 8900 1234 9876"
                          disabled
                          className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-[#1e293b] text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-400 block mb-1">Expiry</label>
                          <input
                            type="text"
                            defaultValue="12/28"
                            disabled
                            className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-[#1e293b] text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">CVV</label>
                          <input
                            type="password"
                            defaultValue="888"
                            disabled
                            className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-[#1e293b] text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NetBanking Option */}
                  {rzpTab === 'netbanking' && (
                    <div className="space-y-2 text-xs">
                      <label className="text-zinc-400 block">Select Popular Bank</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2 rounded-lg border text-xs font-semibold text-left transition ${
                              selectedBank === bank ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e293b] bg-[#020617] text-zinc-400'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wallets Option */}
                  {rzpTab === 'wallet' && (
                    <div className="space-y-2 text-xs">
                      <label className="text-zinc-400 block">Available Wallets</label>
                      <div className="p-3 rounded-xl bg-[#020617] border border-[#1e293b] flex items-center justify-between">
                        <span className="font-bold text-white">Amazon Pay Balance</span>
                        <span className="text-emerald-400 font-bold">₹5,000 Available</span>
                      </div>
                    </div>
                  )}

                  {/* Razorpay Submit Action */}
                  <div className="pt-2 border-t border-[#1e293b]">
                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Processing with Razorpay...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" /> Pay ₹{grandTotal}
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 mt-2">
                      <Info className="h-3 w-3 text-blue-400" />
                      <span>Simulated Razorpay Checkout for Sandbox Testing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}