<template>
  <div class="order-detail">

    <button class="back-btn" @click="router.back()">
      <ArrowLeft :size="15" /> Kembali
    </button>

    <!-- Skeleton -->
    <div v-if="loading" class="skeleton-wrap">
      <div class="skel skel-title" />
      <div class="skel skel-card" />
      <div class="skel skel-card" />
      <div class="skel skel-card" />
    </div>

    <template v-else-if="order">

      <!-- Header -->
      <div class="order-header">
        <div>
          <p class="order-label">Detail Pesanan</p>
          <h1 class="order-id">Pesanan #{{ order.id }}</h1>
        </div>
        <span class="status-pill" :class="`status--${order.status}`">
          {{ statusLabel(order.status) }}
        </span>
      </div>

      <!-- 2-col layout -->
      <div class="detail-grid">

        <!-- LEFT -->
        <div class="detail-left">

          <!-- Status Timeline -->
          <div class="section-card">
            <div class="card-header">
              <div class="card-icon card-icon--purple">
                <ClipboardList :size="15" color="#7c3aed" />
              </div>
              <h2 class="card-title">Riwayat Status</h2>
            </div>
            <div class="timeline">
              <div
                v-for="(hist, i) in order.status_histories"
                :key="i"
                class="timeline-item"
                :class="{ 'timeline-item--active': i === 0 }"
              >
                <div class="timeline-dot" :class="{ 'timeline-dot--active': i === 0 }" />
                <div class="timeline-line" v-if="i < order.status_histories.length - 1" />
                <div class="timeline-body">
                  <p class="timeline-status">{{ statusLabel(hist.status) }}</p>
                  <p class="timeline-date">{{ formatDate(hist.created_at) }}</p>
                  <p v-if="hist.note" class="timeline-note">{{ hist.note }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery tracking -->
          <div v-if="tracking?.delivery" class="section-card">
            <div class="card-header">
              <div class="card-icon card-icon--blue">
                <Truck :size="15" color="#2563eb" />
              </div>
              <h2 class="card-title">Info Pengiriman</h2>
            </div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-key">Driver</span>
                <span class="info-val">{{ tracking.delivery.driver?.name ?? 'Belum ada driver' }}</span>
              </div>
              <div v-if="tracking.delivery.picked_up_at" class="info-row">
                <span class="info-key">Diambil</span>
                <span class="info-val">{{ formatDate(tracking.delivery.picked_up_at) }}</span>
              </div>
              <div v-if="tracking.delivery.delivered_at" class="info-row">
                <span class="info-key">Diterima</span>
                <span class="info-val">{{ formatDate(tracking.delivery.delivered_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="section-card">
            <div class="card-header">
              <div class="card-icon card-icon--pink">
                <Package :size="15" color="#c41952" />
              </div>
              <h2 class="card-title">Produk <span class="card-title-sub">({{ order.store?.name }})</span></h2>
            </div>
            <div class="items-list">
              <div v-for="item in order.items" :key="item.id" class="item-row">
                <div class="item-img">
                  <img v-if="item.product?.image_url" :src="item.product.image_url" :alt="item.product_name" />
                  <Package v-else :size="20" color="#f3c6d4" />
                </div>
                <div class="item-info">
                  <p class="item-name">{{ item.product_name }}</p>
                  <p class="item-qty">{{ formatPrice(item.product_price) }} × {{ item.quantity }}</p>
                </div>
                <p class="item-subtotal">{{ formatPrice(item.subtotal) }}</p>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="section-card">
            <div class="card-header">
              <div class="card-icon card-icon--green">
                <MapPin :size="15" color="#16a34a" />
              </div>
              <h2 class="card-title">Alamat Pengiriman</h2>
            </div>
            <div class="address-block">
              <p class="address-name">{{ order.address_snapshot?.recipient_name }}</p>
              <p class="address-phone">{{ order.address_snapshot?.phone }}</p>
              <p class="address-detail">
                {{ order.address_snapshot?.full_address }}, {{ order.address_snapshot?.district }},
                {{ order.address_snapshot?.city }}, {{ order.address_snapshot?.province }}
              </p>
            </div>
          </div>

        </div>

        <!-- RIGHT: Payment sticky -->
        <div class="detail-right">
          <div class="section-card payment-sticky">
            <div class="card-header">
              <div class="card-icon card-icon--orange">
                <CreditCard :size="15" color="#ea580c" />
              </div>
              <h2 class="card-title">Rincian Pembayaran</h2>
            </div>
            <div class="payment-rows">
              <div class="payment-row">
                <span class="payment-key">Subtotal</span>
                <span class="payment-val">{{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="payment-row">
                <span class="payment-key">Ongkir ({{ methodLabel(order.delivery_method) }})</span>
                <span class="payment-val">{{ formatPrice(order.delivery_fee) }}</span>
              </div>
              <div v-if="order.discount_amount > 0" class="payment-row payment-row--discount">
                <span class="payment-key">Diskon ({{ [order.voucher?.code, order.promo?.code].filter(Boolean).join(' + ') || 'diskon' }})</span>
                <span class="payment-val">−{{ formatPrice(order.discount_amount) }}</span>
              </div>
              <div class="payment-row">
                <span class="payment-key">PPN 12%</span>
                <span class="payment-val">{{ formatPrice(order.ppn_amount) }}</span>
              </div>
              <div class="payment-divider" />
              <div class="payment-row payment-row--total">
                <span>Total</span>
                <span class="payment-total">{{ formatPrice(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </template>

    <div v-else class="not-found">Pesanan tidak ditemukan.</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Truck, Package, MapPin, CreditCard, ClipboardList } from '@lucide/vue'
import { buyerApi } from '@/services/buyer'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const tracking = ref(null)
const loading = ref(true)

function formatPrice(p) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)
}
function formatDate(d) {
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}
function methodLabel(m) {
  return { instant: 'Instant', next_day: 'Next Day', regular: 'Regular' }[m] || m
}
function statusLabel(s) {
  return {
    sedang_dikemas: 'Sedang Dikemas',
    menunggu_pengirim: 'Menunggu Pengirim',
    sedang_dikirim: 'Sedang Dikirim',
    pesanan_selesai: 'Pesanan Selesai',
    dikembalikan: 'Dikembalikan',
  }[s] || s
}

onMounted(async () => {
  try {
    const [orderRes, trackingRes] = await Promise.all([
      buyerApi.getOrder(route.params.id),
      buyerApi.getTracking(route.params.id).catch(() => null),
    ])
    order.value = orderRes.data.data
    tracking.value = trackingRes?.data?.data ?? null
  } finally { loading.value = false }
})
</script>

<style scoped>
.order-detail { display: flex; flex-direction: column; gap: 20px; }

/* 2-col grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
.detail-left { display: flex; flex-direction: column; gap: 20px; }
.detail-right { display: flex; flex-direction: column; gap: 20px; }
.payment-sticky { position: sticky; top: 80px; }

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .payment-sticky { position: static; }
}

/* BACK */
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #a06070;
  background: none; border: none; cursor: pointer; font-family: inherit;
  padding: 6px 10px; border-radius: 9999px; margin-bottom: 4px;
  transition: background .15s, color .15s;
}
.back-btn:hover { background: #fce7ef; color: #c41952; }

/* HEADER */
.order-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.order-label {
  font-size: 11px; font-weight: 600; color: #a06070;
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px;
}
.order-id {
  font-size: 22px; font-weight: 800; letter-spacing: -0.04em; color: #1a1a1a;
}

/* STATUS PILL */
.status-pill {
  display: inline-block; font-size: 12px; font-weight: 700;
  padding: 5px 14px; border-radius: 9999px; border: 1.5px solid;
  white-space: nowrap; margin-top: 4px;
}
.status--sedang_dikemas    { background: #fefce8; color: #a16207; border-color: #fde68a; }
.status--menunggu_pengirim { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.status--sedang_dikirim    { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.status--pesanan_selesai   { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.status--dikembalikan      { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

/* SECTION CARD */
.section-card {
  background: #fff; border: 1.5px solid #f3e0e6;
  border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 16px;
}
.card-header { display: flex; align-items: center; gap: 10px; }
.card-icon {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.card-icon--purple { background: #f5f3ff; }
.card-icon--blue   { background: #eff6ff; }
.card-icon--pink   { background: #fce7ef; }
.card-icon--green  { background: #f0fdf4; }
.card-icon--orange { background: #fff7ed; }
.card-title {
  font-size: 14px; font-weight: 700; color: #1a1a1a;
}
.card-title-sub { font-weight: 500; color: #a06070; }

/* TIMELINE */
.timeline { display: flex; flex-direction: column; gap: 0; padding-left: 4px; }
.timeline-item { display: flex; gap: 14px; position: relative; padding-bottom: 16px; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  background: #f3e0e6; border: 2px solid #f3c6d4; margin-top: 3px;
}
.timeline-dot--active { background: #c41952; border-color: #c41952; box-shadow: 0 0 0 3px rgba(196,25,82,0.15); }
.timeline-line {
  position: absolute; left: 5px; top: 18px; bottom: 0;
  width: 2px; background: #f3e0e6;
}
.timeline-body { flex: 1; }
.timeline-status { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
.timeline-item--active .timeline-status { color: #c41952; }
.timeline-date { font-size: 11px; color: #a06070; }
.timeline-note { font-size: 11px; color: #a06070; margin-top: 2px; font-style: italic; }

/* INFO ROWS */
.info-rows { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-key { font-size: 13px; color: #a06070; }
.info-val { font-size: 13px; font-weight: 600; color: #1a1a1a; }

/* ITEMS */
.items-list { display: flex; flex-direction: column; gap: 0; }
.item-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #fce7ef;
}
.item-row:last-child { border-bottom: none; padding-bottom: 0; }
.item-row:first-child { padding-top: 0; }
.item-img {
  width: 44px; height: 44px; border-radius: 10px;
  background: #fdf2f5; border: 1px solid #f3e0e6;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
.item-qty { font-size: 11px; color: #a06070; }
.item-subtotal { font-size: 13px; font-weight: 700; color: #1a1a1a; flex-shrink: 0; }

/* ADDRESS */
.address-block { display: flex; flex-direction: column; gap: 3px; }
.address-name { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.address-phone { font-size: 12px; color: #a06070; }
.address-detail { font-size: 12px; color: #a06070; line-height: 1.6; }

/* PAYMENT */
.payment-rows { display: flex; flex-direction: column; gap: 10px; }
.payment-row { display: flex; justify-content: space-between; align-items: center; }
.payment-key { font-size: 13px; color: #a06070; }
.payment-val { font-size: 13px; color: #1a1a1a; font-weight: 500; }
.payment-row--discount .payment-key,
.payment-row--discount .payment-val { color: #16a34a; font-weight: 600; }
.payment-divider { border: none; border-top: 1.5px dashed #f3e0e6; margin: 4px 0; }
.payment-row--total { font-size: 15px; font-weight: 800; color: #1a1a1a; }
.payment-total { color: #c41952; font-size: 17px; }

/* SKELETON */
.skeleton-wrap { display: flex; flex-direction: column; gap: 16px; }
.skel {
  background: linear-gradient(90deg, #fce7ef 25%, #f9d0dc 50%, #fce7ef 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 14px;
}
.skel-title { height: 56px; width: 60%; }
.skel-card  { height: 120px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* NOT FOUND */
.not-found { text-align: center; padding: 64px 24px; color: #a06070; font-size: 14px; }
</style>
