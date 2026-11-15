import { ArrowLeft, FileText, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

export type LegalPageId = 'privacy' | 'terms' | 'shipping' | 'refund';

interface LegalPageProps {
  pageId: LegalPageId;
  onSelectPage: (pageId: LegalPageId) => void;
  onBack: () => void;
}

interface PolicySection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface PolicyDocument {
  id: LegalPageId;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: PolicySection[];
}

const POLICY_TABS: Array<{
  id: LegalPageId;
  label: string;
  icon: typeof ShieldCheck;
}> = [
  { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  { id: 'shipping', label: 'Shipping Policy', icon: Truck },
  { id: 'refund', label: 'Returns & Refunds', icon: RotateCcw },
];

const POLICY_DOCS: Record<LegalPageId, PolicyDocument> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle:
      'How Kage Figures collects, protects, and uses your personal information when you browse or place an order.',
    lastUpdated: 'November 15, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        paragraphs: [
          'When you visit Kage Figures, reserve an item from the Collector Bag, or subscribe to our Collector Dispatch newsletter, we collect only the information needed to process orders and deliver your collectibles safely.',
        ],
        bullets: [
          'Contact & delivery details: Full name, mobile number, email address, street shipping address, and 6-digit Indian PIN code.',
          'Order & transaction metadata: Selected items, edition choices, GST billing details, and payment confirmation references (we never store full card numbers or UPI PINs).',
          'Device & preference signals: Basic session state and category/price filter preferences used solely to improve storefront speed and usability.',
        ],
      },
      {
        heading: '2. How We Use Your Information',
        paragraphs: [
          'Your data is used strictly to fulfill purchases, provide tracking updates, verify transit damage claims, and share restock notifications when you opt in.',
        ],
        bullets: [
          'Preparing GST invoices, custom protective packaging, and insured courier waybills.',
          'Sending order confirmation, pre-order arrival alerts, and dispatch tracking via SMS, WhatsApp, or email.',
          'Responding to customer support inquiries and 7-day transit damage cover requests.',
        ],
      },
      {
        heading: '3. Sharing With Third Parties',
        paragraphs: [
          'Kage Figures never sells, rents, or trades customer contact lists or purchase histories with external marketers. We share limited delivery details solely with trusted Indian courier partners (such as Blue Dart, Delhivery, or Xpressbees) and regulated payment gateways solely to complete your order.',
        ],
      },
      {
        heading: '4. Data Security & Retention',
        paragraphs: [
          'All storefront traffic is encrypted over HTTPS. Order records are retained only as long as required for warranty support, GST compliance, and accounting under Indian law.',
        ],
      },
      {
        heading: '5. Your Rights & Grievance Contact',
        paragraphs: [
          'You may request access to, correction of, or deletion of your contact records—or unsubscribe from dispatch alerts at any time—by emailing support@kagefigures.in or messaging @kagefigures on Instagram.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle:
      'Please review the terms governing purchases, pre-orders, collectible craftsmanship, and storefront use at Kage Figures.',
    lastUpdated: 'November 15, 2026',
    sections: [
      {
        heading: '1. General & Acceptance',
        paragraphs: [
          'By accessing or placing an order on Kage Figures, you agree to be bound by these Terms & Conditions, along with our Shipping Policy, Returns & Refunds Policy, and Privacy Policy. We reserve the right to update product availability, pricing, and policies without prior notice.',
        ],
      },
      {
        heading: '2. Collectible Craftsmanship & Katana Safety',
        paragraphs: [
          'All anime action figures, keychains, die-cast car models, manga frames, and display katanas are inspected prior to dispatch.',
        ],
        bullets: [
          'Hand-painted PVC figures and collector display pieces may exhibit minor paint or seam variations intrinsic to small-batch manufacturing.',
          'All anime katanas and kunai sets listed in our catalogue feature unsharpened ornamental edges strictly intended for wall/desk display and cosplay—never as functional blades.',
        ],
      },
      {
        heading: '3. Pricing, GST & Orders',
        paragraphs: [
          'All prices are listed in Indian Rupees (INR) inclusive of applicable GST. Orders are confirmed only upon payment authorization or Cash on Delivery verification. In the rare case of an inventory mismatch or pricing typo, Kage Figures reserves the right to cancel the order and issue a full refund immediately.',
        ],
      },
      {
        heading: '4. Collector’s Vault Pre-Orders',
        paragraphs: [
          'Pre-order items marked under Collector’s Vault allow locking an upcoming allocation with either full payment or a booking deposit. Remaining balances are payable prior to final dispatch once stock arrives at our Indore hub.',
        ],
      },
      {
        heading: '5. Intellectual Property & Governing Law',
        paragraphs: [
          'All storefront design, photography, and original copy belong to Kage Figures. Any disputes arising out of transactions on this storefront shall be governed by the laws of India, with jurisdiction in Indore, Madhya Pradesh.',
        ],
      },
    ],
  },
  shipping: {
    id: 'shipping',
    title: 'Shipping & Delivery Policy',
    subtitle:
      'Insured pan-India dispatch with double-walled protective packaging from our Indore fulfilment hub.',
    lastUpdated: 'November 15, 2026',
    sections: [
      {
        heading: '1. Processing & Dispatch Timelines',
        paragraphs: [
          'In-stock orders are inspected, bubble-wrapped, foam-cushioned, and handed over to our courier partners within 24–48 business hours (Monday to Saturday) from Indore, Madhya Pradesh.',
        ],
      },
      {
        heading: '2. Estimated Delivery Windows',
        paragraphs: [
          'Delivery timelines depend on your PIN code and courier serviceability across India:',
        ],
        bullets: [
          'Metro Cities (Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Chennai, Kolkata): 2–4 business days.',
          'Tier 2 & Rest of India: 4–6 business days.',
          'Free insured wooden/rigid crate shipping is unlocked automatically on orders of ₹2,999 and above.',
        ],
      },
      {
        heading: '3. Cash on Delivery & Order Tracking',
        paragraphs: [
          'A live courier tracking link is sent via SMS/email once dispatched. Please ensure an accurate mobile number and landmark so courier partners can reach you without delays.',
        ],
      },
    ],
  },
  refund: {
    id: 'refund',
    title: 'Returns & Refunds Policy',
    subtitle:
      '7-day transit damage cover and transparent replacement/refund resolution for all collectors.',
    lastUpdated: 'November 15, 2026',
    sections: [
      {
        heading: '1. 7-Day Transit Damage Cover',
        paragraphs: [
          'Every Kage Figures parcel is insured in transit. If your collectible arrives physically broken, missing components, or significantly damaged, we offer a free replacement or full refund.',
        ],
      },
      {
        heading: '2. Mandatory Unboxing Video Requirement',
        paragraphs: [
          'To protect collectors and verify transit claims fairly with courier partners, an unedited 360-degree unboxing video is mandatory:',
        ],
        bullets: [
          'Show the sealed outer courier box and shipping label clearly before cutting the tape.',
          'Keep the parcel within the camera frame continuously through inner box opening and damage inspection.',
          'Share the unboxing clip within 48 hours of delivery to support@kagefigures.in or @kagefigures on Instagram.',
        ],
      },
      {
        heading: '3. Non-Returnable Cases & Refund Timelines',
        paragraphs: [
          'Returns are not accepted for change-of-mind after breaking factory seals or for minor outer retail carton corner creases that do not affect the collectible inside. Approved refunds are processed within 5–7 business days back to your original UPI or payment source.',
        ],
      },
    ],
  },
};

