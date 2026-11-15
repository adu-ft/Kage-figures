import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Database,
  Download,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { formatINR } from '../data/catalog';
import {
  adminLogin,
  deleteAdminOrder,
  fetchAdminOrders,
  fetchAdminSubscribers,
  updateAdminOrderStatus,
  type NewsletterSubscriberRecord,
  type OrderRecord,
  type OrderStatus,
} from '../utils/supabaseClient';

const ADMIN_TOKEN_STORAGE_KEY = 'kage_figures_admin_token_v1';

const ORDER_STATUS_OPTIONS: Array<{
  value: OrderStatus;
  label: string;
  badgeClass: string;
}> = [
  {
    value: 'pending',
    label: 'Pending',
    badgeClass: 'bg-[#feb913]/20 text-[#92400e] border-[#feb913]/50',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
    badgeClass: 'bg-[#e0f2fe] text-[#075985] border-[#0284c7]/25',
  },
  {
    value: 'packed',
    label: 'Packed',
    badgeClass: 'bg-[#ede9fe] text-[#5b21b6] border-[#7c3aed]/25',
  },
  {
    value: 'shipped',
    label: 'Shipped',
    badgeClass: 'bg-[#f3f4f6] text-[#1a1a1a] border-[#1a1a1a]/20',
  },
  {
    value: 'delivered',
    label: 'Delivered',
    badgeClass: 'bg-[#dcfce7] text-[#166534] border-[#16a34a]/30',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    badgeClass: 'bg-[#fee2e2] text-[#991b1b] border-[#ef4444]/30',
  },
];

const SCHEMA_SQL_SNIPPET = `create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address text not null,
  locality text not null,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  delivery_estimate text,
  items jsonb not null default '[]'::jsonb,
  subtotal_inr integer not null check (subtotal_inr >= 0),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'footer_dispatch',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Allow public order insert" on public.orders;
create policy "Allow public order insert"
  on public.orders for insert to anon, authenticated
  with check (
    length(trim(order_number)) > 0
    and length(trim(customer_name)) >= 3
    and length(trim(customer_phone)) >= 10
    and length(trim(pincode)) = 6
  );

drop policy if exists "Allow public newsletter insert" on public.newsletter_subscribers;
create policy "Allow public newsletter insert"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (length(trim(email)) >= 5 and position('@' in email) > 1);`;

interface AdminOrdersPageProps {
  onBack: () => void;
}

