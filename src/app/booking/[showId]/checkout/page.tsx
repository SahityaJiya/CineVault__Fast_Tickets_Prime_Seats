'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Utensils, 
  Plus, 
  Minus,
  Mail,
  AlertTriangle,
  Ticket,
  User,
  Phone
} from 'lucide-react';
import { finalizeBookingAction } from '@/actions/bookings';
import { unlockSeatsAction } from '@/actions/locking';

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
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 15-Minute Countdown persisted per session
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!showId) return;
    const storageKey = `checkout_timer_expiry_${showId}`;
    const storedExpiry = sessionStorage.getItem(storageKey);
    let expiry = storedExpiry ? parseInt(storedExpiry, 10) : 0;
    const now = Date.now();

    if (!expiry || expiry < now) {
      expiry = now + 15 * 60 * 1000;
      sessionStorage.setItem(storageKey, expiry.toString());
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleTimeout();
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [showId]);

  const handleTimeout = async () => {
    if (showId) sessionStorage.removeItem(`checkout_timer_expiry_${showId}`);
    if (selectedSeatIds.length > 0) {
      await unlockSeatsAction(showId, selectedSeatIds);
    }
    const cancelMsg = 'transection got canceled try again and seat will be available for another persons at same time without freezing the seat.';
    router.push(`/booking/${showId}?error=${encodeURIComponent(cancelMsg)}`);
  };

  const handleCancelBack = async () => {
    if (showId) sessionStorage.removeItem(`checkout_timer_expiry_${showId}`);
    if (selectedSeatIds.length > 0) {
      await unlockSeatsAction(showId, selectedSeatIds);
    }
    const cancelMsg = 'transection got canceled try again and seat will be available for another persons at same time without freezing the seat.';
    router.push(`/booking/${showId}?error=${encodeURIComponent(cancelMsg)}`);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

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

  const handlePayAtCounter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await finalizeBookingAction({
        showId,
        seatIds: selectedSeatIds,
        totalAmount: grandTotal,
        customerEmail: customerEmail.trim().toLowerCase(),
        userName: customerName.trim() || customerEmail.split('@')[0],
        userPhone: customerPhone.trim() || undefined,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'the seat is already booked select any other seat.');
        setIsSubmitting(false);
        return;
      }

      if (showId) sessionStorage.removeItem(`checkout_timer_expiry_${showId}`);

      const queryParams = new URLSearchParams({
        showId: showId,
        bookingRef: res.data.bookingRef,
      });

      router.push(`/booking/confirmation?${queryParams.toString()}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'the seat is already booked select any other seat.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleCancelBack}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Seat Matrix
        </button>
        <span className="font-bold text-sm tracking-wide text-zinc-200 uppercase">
          Review & Checkout
        </span>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Persisted 15-Minute Countdown Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-amber-400 animate-pulse flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">Transaction Window: 15 Minutes</p>
              <p className="text-zinc-400 text-xs">Complete counter booking before timeout or seats will be released.</p>
            </div>
          </div>
          <span className="font-mono font-extrabold px-3 py-1.5 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-400 text-sm sm:text-base tracking-wider">
            {formattedTime}
          </span>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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

          {/* Order Summary & Pay at Counter */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handlePayAtCounter}
              className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 sticky top-20 shadow-2xl space-y-4"
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

              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-rose-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1">
                    <Mail className="h-3.5 w-3.5 text-rose-500" /> Email for Confirmation
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1">
                    <Phone className="h-3.5 w-3.5 text-rose-500" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <span className="text-sm font-medium text-zinc-400">Total Payable</span>
                <span className="text-xl font-black text-emerald-400">₹{grandTotal}</span>
              </div>

              {/* Single Button: Pay at Counter */}
              <button
                type="submit"
                disabled={selectedSeatIds.length === 0 || isSubmitting}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                <Ticket className="h-4 w-4" />
                {isSubmitting ? 'Reserving Seats...' : 'Pay at Counter'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant Counter Code Generation & Verification</span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}