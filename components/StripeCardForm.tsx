import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElement } from '@stripe/stripe-js';
import { stripePromise } from '../lib/stripe';
import { CheckCircle2, Lock, Copy, Check, CreditCard } from 'lucide-react';
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
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
};

// ─── Shared: already-authorized state ─────────────────────────────────────────
const AuthorizedBadge: React.FC<{ tokenId: string }> = ({ tokenId }) => (
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

// ─── Simulation mode (no Stripe key configured) ───────────────────────────────
const SimulatedForm: React.FC<{
  onAuthorized: (tokenId: string) => void;
  tokenId: string | null;
}> = ({ onAuthorized, tokenId }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyTestCard = () => {
    navigator.clipboard?.writeText('4242424242424242');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    const fakeToken = 'sim_' + Math.random().toString(36).slice(2, 14).toUpperCase();
    onAuthorized(fakeToken);
    setLoading(false);
  };

  if (tokenId) return <AuthorizedBadge tokenId={tokenId} />;

  return (
    <div className="space-y-3">
      {/* Pre-filled card display */}
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

      {/* Fake input fields */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Card Number', value: '4242  4242  4242  4242', full: true },
          { label: 'Expiry', value: '12 / 28', full: false },
          { label: 'CVC', value: '•••', full: false },
        ].map((f) => (
          <div
            key={f.label}
            className={f.full ? 'col-span-2 space-y-1' : 'space-y-1'}
          >
            <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
              {f.label}
            </p>
            <div
              className="px-3 py-2 rounded-sm text-xs font-mono font-bold flex items-center gap-2"
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
            >
              {f.label === 'Card Number' && <CreditCard size={12} style={{ color: T.gold }} />}
              {f.value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        style={{ background: T.gold, color: '#000' }}
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 rounded-full border-black/30 border-t-black animate-spin" />
            Processing Payment…
          </>
        ) : (
          <>
            <Lock size={11} />
            Pay Now
          </>
        )}
      </button>

      <p className="text-[8px] text-center" style={{ color: T.textDim }}>
        Demo mode · No real charge
      </p>
    </div>
  );
};

// ─── Real Stripe form (key configured) ────────────────────────────────────────
const StripeInnerForm: React.FC<{
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

  if (tokenId) return <AuthorizedBadge tokenId={tokenId} />;

  return (
    <div className="space-y-3">
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
        <p className="text-[10px]" style={{ color: T.ruby }}>{error}</p>
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

// ─── Public component ─────────────────────────────────────────────────────────
// Uses real Stripe when VITE_STRIPE_PUBLISHABLE_KEY is set, simulation otherwise.
export const StripeCardForm: React.FC<{
  onAuthorized: (tokenId: string) => void;
  tokenId: string | null;
}> = (props) => {
  if (!stripePromise) {
    return <SimulatedForm {...props} />;
  }
  return (
    <Elements stripe={stripePromise}>
      <StripeInnerForm {...props} />
    </Elements>
  );
};
