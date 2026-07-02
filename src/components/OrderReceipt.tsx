import { Order } from '@/lib/types';

interface OrderReceiptProps {
  order: Order;
  customerName?: string;
  customerPhone?: string;
}

export default function OrderReceipt({ order, customerName, customerPhone }: OrderReceiptProps) {
  const name = customerName || order.profiles?.name || 'Customer';
  const phone = customerPhone || order.profiles?.phone || 'N/A';
  const mode = order.payment_mode;

  const modeMessages = {
    Cash: "💵 Please hand exact cash to the counter staff.",
    Card: "💳 Card machine will be presented — please tap or insert.",
    UPI:  "📱 Scan the QR code at the counter to complete payment.",
  };

  const formattedDate = new Date(order.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Group line items by line_number (combo) to reconstruct the pizzas ordered
  const combos: { [num: number]: any } = {};
  order.order_line_items?.forEach(item => {
    if (!combos[item.line_number]) {
      combos[item.line_number] = { base: null, pizza: null, topping: null, qty: item.quantity };
    }
    if (item.category === 'base') combos[item.line_number].base = item;
    if (item.category === 'pizza') combos[item.line_number].pizza = item;
    if (item.category === 'topping') combos[item.line_number].topping = item;
  });

  const comboList = Object.values(combos);

  return (
    <div className="font-sans border-2 border-[#14532D] rounded-xl overflow-hidden bg-white shadow-lg max-w-md mx-auto my-4 text-black">
      {/* Header */}
      <div className="bg-[#14532D] p-5 text-white">
        <div className="text-xl font-extrabold tracking-widest">🍕 SLICEMATIC</div>
        <div className="text-xs text-emerald-300 mt-1">New Ashok Nagar, East Delhi · Order Receipt</div>
      </div>

      {/* Customer Info */}
      <div className="bg-[#F0FDF4] px-5 py-3 border-b border-emerald-100 flex justify-between items-center text-sm font-semibold">
        <div>
          <span className="text-[#14532D] font-bold">{name.trim()}</span>
          <span className="text-gray-500 font-normal ml-2">· {phone.trim()}</span>
        </div>
        <div className="text-xs text-gray-500">{formattedDate}</div>
      </div>

      {/* Order Lines */}
      <div className="p-5 border-b border-gray-200">
        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Order Details</div>
        <div className="divide-y divide-gray-100">
          {comboList.map((combo, idx) => {
            const pizzaName = combo.pizza?.item_name || 'Artisanal Pizza';
            const baseName = combo.base?.item_name || 'Standard Crust';
            const toppingName = combo.topping?.item_name || 'No Topping';
            const qty = combo.qty;

            // Calculate unit cost
            const unitCost = Number(combo.pizza?.unit_price || 0) + 
                             Number(combo.base?.unit_price || 0) + 
                             Number(combo.topping?.unit_price || 0);
            const lineSubtotal = unitCost * qty;

            return (
              <div key={idx} className="py-3 flex justify-between items-start gap-4">
                <div className="text-sm">
                  <div className="font-bold text-[#14532D]">{pizzaName} <span className="text-gray-600 font-medium">× {qty}</span></div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Base: {baseName} · Topping: {toppingName}
                  </div>
                </div>
                <div className="font-bold text-sm text-[#14532D] whitespace-nowrap">
                  ₹{lineSubtotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="p-5 bg-gray-50 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="font-bold text-gray-900">₹{Number(order.subtotal).toFixed(2)}</span>
        </div>

        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-sm bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-semibold">
            <span>Discount (10% — qty ≥ 5)</span>
            <span>− ₹{Number(order.discount).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
          <span className="text-gray-600">After discount</span>
          <span className="font-bold text-gray-900">₹{(Number(order.subtotal) - Number(order.discount)).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST @ 18%</span>
          <span className="font-bold text-gray-900">₹{Number(order.gst).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-base border-t-2 border-[#14532D] pt-3 font-extrabold text-[#14532D]">
          <span>TOTAL PAYABLE</span>
          <span>₹{Number(order.final_total).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Information */}
      <div className="px-5 pb-4 pt-1 bg-gray-50">
        <div className="bg-[#DCFCE7] border-l-4 border-[#16A34A] rounded-lg p-3 text-sm">
          <div className="font-bold text-[#14532D] mb-1">💳 Payment: {mode}</div>
          <div className="text-gray-800 font-medium text-xs leading-relaxed">
            {modeMessages[mode] || ""}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-[#F0FDF4] border-t border-emerald-100 py-3 text-center text-[11px] font-semibold text-emerald-800">
        Thank you for ordering from SliceMatic · 30-min delivery guaranteed
      </div>
    </div>
  );
}
