<template>
  <div class="buyer-home">

    <!-- GREETING HEADER -->
    <div class="greeting-section">
      <div class="greeting-text">
        <h1 class="greeting-title">Selamat datang, {{ firstName }}! 👋</h1>
        <p class="greeting-sub">Anda masuk sebagai <strong class="role-tag">Buyer</strong></p>
      </div>
      <div class="greeting-date">{{ todayLabel }}</div>
    </div>

    <!-- STAT CARDS -->
    <div class="stat-grid">
      <!-- Saldo -->
      <div class="stat-card stat-card--primary" @click="router.push('/buyer/wallet')">
        <div class="stat-card-bg" />
        <div class="stat-icon-wrap stat-icon--blue">
          <CreditCard :size="20" color="#3b82f6" />
        </div>
        <div class="stat-content">
          <p class="stat-label">Saldo Dompet</p>
          <p class="stat-value">{{ walletLoading ? '—' : formatPrice(wallet?.balance ?? 0) }}</p>
        </div>
        <div class="stat-arrow">→</div>
      </div>

      <!-- Keranjang -->
      <div class="stat-card" @click="router.push('/buyer/cart')">
        <div class="stat-icon-wrap stat-icon--green">
          <ShoppingCart :size="20" color="#16a34a" />
        </div>
        <div class="stat-content">
          <p class="stat-label">Keranjang</p>
          <p class="stat-value">{{ cartCount }} <span class="stat-unit">item</span></p>
        </div>
        <div class="stat-arrow">→</div>
      </div>

      <!-- Pesanan -->
      <div class="stat-card" @click="router.push('/buyer/orders')">
        <div class="stat-icon-wrap stat-icon--orange">
          <FileText :size="20" color="#ea580c" />
        </div>
        <div class="stat-content">
          <p class="stat-label">Pesanan Aktif</p>
          <p class="stat-value">{{ activeOrderCount }} <span class="stat-unit">pesanan</span></p>
        </div>
        <div class="stat-arrow">→</div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div class="quick-actions">
      <button class="btn-action btn-action--primary" @click="router.push('/products')">
        <Search :size="15" />
        Jelajahi Produk
      </button>
      <button class="btn-action btn-action--outline" @click="router.push('/buyer/wallet')">
        <CreditCard :size="15" />
        Top Up Saldo
      </button>
      <button class="btn-action btn-action--outline" @click="router.push('/buyer/orders')">
        <FileText :size="15" />
        Semua Pesanan
      </button>
    </div>

    <!-- RECENT ORDERS -->
    <div class="section-header">
      <h2 class="section-title">Pesanan Terakhir</h2>
      <RouterLink to="/buyer/orders" class="section-link">Lihat Semua →</RouterLink>
    </div>

    <!-- Skeleton -->
    <div v-if="ordersLoading" class="orders-card">
      <div v-for="i in 4" :key="i" class="order-skeleton">
        <div class="skel skel-text" />
        <div class="skel skel-badge" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="recentOrders.length === 0" class="orders-empty">
      <FileText :size="36" color="#f3c6d4" />
      <p>Belum ada pesanan.</p>
      <button class="btn-action btn-action--primary" style="margin-top:8px;" @click="router.push('/products')">
        Mulai Belanja
      </button>
    </div>

    <!-- List -->
    <div v-else class="orders-card">
      <div
        v-for="(order, idx) in recentOrders"
        :key="order.id"
        class="order-row"
        :class="{ 'order-row--last': idx === recentOrders.length - 1 }"
        @click="router.push(`/buyer/orders/${order.id}`)"
      >
        <div class="order-left">
          <div class="order-id">#{{ order.id }}</div>
          <div class="order-store">
            {{ order.store?.name }}
            <template v-if="order.items?.length > 1"> · +{{ order.items.length - 1 }} item</template>
          </div>
        </div>
        <div class="order-right">
          <span class="status-badge" :class="`status--${order.status}`">
            {{ statusLabel(order.status) }}
          </span>
          <div class="order-price">{{ formatPrice(order.total) }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { CreditCard, ShoppingCart, FileText, Search } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { buyerApi } from '@/services/buyer'

const auth = useAuthStore()
const router = useRouter()
const wallet = ref(null)
const cart = ref(null)
const recentOrders = ref([])
const walletLoading = ref(true)
const ordersLoading = ref(true)

const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'Kamu')
const cartCount = computed(() => cart.value?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0)
const activeOrderCount = computed(() =>
  recentOrders.value.filter(o => !['pesanan_selesai', 'dikembalikan'].includes(o.status)).length
)
const todayLabel = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

function formatPrice(p) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)
}
function statusLabel(s) {
  return {
    sedang_dikemas: 'Diproses',
    menunggu_pengirim: 'Menunggu Kurir',
    sedang_dikirim: 'Dikirim',
    pesanan_selesai: 'Selesai',
    dikembalikan: 'Dikembalikan',
  }[s] || s
}