export function AdminOrdersPage({ onBack }: AdminOrdersPageProps) {
  const [token, setToken] = useState<string>(() => {
    try {
      return window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'subscribers'>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [schemaPending, setSchemaPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [updatingOrderNo, setUpdatingOrderNo] = useState<string | null>(null);
  const [confirmDeleteNo, setConfirmDeleteNo] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSignOut = useCallback(() => {
    try {
      window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setToken('');
    setOrders([]);
    setSubscribers([]);
    setPasscode('');
  }, []);

  const loadDashboardData = useCallback(
    async (authToken: string) => {
      if (!authToken) return;
      setLoading(true);
      setLoadError(null);
      const [ordersRes, subsRes] = await Promise.all([
        fetchAdminOrders(authToken),
        fetchAdminSubscribers(authToken),
      ]);
      setLoading(false);

      if (ordersRes.unauthorized) {
        handleSignOut();
        setAuthError('Session expired. Please sign in again.');
        return;
      }

      if (!ordersRes.ok) {
        setLoadError(ordersRes.error || 'Could not load orders.');
        return;
      }

      setOrders(ordersRes.orders);
      setSchemaPending(Boolean(ordersRes.schemaPending));
      if (subsRes.ok) {
        setSubscribers(subsRes.subscribers);
      }
    },
    [handleSignOut],
  );

  useEffect(() => {
    if (token) {
      void loadDashboardData(token);
    }
  }, [token, loadDashboardData]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || loggingIn) return;
    setLoggingIn(true);
    setAuthError(null);

    const res = await adminLogin(passcode.trim());
    setLoggingIn(false);

    if (!res.ok || !res.token) {
      setAuthError(res.error || 'Invalid passcode.');
      return;
    }

    try {
      window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, res.token);
    } catch {
      // ignore
    }
    setToken(res.token);
    setPasscode('');
  };

  const handleStatusChange = async (
    orderNumber: string,
    nextStatus: OrderStatus,
  ) => {
    if (!token) return;
    setUpdatingOrderNo(orderNumber);
    const res = await updateAdminOrderStatus(token, orderNumber, nextStatus);
    setUpdatingOrderNo(null);

    if (res.ok && res.order) {
      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === orderNumber ? { ...o, status: nextStatus } : o,
        ),
      );
    } else if (res.error) {
      setLoadError(res.error);
    }
  };

  const handleDeleteOrder = async (orderNumber: string) => {
    if (!token) return;
    setUpdatingOrderNo(orderNumber);
    const res = await deleteAdminOrder(token, orderNumber);
    setUpdatingOrderNo(null);
    setConfirmDeleteNo(null);

    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.order_number !== orderNumber));
    } else if (res.error) {
      setLoadError(res.error);
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_SQL_SNIPPET);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_phone.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q) ||
        order.pincode.includes(q) ||
        order.shipping_address.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Order Number',
      'Status',
      'Customer Name',
      'Phone',
      'Address',
      'Locality',
      'City',
      'State',
      'PIN',
      'Subtotal INR',
      'Items',
      'Created At',
    ];
    const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const rows = filteredOrders.map((o) => [
      o.order_number,
      o.status,
      o.customer_name,
      o.customer_phone,
      o.shipping_address,
      o.locality,
      o.city,
      o.state,
      o.pincode,
      String(o.subtotal_inr),
      o.items.map((it) => `${it.title} x${it.quantity}`).join('; '),
      o.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => escapeCell(c)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kage-figures-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const activeCount = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'packed' || o.status === 'shipped',
  ).length;
  const totalValue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.subtotal_inr || 0), 0);

  return (
    <div className="bg-[#f0f0f0] pt-[68px] sm:pt-[76px] pb-16 min-h-[82vh]">
      <div className="fixed top-0 left-0 right-0 h-[58px] sm:h-[66px] bg-[#141414]/95 backdrop-blur-md z-30 pointer-events-none" />

      <div className="container-site pt-5 sm:pt-7">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1a1a1a] hover:text-[#f83a3a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>

          {token && (
            <button
              type="button"
              onClick={handleSignOut}
              className="h-9 px-4 rounded-full bg-white border border-[#1a1a1a]/15 text-[13px] font-bold text-[#1a1a1a] hover:border-[#f83a3a] hover:text-[#f83a3a] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Vault Panel</span>
            </button>
          )}
        </div>

        {!token ? (
          <div className="max-w-[440px] mx-auto bg-white rounded-[12px] p-6 sm:p-8 shadow-[0_10px_28px_0_#1A1A1A14] border border-[#1a1a1a]/[0.07] mt-6">
            <div className="w-11 h-11 rounded-full bg-[#1a1a1a] text-[#feb913] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-[24px] font-bold text-[#1a1a1a] leading-tight mb-1.5">
              Kage Figures Vault Admin
            </h1>
            <p className="text-[14px] text-[#1a1a1ab3] mb-6">
              Restricted order management console. Enter your admin passcode to
              view and manage customer orders.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="vault-admin-passcode"
                  className="block text-[12px] font-bold text-[#1a1a1ab3] mb-1.5"
                >
                  Admin Passcode
                </label>
                <input
                  id="vault-admin-passcode"
                  type="password"
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter admin passcode"
                  className="input !pt-0"
                />
              </div>

              {authError && (
                <p className="text-[12.5px] font-semibold text-[#f83a3a] flex items-center gap-1.5 m-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={loggingIn || !passcode.trim()}
                className="button-primary w-full disabled:opacity-60"
              >
                {loggingIn ? 'Verifying...' : 'Unlock Orders Panel'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="badge-pill mb-2">Vault Admin Console</span>
                <h1 className="text-[28px] sm:text-[36px] font-bold text-[#1a1a1a] leading-tight m-0">
                  Orders &amp; Dispatch Management
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void loadDashboardData(token)}
                  disabled={loading}
                  className="h-10 px-4 rounded-full bg-white border border-[#1a1a1a]/15 hover:border-[#1a1a1a] text-[13px] font-bold text-[#1a1a1a] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                  />
                  <span>Refresh</span>
                </button>
                {filteredOrders.length > 0 && activeTab === 'orders' && (
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="h-10 px-4 rounded-full bg-[#1a1a1a] text-white text-[13px] font-bold hover:bg-black inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#feb913]" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* Supabase Schema Setup Prompt (shown inside admin panel only when tables don't exist yet) */}
            {schemaPending && (
              <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-[#feb913] shadow-[0_5px_15px_0_#1A1A1A0D]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#feb913]/20 text-[#1a1a1a] flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1a1a1a] m-0 mb-1">
                        Initialize Supabase Tables (One-Time Step)
                      </h2>
                      <p className="text-[13.5px] text-[#1a1a1ab3] m-0">
                        Your Supabase project is connected, but the{' '}
                        <code className="font-mono text-[#1a1a1a] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                          public.orders
                        </code>{' '}
                        table has not been created yet. Copy the SQL below and
                        run it once in your{' '}
                        <strong>Supabase Dashboard → SQL Editor</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="h-10 px-4 rounded-full bg-[#1a1a1a] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#feb913]" />
                          <span>SQL Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#feb913]" />
                          <span>Copy SQL Schema</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loadError && (
              <div className="bg-[#fff5f5] border border-[#f83a3a]/30 text-[#991b1b] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#f83a3a]" />
                <span>{loadError}</span>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-[10px] p-4 border border-[#1a1a1a]/[0.07]">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3] block mb-1">
                  Total Orders
                </span>
                <span className="text-[24px] sm:text-[28px] font-extrabold text-[#1a1a1a] tabular-nums">
                  {orders.length}
                </span>
              </div>
              <div className="bg-white rounded-[10px] p-4 border border-[#1a1a1a]/[0.07]">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3] block mb-1">
                  Pending Confirmation
                </span>
                <span className="text-[24px] sm:text-[28px] font-extrabold text-[#f83a3a] tabular-nums">
                  {pendingCount}
                </span>
              </div>
              <div className="bg-white rounded-[10px] p-4 border border-[#1a1a1a]/[0.07]">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3] block mb-1">
                  Confirmed / In Transit
                </span>
                <span className="text-[24px] sm:text-[28px] font-extrabold text-[#1a1a1a] tabular-nums">
                  {activeCount}
                </span>
              </div>
              <div className="bg-white rounded-[10px] p-4 border border-[#1a1a1a]/[0.07]">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3] block mb-1">
                  Order Value (Excl. Cancelled)
                </span>
                <span className="text-[24px] sm:text-[28px] font-extrabold text-[#1a1a1a] tabular-nums">
                  {formatINR(totalValue)}
                </span>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex items-center gap-2 border-b border-[#1a1a1a]/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`h-9 px-4 rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white text-[#1a1a1a] border border-[#1a1a1a]/12'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Customer Orders ({orders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subscribers')}
                className={`h-9 px-4 rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'subscribers'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white text-[#1a1a1a] border border-[#1a1a1a]/12'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Subscribers ({subscribers.length})</span>
              </button>
            </div>

            {activeTab === 'orders' ? (
              <>
                {/* Search & Status Filter */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-[420px]">
                    <Search className="w-4 h-4 text-[#1a1a1ab3] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search order #, name, phone, city, or PIN..."
                      className="input !pt-0 !pl-10 !h-10 !text-[14px]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`h-8 px-3 rounded-full text-[12px] font-bold shrink-0 border cursor-pointer ${
                        statusFilter === 'all'
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/12'
                      }`}
                    >
                      All ({orders.length})
                    </button>
                    {ORDER_STATUS_OPTIONS.map((opt) => {
                      const count = orders.filter(
                        (o) => o.status === opt.value,
                      ).length;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatusFilter(opt.value)}
                          className={`h-8 px-3 rounded-full text-[12px] font-bold shrink-0 border cursor-pointer ${
                            statusFilter === opt.value
                              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                              : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/12'
                          }`}
                        >
                          {opt.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Orders List */}
                {loading && orders.length === 0 ? (
                  <div className="bg-white rounded-[12px] p-10 text-center text-[14px] text-[#1a1a1ab3]">
                    Loading customer orders...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-[12px] p-10 text-center border border-[#1a1a1a]/[0.06]">
                    <p className="text-[17px] font-bold text-[#1a1a1a] mb-1">
                      No orders found
                    </p>
                    <p className="text-[13.5px] text-[#1a1a1ab3] m-0">
                      {orders.length === 0
                        ? 'Orders submitted by customers from Collector Bag will appear here automatically.'
                        : 'Try clearing your search query or changing the status filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredOrders.map((order) => {
                      const statusMeta =
                        ORDER_STATUS_OPTIONS.find(
                          (s) => s.value === order.status,
                        ) || ORDER_STATUS_OPTIONS[0];
                      const isUpdating = updatingOrderNo === order.order_number;

                      return (
                        <article
                          key={order.id || order.order_number}
                          className="bg-white rounded-[12px] p-4 sm:p-5 border border-[#1a1a1a]/[0.07] shadow-[0_3px_12px_0_#1A1A1A08]"
                        >
                          {/* Top Row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#1a1a1a]/10">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-[16px] sm:text-[18px] font-extrabold text-[#1a1a1a] tabular-nums">
                                #{order.order_number}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                              <span className="text-[12px] text-[#1a1a1ab3]">
                                {new Date(order.created_at).toLocaleString(
                                  'en-IN',
                                  {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  },
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="sr-only" htmlFor={`status-${order.order_number}`}>
                                Update order status
                              </label>
                              <select
                                id={`status-${order.order_number}`}
                                value={order.status}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  void handleStatusChange(
                                    order.order_number,
                                    e.target.value as OrderStatus,
                                  )
                                }
                                className="h-9 px-3 rounded-[8px] border border-[#1a1a1a]/20 bg-[#f7f7f7] text-[13px] font-bold text-[#1a1a1a] cursor-pointer disabled:opacity-50"
                              >
                                {ORDER_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              {confirmDeleteNo === order.order_number ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      void handleDeleteOrder(order.order_number)
                                    }
                                    className="h-9 px-3 rounded-[8px] bg-[#f83a3a] text-white text-[12px] font-bold cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteNo(null)}
                                    className="h-9 px-2.5 rounded-[8px] border border-[#1a1a1a]/15 text-[12px] font-bold text-[#1a1a1a] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  aria-label={`Delete order ${order.order_number}`}
                                  onClick={() =>
                                    setConfirmDeleteNo(order.order_number)
                                  }
                                  className="h-9 w-9 rounded-[8px] border border-[#1a1a1a]/15 text-[#1a1a1ab3] hover:text-[#f83a3a] hover:border-[#f83a3a]/40 inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Customer & Items Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-5 space-y-1.5 text-[13.5px]">
                              <div className="flex items-center gap-2 font-bold text-[#1a1a1a]">
                                <User className="w-4 h-4 text-[#f83a3a] shrink-0" />
                                <span>{order.customer_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#1a1a1a]">
                                <Phone className="w-4 h-4 text-[#1a1a1ab3] shrink-0" />
                                <a
                                  href={`tel:${order.customer_phone.replace(/\s+/g, '')}`}
                                  className="font-semibold hover:text-[#f83a3a]"
                                >
                                  {order.customer_phone}
                                </a>
                              </div>
                              <div className="flex items-start gap-2 text-[#1a1a1ab3]">
                                <MapPin className="w-4 h-4 text-[#f83a3a] shrink-0 mt-0.5" />
                                <span>
                                  {order.shipping_address}
                                  <br />
                                  <strong className="text-[#1a1a1a]">
                                    {order.locality}, {order.city},{' '}
                                    {order.state} – {order.pincode}
                                  </strong>
                                  {order.delivery_estimate
                                    ? ` · ETA: ${order.delivery_estimate}`
                                    : ''}
                                </span>
                              </div>
                            </div>

                            <div className="lg:col-span-7 bg-[#f7f7f7] rounded-[8px] p-3.5 border border-[#1a1a1a]/[0.06] flex flex-col justify-between">
                              <div className="space-y-1.5">
                                {Array.isArray(order.items) &&
                                  order.items.map((item, idx) => (
                                    <div
                                      key={`${item.productId}-${idx}`}
                                      className="flex items-center justify-between gap-3 text-[13px]"
                                    >
                                      <span className="text-[#1a1a1a] font-semibold truncate">
                                        {item.quantity} × {item.title}{' '}
                                        <span className="text-[#1a1a1ab3] font-normal">
                                          ({item.code})
                                        </span>
                                      </span>
                                      <span className="font-bold text-[#1a1a1a] tabular-nums shrink-0">
                                        {formatINR(
                                          item.unitPrice * item.quantity,
                                        )}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                              <div className="pt-2.5 mt-2.5 border-t border-[#1a1a1a]/10 flex items-center justify-between">
                                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#1a1a1ab3]">
                                  Order Total
                                </span>
                                <span className="text-[17px] font-extrabold text-[#1a1a1a] tabular-nums">
                                  {formatINR(order.subtotal_inr)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[12px] border border-[#1a1a1a]/[0.07] overflow-hidden">
                {subscribers.length === 0 ? (
                  <div className="p-10 text-center text-[14px] text-[#1a1a1ab3]">
                    No newsletter subscribers yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1a1a1a]/10">
                    {subscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-[14px]"
                      >
                        <span className="font-bold text-[#1a1a1a]">
                          {sub.email}
                        </span>
                        <span className="text-[12px] text-[#1a1a1ab3]">
                          {new Date(sub.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
