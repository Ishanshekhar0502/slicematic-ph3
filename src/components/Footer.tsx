export default function Footer() {
  return (
    <footer className="bg-[#1F3A2E] text-white border-t border-emerald-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#C8A96A] tracking-wider mb-3">SLICEMATIC PIZZERIA</h3>
            <p className="text-sm text-emerald-100 max-w-xs">
              Artisanal craft pizzas built by you, baked by us. Bringing authentic flavors right to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#C8A96A] uppercase tracking-wider mb-3">Our Location</h4>
            <p className="text-sm text-emerald-100">
              New Ashok Nagar, East Delhi<br />
              Delhi, 110096
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#C8A96A] uppercase tracking-wider mb-3">Hours & Guarantee</h4>
            <p className="text-sm text-emerald-100">
              Open Daily: 11:00 AM - 11:00 PM<br />
              <strong className="text-[#C8A96A]">30-Minute Delivery Guaranteed</strong> or free!
            </p>
          </div>
        </div>
        <div className="border-t border-emerald-800 mt-8 pt-6 text-center text-xs text-emerald-300">
          <p>© {new Date().getFullYear()} SliceMatic. All rights reserved. Stage 3 MVP (PostgreSQL & Next.js Edition).</p>
        </div>
      </div>
    </footer>
  );
}
