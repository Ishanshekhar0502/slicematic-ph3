import Link from 'next/link';
import { Sparkles, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-[#1F3A2E] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C8A96A] text-center relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C8A96A_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700/60 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#C8A96A] mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#C8A96A]" /> Delhi's Digital-First Pizzeria
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Artisanal Craft Pizzas <br />
            <span className="text-[#C8A96A]">Customized By You</span>
          </h1>
          
          <p className="text-base sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Construct your custom pizza combo step-by-step. Pick your crust, select gourmet toppings, and experience fresh hot delivery in 30 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/menu"
              className="w-full sm:w-auto bg-[#C8A96A] hover:bg-[#bfa262] text-[#1F3A2E] px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
            >
              Browse Menu & Order <ShoppingBag className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature / Promotion Grid */}
      <section className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1F3A2E]">
            The SliceMatic Experience
          </h2>
          <p className="text-gray-600 mt-3 text-sm sm:text-base max-w-lg mx-auto">
            We've revolutionized digital pizza ordering. No fixed recipes — you control every single detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: 10% Discount */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
            <div>
              <div className="bg-amber-100 text-amber-800 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                🎉
              </div>
              <h3 className="text-xl font-bold text-[#1F3A2E] mb-3">Bulk Order Discount</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add 5 or more pizzas to your order and unlock an automatic <strong className="text-amber-800">10% discount</strong> on your entire subtotal!
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 text-xs font-semibold text-amber-700">
              Applies automatically at checkout
            </div>
          </div>

          {/* Card 2: 30-min Guarantee */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
            <div>
              <div className="bg-emerald-100 text-[#1F3A2E] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1F3A2E] mb-3">30-Minute Guarantee</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our kitchen to your door in <strong className="text-[#1F3A2E]">30 minutes or less</strong>. Guaranteed delivery across New Ashok Nagar.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 text-xs font-semibold text-emerald-700">
              Late orders are completely free
            </div>
          </div>

          {/* Card 3: Quality First */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8A96A]/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
            <div>
              <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1F3A2E] mb-3">Artisanal Integrity</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use stone-ground grains, organic tomato purees, and hand-stretched mozzarella. Gourmet pizza quality, fast-casual speed.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 text-xs font-semibold text-[#C8A96A] uppercase tracking-wider">
              Premium Ingredients Only
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
