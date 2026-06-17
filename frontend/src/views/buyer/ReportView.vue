<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-[22px] font-bold tracking-[-0.03em]">Laporan Belanja</h1>
      <p class="text-[13px] text-muted-foreground mt-0.5">Ringkasan aktivitas belanja kamu</p>
    </div>

    <!-- Loading -->
    <div v-if="loading">
      <div class="h-64 bg-muted rounded-2xl animate-pulse" />
    </div>

    <template v-else>

      <!-- Transaction history -->
      <div class="bg-card border rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
          <h2 class="text-[15px] font-bold">Riwayat Transaksi</h2>
          <span class="text-[12px] text-muted-foreground">{{ filteredOrders.length }} transaksi</span>
        </div>

        <!-- Status filter chips -->
        <div class="px-5 py-3 border-b flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            v-for="f in filters"
            :key="f.value"
            class="shrink-0 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer"
            :class="activeFilter === f.value
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
            <span
              v-if="f.value !== 'all'"
              class="ml-1 text-[10px] font-bold opacity-70"
            >{{ filterCount(f.value) }}</span>
          </button>
        </div>

        <div v-if="!filteredOrders.length" class="flex flex-col items-center gap-3 py-16 text-center">
          <div class="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <ReceiptText class="w-5 h-5 text-muted-foreground/40" />
          </div>
          <p class="text-[14px] font-medium">Belum ada transaksi</p>
          <p class="text-[12px] text-muted-foreground">Riwayat belanja kamu akan muncul di sini</p>
        </div>

        <div v-else class="divide-y">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="px-5 py-4 hover:bg-muted/30 cursor-pointer transition-colors group"
            @click="$router.push(`/buyer/orders/${order.id}`)"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Left -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                  <span class="text-[13px] font-bold text-foreground">#{{ order.id }}</span>
                  <span :class="statusClass(order.status)" class="text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                    {{ statusLabel(order.status) }}
                  </span>
                  <!-- Voucher / Promo badges -->
                  <span v-if="order.voucher" class="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    Voucher
                  </span>
                  <span v-if="order.promo" class="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-medium">
                    Promo
                  </span>
                </div>
                <p class="text-[12px] text-muted-foreground">
                  <span class="font-medium text-foreground/70">{{ order.store?.name }}</span>
                  <span class="mx-1.5">·</span>
                  {{ formatDate(order.created_at) }}
                </p>
                <p class="text-[12px] text-muted-foreground mt-0.5">{{ order.items?.length }} produk</p>
              </div>

              <!-- Right -->
              <div class="text-right shrink-0">
                <p class="text-[14px] font-bold">{{ formatPrice(order.total) }}</p>
                <div class="mt-1 space-y-0.5">
                  <div v-if="order.discount_amount > 0" class="text-[11px] text-green-600 font-medium">
                    Diskon −{{ formatPrice(order.discount_amount) }}
                  </div>
                  <div class="text-[11px] text-muted-foreground">Ongkir {{ formatPrice(order.delivery_fee) }}</div>
                  <div class="text-[11px] text-muted-foreground">PPN {{ formatPrice(order.ppn_amount) }}</div>
                </div>
              </div>

              <!-- Arrow -->
              <ChevronRight class="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ReceiptText, ChevronRight } from '@lucide/vue'
import { buyerApi } from '@/services/buyer'

const report = ref({ summary: {}, orders: [] })
const loading = ref(true)
const activeFilter = ref('all')

const filters = [
  { value: 'all',               label: 'Semua' },
  { value: 'sedang_dikemas',    label: 'Dikemas' },
  { value: 'menunggu_pengirim', label: 'Menunggu Pengirim' },
  { value: 'sedang_dikirim',    label: 'Dikirim' },
  { value: 'pesanan_selesai',   label: 'Selesai' },
  { value: 'dikembalikan',      label: 'Dikembalikan' },
]

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return report.value.orders ?? []
  return (report.value.orders ?? []).filter(o => o.status === activeFilter.value)
})

function filterCount(status) {
  return (report.value.orders ?? []).filter(o => o.status === status).length
}

function formatPrice(p) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p ?? 0)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_MAP = {
  sedang_dikemas:     { label: 'Sedang Dikemas',    class: 'bg-amber-100 text-amber-700' },
  menunggu_pengirim:  { label: 'Menunggu Pengirim', class: 'bg-blue-100 text-blue-700' },
  sedang_dikirim:     { label: 'Sedang Dikirim',    class: 'bg-indigo-100 text-indigo-700' },
  pesanan_selesai:    { label: 'Pesanan Selesai',   class: 'bg-green-100 text-green-700' },
  dikembalikan:       { label: 'Dikembalikan',      class: 'bg-red-100 text-red-700' },
}

function statusLabel(s) { return STATUS_MAP[s]?.label ?? s }
function statusClass(s) { return STATUS_MAP[s]?.class ?? '' }

onMounted(async () => {
  try {
    const { data } = await buyerApi.getReport()
    report.value = data.data
  } finally { loading.value = false }
})
</script>
