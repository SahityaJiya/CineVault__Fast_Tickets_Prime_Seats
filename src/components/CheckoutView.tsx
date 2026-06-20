'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutShowDetails, FnBItem } from '@/types';
import { Clock, Film, UtensilsCrossed, Plus, Minus, ShieldCheck, Ticket, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const FNB_CATALOG: FnBItem[] = [
  {
    id: 'fnb-1',
    name: 'Jumbo Butter Popcorn + Coke',
    description: 'Fresh warm gourmet butter popcorn (180g) with 650ml chilled Coke.',
    price: 390,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'fnb-2',
    name: 'Loaded Cheese Nachos',
    description: 'Crispy corn tortilla chips served with warm jalapeño cheese dip and fresh salsa.',
    price: 280,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'fnb-3',
    name: 'Caramel Crunch Popcorn',
    description: 'Signature large tub coated with slow-cooked rich artisan caramel.',
    price: 320,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'fnb-4',
    name: 'Cold Coffee Frappe',
    description: '350ml whipped iced espresso blend with creamy chocolate drizzle.',
    price: 240,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=400&auto=format&fit=crop',
  },
];

interface CheckoutViewProps {
  details: CheckoutShowDetails;
}

export default function CheckoutView({ details }: CheckoutViewProps) {
  const router = useRouter();
  const [fnbCart, setFnbCart] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes TTL
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Your seat reservation lock has expired. Redirecting to show layout.');
          router.push(`/booking/${details.showId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [details.showId, router]);

  const updateFnBQuantity = (itemId: string, delta: number) => {
    setFnbCart((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const ticketSubtotal = details.selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const fnbSubtotal = Object.entries(fnbCart).reduce((sum, [id, qty]) => {
    const item = FNB_CATALOG.find((f) => f.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const convenienceFee = details.selectedSeats.length * 35;
  const gst = Math.round((convenienceFee + fnbSubtotal) * 0.18);
  const grandTotal = ticketSubtotal + fnbSubtotal + convenienceFee + gst;

  const handleCompleteBooking = async () => {
    setIsProcessing(true);
    const seatIdList = details.selectedSeats.map((s) => s.id).join(',');
    setTimeout(() => {
      router.push(`/booking/confirmation?showId=${details.showId}&seatIds=${seatIdList}&total=${grandTotal}`);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* 10-Minute Lock Status Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-8">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>Your selected seats are temporarily locked. Complete checkout before timer expires.</span>
        </div>
        <span className="font-mono font-bold text-base bg-amber-500/20 px-3 py-1 rounded-xl">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: F&B Upsell */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <UtensilsCrossed className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-bold text-white">Grab a Bite (F&B Combos)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FNB_CATALOG.map((item) => {
              const qty = fnbCart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="flex flex-col p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover bg-zinc-800 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                      <span className="font-extrabold text-sm text-rose-400 mt-2 block">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">{item.category}</span>

                    {qty === 0 ? (
                      <button
                        onClick={() => updateFnBQuantity(item.id, 1)}
                        className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-xs font-bold text-white transition flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-zinc-800 px-2 py-1 rounded-xl">
                        <button
                          onClick={() => updateFnBQuantity(item.id, -1)}
                          className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-300"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white">{qty}</span>
                        <button
                          onClick={() => updateFnBQuantity(item.id, 1)}
                          className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-300"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Booking Summary & Final Pay */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6 shadow-xl">
            {/* Show Info */}
            <div className="flex gap-4 pb-4 border-b border-zinc-800">
              <img
                src={details.moviePosterUrl}
                alt={details.movieTitle}
                className="w-16 aspect-[2/3] rounded-lg object-cover bg-zinc-800 flex-shrink-0"
              />
              <div>
                <h3 className="font-bold text-base text-white">{details.movieTitle}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{details.theaterName}</p>
                <p className="text-xs text-rose-400 font-medium mt-1">
                  {new Date(details.startTime).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Seats Pill */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Seats ({details.selectedSeats.length}):</span>
              <span className="font-bold text-white">
                {details.selectedSeats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')}
              </span>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 text-xs text-zinc-300 border-t border-zinc-800/80 pt-4">
              <div className="flex justify-between">
                <span>Tickets Subtotal</span>
                <span className="font-medium text-white">₹{ticketSubtotal}</span>
              </div>

              {fnbSubtotal > 0 && (
                <div className="flex justify-between text-rose-300">
                  <span>Food & Beverages</span>
                  <span className="font-medium">₹{fnbSubtotal}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Convenience Fee</span>
                <span>₹{convenienceFee}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Integrated GST (18%)</span>
                <span>₹{gst}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-white border-t border-zinc-800 pt-3">
                <span>Amount Payable</span>
                <span className="text-emerald-400 text-base">₹{grandTotal}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              disabled={isProcessing}
              onClick={handleCompleteBooking}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>{isProcessing ? 'Confirming Ticket...' : `Pay ₹${grandTotal}`}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}