export function LegalPage({ pageId, onSelectPage, onBack }: LegalPageProps) {
  const doc = POLICY_DOCS[pageId];

  return (
    <div className="bg-[#f0f0f0] pt-[68px] sm:pt-[76px] pb-16">
      {/* Dark top backdrop behind fixed header */}
      <div className="fixed top-0 left-0 right-0 h-[58px] sm:h-[66px] bg-[#141414]/95 backdrop-blur-md z-30 pointer-events-none" />

      <div className="container-site pt-5 sm:pt-7">
        {/* Top Back Navigation */}
        <div className="mb-5 sm:mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1a1a1a] hover:text-[#f83a3a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Kage Figures Store</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sidebar Policy Switcher */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[84px] bg-white rounded-[12px] p-4 sm:p-5 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-3">
              Store Policies &amp; Legal
            </p>
            <nav aria-label="Store policies" className="space-y-1.5">
              {POLICY_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === pageId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectPage(tab.id)}
                    className={`w-full px-3.5 py-2.5 rounded-[8px] text-[14px] font-bold flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1a1a1a] text-white'
                        : 'text-[#1a1a1a] hover:bg-[#f0f0f0]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#feb913]' : 'text-[#f83a3a]'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-5 pt-4 border-t border-[#1a1a1a]/10 text-[12.5px] text-[#1a1a1ab3] space-y-1">
              <p className="font-bold text-[#1a1a1a] m-0">Collector Support</p>
              <p className="m-0">Email: support@kagefigures.in</p>
              <p className="m-0">Hub: Indore, Madhya Pradesh, India</p>
              <p className="m-0">Hours: Mon – Sat · 10:00 AM – 7:00 PM IST</p>
            </div>
          </aside>

          {/* Right Document Content */}
          <article className="lg:col-span-8 bg-white rounded-[12px] p-6 sm:p-9 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
            <div className="pb-5 mb-6 border-b border-[#1a1a1a]/10">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#f83a3a] block mb-1.5">
                Last Updated: {doc.lastUpdated}
              </span>
              <h1 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.02em] text-[#1a1a1a] leading-tight mb-2">
                {doc.title}
              </h1>
              <p className="text-[15px] text-[#1a1a1ab3] leading-relaxed m-0">
                {doc.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              {doc.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1a1a1a] mb-2">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((p) => (
                    <p
                      key={p}
                      className="text-[14.5px] sm:text-[15px] leading-[1.65] text-[#1a1a1a]/85 mb-2.5"
                    >
                      {p}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="space-y-1.5 pl-5 list-disc text-[14px] sm:text-[14.5px] leading-[1.6] text-[#1a1a1a]/85">
                      {section.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
