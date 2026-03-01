import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElement } from '@stripe/stripe-js';
import { stripePromise } from '../lib/stripe';
import { CheckCircle2, Lock, Copy, Check } from 'lucide-react';
import { T } from './UIElements';

// ─── Stripe CardElement appearance ────────────────────────────────────────────
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#F1F5F9',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      letterSpacing: '0.05em',
      '::placeholder': { color: '#475569' },
      iconColor: '#F59E0B',
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
};

// ─── Inner form (uses Stripe hooks — must be inside <Elements>) ────────────────
const InnerForm: React.FC<{
  onAuthorized: (tokenId: string) => void;
  tokenId: string | null;
}> = ({ onAuthorized, tokenId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyTestCard = () => {
    navigator.clipboard?.writeText('4242424242424242');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAuthorize = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement) as unknown as StripeCardElement | null;
    if (!cardElement) { setLoading(false); return; }

    const { token, error: stripeError } = await stripe.createToken(cardElement);

    if (stripeError) {
      setError(stripeError.message ?? 'Card authorization failed.');
    } else if (token) {
      onAuthorized(token.id);
    }
    setLoading(false);
  };

  // ── Already authorized ──
  if (tokenId) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-sm"
        style={{ background: T.jadeFaint, border: `1px solid ${T.jade}40` }}
      >
        <CheckCircle2 size={16} style={{ color: T.jade }} />
        <div>
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: T.text }}>
            Card Authorized
          </p>
          <p className="text-[9px] font-mono" style={{ color: T.textDim }}>
            tok_{tokenId.slice(-8)}
          </p>
        </div>
      </div>
    );
  }

  // ── Card entry form ──
  return (
    <div className="space-y-3">
      {/* Test card hint with copy button */}
      <button
        onClick={copyTestCard}
        className="w-full flex items-center justify-between px-3 py-2 rounded-sm transition-all"
        style={{ background: T.goldFaint, border: `1px solid ${T.gold}50` }}
      >
        <div className="text-left">
          <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: T.gold }}>
            Test Card Number
          </p>
          <p className="text-xs font-mono font-bold tracking-wider mt-0.5" style={{ color: T.text }}>
            4242 4242 4242 4242
          </p>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: copied ? T.jade : T.gold }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span className="text-[9px] font-black uppercase tracking-widest">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </div>
      </button>

      <div
        className="px-4 py-3 rounded-sm"
        style={{ background: T.raised, border: `1px solid ${T.border}` }}
      >
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <p className="text-[10px]" style={{ color: T.ruby }}>
          {error}
        </p>
      )}

      <button
        onClick={handleAuthorize}
        disabled={!stripe || loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        style={{ background: T.gold, color: '#000' }}
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 rounded-full border-black/30 border-t-black animate-spin" />
            Authorizing…
          </>
        ) : (
          <>
            <Lock size={11} />
            Authorize Card
          </>
        )}
      </button>

      <p className="text-[8px] text-center" style={{ color: T.textDim }}>
        Any future expiry date · Any 3-digit CVC
      </p>
    </div>
  );
};

// ─── Public component — wraps InnerForm with Stripe Elements provider ─────────
export const StripeCardForm: React.FC<{
  onAuthorized: (tokenId: string) => void;
  tokenId: string | null;
}> = (props) => (
  <Elements stripe={stripePromise}>
    <InnerForm {...props} />
  </Elements>
);
