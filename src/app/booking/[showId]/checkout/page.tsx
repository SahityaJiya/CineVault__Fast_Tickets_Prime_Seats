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
  X
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
    name: 'Jumbo Butter Popcorn + Coke',
    description: 'Fresh warm gourmet butter popcorn (180g) with 650ml chilled Coke.',
    price: 390,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fnb-2',
    name: 'Loaded Cheese Nachos',
    description: 'Crispy corn tortilla chips served with warm jalapeño cheese dip and fresh salsa.',
    price: 280,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fnb-3',
    name: 'Caramel Crunch Popcorn',
    description: 'Signature large tub coated with slow-cooked rich artisan caramel.',
    price: 320,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fnb-4',
    name: 'Cold Coffee Frappe',
    description: '350ml whipped iced espresso blend with creamy chocolate drizzle.',
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
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setEmailError('');
    setShowPaymentModal(true);
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const queryParams = new URLSearchParams({
        showId: showId,
        seats: selectedSeatIds.join(','),
        email: customerEmail.trim().toLowerCase(),
        total: grandTotal.toString(),
      });

      router.push(`/booking/confirmation?${queryParams.toString()}`);
    }, 1500);
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
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>Your selected seats are temporarily locked. Complete checkout before timer expires.</span>
          </div>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-xs">
            09:45
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-rose-500" /> Grab a Bite (F&B Combos)
              </h2>
              <span className="text-xs text-zinc-500">Optional items for cinema pickup</span>
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

          <div className="lg:col-span-4">
            <form
              onSubmit={handleOpenPayment}
              className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 sticky top-20 shadow-2xl space-y-5"
            >
              <div className="space-y-2.5 text-xs text-zinc-300 pb-4 border-b border-zinc-800/80">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Seats ({selectedSeatLabels.length}):</span>
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
                    <span className="text-zinc-500">Food & Beverages:</span>
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
                  <Mail className="h-3.5 w-3.5 text-rose-500" /> Email for Ticket & QR Pass
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="e.g. ritik@cinevault.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
                />
                {emailError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {emailError}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Amount Payable</span>
                <span className="text-xl font-extrabold text-white">₹{grandTotal}</span>
              </div>

              <button
                type="submit"
                disabled={selectedSeatIds.length === 0}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                Proceed to Pay ₹{grandTotal}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </form>
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CineVault Payment Gateway</h3>
                <p className="text-xs text-zinc-400">Total: ₹{grandTotal} • Test Mode</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition border ${
                  paymentMethod === 'upi'
                    ? 'bg-rose-600/10 text-rose-400 border-rose-500/30'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <QrCode className="h-4 w-4" /> UPI Apps
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition border ${
                  paymentMethod === 'card'
                    ? 'bg-rose-600/10 text-rose-400 border-rose-500/30'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="h-4 w-4" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition border ${
                  paymentMethod === 'netbanking'
                    ? 'bg-rose-600/10 text-rose-400 border-rose-500/30'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Building2 className="h-4 w-4" /> NetBanking
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
              {paymentMethod === 'upi' && (
                <div className="text-center space-y-2 py-2">
                  <span className="text-xs text-zinc-400 block">Scan with any UPI App or enter VPA</span>
                  <div className="p-3 bg-white inline-block rounded-xl">
                    <QrCode className="h-20 w-20 text-zinc-950" />
                  </div>
                  <p className="text-[11px] font-mono text-emerald-400 font-medium">cinevault@icici (Verified)</p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2.5 text-xs">
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 8892"
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      defaultValue="08/28"
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
                    />
                    <input
                      type="password"
                      defaultValue="•••"
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-2 text-xs">
                  <select
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    <option>HDFC Bank • Internet Banking</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleExecutePayment}
              disabled={isProcessingPayment}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authorizing Transaction...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Authorize & Pay ₹{grandTotal}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}