onMounted(async () => {
  const [w, c, o] = await Promise.allSettled([
    buyerApi.getWallet(),
    buyerApi.getCart(),
    buyerApi.getOrders(),
  ])
  if (w.status === 'fulfilled') wallet.value = w.value.data.data
  walletLoading.value = false
  if (c.status === 'fulfilled') cart.value = c.value.data.data
  if (o.status === 'fulfilled') recentOrders.value = (o.value.data.data || o.value.data).slice(0, 5)
  ordersLoading.value = false
})
</script>

<style scoped>
.buyer-home { display: flex; flex-direction: column; gap: 28px; }

/* ── GREETING ── */
.greeting-section {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
}
.greeting-title {
  font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #1a1a1a; margin-bottom: 4px;
}
.greeting-sub { font-size: 13px; color: #a06070; }
.role-tag {
  display: inline-block; background: #fce7ef; color: #c41952;
  border: 1px solid #f3c6d4; border-radius: 9999px;
  padding: 1px 10px; font-size: 12px; font-weight: 700;
}
.greeting-date {
  font-size: 12px; color: #a06070; font-weight: 500;
  white-space: nowrap; padding-top: 4px;
}

/* ── STAT CARDS ── */
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.stat-card {
  background: #fff; border: 1.5px solid #f3e0e6; border-radius: 18px;
  padding: 20px; display: flex; align-items: center; gap: 14px;
  cursor: pointer; position: relative; overflow: hidden;
  transition: border-color .18s, box-shadow .18s, transform .15s;
}
.stat-card:hover {
  border-color: #f3c6d4; box-shadow: 0 6px 24px rgba(196,25,82,0.09);
  transform: translateY(-2px);
}
.stat-card--primary {
  background: linear-gradient(135deg, #c41952 0%, #9b1242 100%);
  border-color: transparent;
}
.stat-card--primary .stat-label { color: rgba(255,255,255,0.75); }
.stat-card--primary .stat-value { color: #fff; }
.stat-card--primary .stat-arrow { color: rgba(255,255,255,0.6); }
.stat-card-bg {
  position: absolute; top: -30px; right: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(255,255,255,0.07); pointer-events: none;
}

.stat-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.stat-icon--blue  { background: #eff6ff; }
.stat-icon--green { background: #f0fdf4; }
.stat-icon--orange{ background: #fff7ed; }
.stat-card--primary .stat-icon-wrap { background: rgba(255,255,255,0.18); }

.stat-content { flex: 1; min-width: 0; }
.stat-label { font-size: 11px; color: #a06070; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.stat-value { font-size: 18px; font-weight: 800; letter-spacing: -0.03em; color: #1a1a1a; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat-unit { font-size: 13px; font-weight: 500; color: #a06070; }
.stat-arrow { font-size: 16px; color: #f3c6d4; flex-shrink: 0; }

/* ── QUICK ACTIONS ── */
.quick-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-action {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 10px; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background .15s, transform .1s, box-shadow .15s;
}
.btn-action--primary {
  background: #c41952; color: #fff;
  box-shadow: 0 4px 14px rgba(196,25,82,0.28);
}
.btn-action--primary:hover { background: #a0153f; transform: translateY(-1px); }
.btn-action--outline {
  background: #fff; color: #4b1f30;
  border: 1.5px solid #f3e0e6;
}
.btn-action--outline:hover { border-color: #f3c6d4; color: #c41952; background: #fff0f4; }

/* ── SECTION HEADER ── */
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: 15px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.02em; }
.section-link { font-size: 12px; font-weight: 600; color: #c41952; text-decoration: none; }
.section-link:hover { text-decoration: underline; }

/* ── ORDERS ── */
.orders-card {
  background: #fff; border: 1.5px solid #f3e0e6; border-radius: 18px; overflow: hidden;
}

.order-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; cursor: pointer; border-bottom: 1px solid #fce7ef;
  transition: background .13s;
}
.order-row:hover { background: #fff8fa; }
.order-row--last { border-bottom: none; }

.order-left { min-width: 0; }
.order-id { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 3px; }
.order-store { font-size: 11px; color: #a06070; }

.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
.order-price { font-size: 13px; font-weight: 800; color: #c41952; }

/* Status badges */
.status-badge {
  display: inline-block; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 9999px; border: 1px solid;
}
.status--sedang_dikemas       { background: #fefce8; color: #a16207; border-color: #fde68a; }
.status--menunggu_pengirim    { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.status--sedang_dikirim       { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.status--pesanan_selesai      { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.status--dikembalikan         { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

/* Empty state */
.orders-empty {
  background: #fff; border: 1.5px solid #f3e0e6; border-radius: 18px;
  padding: 48px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: #a06070; font-size: 14px; text-align: center;
}

/* Skeleton */
.order-skeleton {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid #fce7ef;
}
.skel {
  background: linear-gradient(90deg, #fce7ef 25%, #f9d0dc 50%, #fce7ef 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px;
}
.skel-text  { height: 32px; width: 45%; }
.skel-badge { height: 28px; width: 22%; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

@media (max-width: 640px) {
  .stat-grid { grid-template-columns: 1fr; }
  .greeting-date { display: none; }
}
</style>
