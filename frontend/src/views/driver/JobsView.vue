<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border px-4 py-3">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-foreground tracking-tight">Cari Job</h1>
          <p class="text-xs text-muted-foreground mt-0.5">{{ filteredJobs.length }} job tersedia</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showFilter = !showFilter"
            class="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border transition-colors cursor-pointer"
            :class="hasActiveFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-accent'"
          >
            <SlidersHorizontal class="w-3.5 h-3.5" />
            Filter
            <span v-if="hasActiveFilters" class="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
          </button>
          <button
            @click="loadJobs"
            class="flex items-center gap-1.5 text-xs font-medium text-primary bg-secondary hover:bg-accent px-3 py-2 rounded-full border border-border transition-colors duration-150 cursor-pointer"
            :class="{ 'opacity-60 pointer-events-none': loading }"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>

    </div>

    <!-- Filter Panel (below sticky header, not inside it) -->
    <div v-if="showFilter && !loading" class="bg-card border-b border-border px-4 pt-3 pb-4 space-y-3">
      <!-- Sort -->
      <div>
        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Urutkan</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in sortOptions" :key="opt.value"
            @click="filters.sort = opt.value"
            class="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            :class="filters.sort === opt.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-accent'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Metode -->
      <div v-if="availableMethods.length">
        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Metode Pengiriman</p>
        <div class="flex flex-wrap gap-2">
          <button
            @click="filters.method = ''"
            class="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            :class="filters.method === ''
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-accent'"
          >
            Semua
          </button>
          <button
            v-for="m in availableMethods" :key="m"
            @click="filters.method = m"
            class="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer capitalize"
            :class="filters.method === m
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-accent'"
          >
            {{ formatMethod(m) }}
          </button>
        </div>
      </div>

      <!-- Min Earning -->
      <div>
        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Min. Earning</p>
        <div class="flex flex-wrap gap-2">
          <button
            @click="filters.minEarning = 0"
            class="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            :class="filters.minEarning === 0
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-accent'"
          >
            Semua
          </button>
          <button
            v-for="t in earningThresholds" :key="t.value"
            @click="filters.minEarning = t.value"
            class="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            :class="filters.minEarning === t.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-accent'"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- Reset -->
      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        class="w-full text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 py-2 rounded-xl border border-destructive/20 transition-colors cursor-pointer"
      >
        Reset Semua Filter
      </button>
    </div>

    <div class="px-4 py-4 space-y-3">
      <!-- Active Job Banner -->
      <div
        v-if="activeJob"
        class="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-4 shadow-lg"
      >
        <div class="absolute right-0 top-0 opacity-10">
          <Truck class="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
            <span class="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide">Job Aktif</span>
          </div>
          <p class="font-bold text-base">Pesanan #{{ activeJob.order_id }}</p>
          <p class="text-xs text-primary-foreground/70 mt-0.5">
            {{ activeJob.order?.store?.name }} · Diambil {{ formatDateTime(activeJob.picked_up_at) }}
          </p>
          <button
            @click="$router.push('/driver/my-jobs')"
            class="mt-3 inline-flex items-center gap-1.5 bg-primary-foreground text-primary text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
          >
            Lihat Detail
            <ArrowRight class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Skeleton -->
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="bg-card rounded-2xl p-4 space-y-3 animate-pulse border border-border">
          <div class="flex justify-between">
            <div class="space-y-2">
              <div class="h-3 w-28 bg-muted rounded-full" />
              <div class="h-4 w-20 bg-muted rounded-full" />
            </div>
            <div class="h-10 w-20 bg-muted rounded-xl" />
          </div>
          <div class="h-px bg-muted" />
          <div class="grid grid-cols-3 gap-2">
            <div v-for="j in 3" :key="j" class="h-10 bg-muted rounded-xl" />
          </div>
          <div class="h-8 w-full bg-muted rounded-xl" />
        </div>
      </template>

      <!-- Empty State -->
      <div
        v-else-if="!filteredJobs.length"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <PackageSearch class="w-9 h-9 text-muted-foreground/40" />
        </div>
        <p class="font-semibold text-foreground">
          {{ hasActiveFilters ? 'Tidak ada job yang sesuai filter' : 'Belum ada job tersedia' }}
        </p>
        <p class="text-sm text-muted-foreground mt-1 max-w-[220px]">
          {{ hasActiveFilters ? 'Coba ubah atau reset filter.' : 'Coba refresh beberapa saat lagi.' }}
        </p>
        <button
          @click="hasActiveFilters ? resetFilters() : loadJobs()"
          class="mt-5 text-sm font-semibold text-primary bg-secondary hover:bg-accent px-5 py-2.5 rounded-full transition-colors cursor-pointer"
        >
          {{ hasActiveFilters ? 'Reset Filter' : 'Refresh Sekarang' }}
        </button>
      </div>

      <!-- Job Cards -->
      <div v-else class="space-y-3">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-200"
        >
          <!-- Card Header -->
          <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-foreground">#{{ job.order_id }}</span>
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                  <Clock class="w-2.5 h-2.5" />
                  Menunggu Driver
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1 truncate">
                dari <span class="font-medium text-foreground">{{ job.order?.store?.name }}</span>
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-lg font-extrabold text-primary leading-tight">
                {{ formatPrice(job.order?.delivery_fee * 0.8) }}
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">penghasilanmu</p>
            </div>
          </div>

          <div class="h-px bg-border mx-4" />

          <!-- Stats Row -->
          <div class="grid grid-cols-3 gap-px bg-border mx-4 rounded-xl overflow-hidden my-3">
            <div class="bg-card px-2.5 py-2 text-center">
              <p class="text-[10px] text-muted-foreground mb-0.5">Ongkir</p>
              <p class="text-xs font-semibold text-foreground">{{ formatPrice(job.order?.delivery_fee) }}</p>
            </div>
            <div class="bg-card px-2.5 py-2 text-center">
              <p class="text-[10px] text-muted-foreground mb-0.5">Item</p>
              <p class="text-xs font-semibold text-foreground">{{ job.order?.items?.length ?? 0 }}</p>
            </div>
            <div class="bg-card px-2.5 py-2 text-center">
              <p class="text-[10px] text-muted-foreground mb-0.5">Metode</p>
              <p class="text-xs font-semibold text-foreground capitalize">{{ formatMethod(job.order?.delivery_method) }}</p>
            </div>
          </div>

          <!-- Delivery Route -->
          <div class="mx-4 mb-3 flex items-start gap-2 text-xs text-muted-foreground">
            <div class="flex flex-col items-center mt-0.5 shrink-0">
              <div class="w-2 h-2 rounded-full bg-primary" />
              <div class="w-px h-3 bg-border my-0.5" />
              <div class="w-2 h-2 rounded-full border-2 border-primary" />
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <p class="truncate"><span class="font-medium text-foreground">{{ job.order?.store?.name ?? 'Toko' }}</span></p>
              <p class="truncate">
                {{ job.order?.address_snapshot?.full_address }}<template v-if="job.order?.address_snapshot?.city">, {{ job.order?.address_snapshot?.city }}</template>
              </p>
            </div>
          </div>

          <!-- CTA -->
          <div class="px-4 pb-4">
            <button
              @click="takeJob(job)"
              :disabled="!!activeJob || taking[job.id]"
              class="w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer"
              :class="[
                activeJob
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : taking[job.id]
                    ? 'bg-primary/60 text-primary-foreground cursor-not-allowed'
                    : 'bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground shadow-sm'
              ]"
            >
              <span v-if="taking[job.id]" class="flex items-center justify-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin" />
                Mengambil job...
              </span>
              <span v-else-if="activeJob">Selesaikan job aktif dulu</span>
              <span v-else class="flex items-center justify-center gap-1.5">
                Ambil Job Ini
                <ArrowRight class="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, RefreshCw, Clock, ArrowRight, Loader2, PackageSearch, SlidersHorizontal } from '@lucide/vue'
import { driverApi } from '@/services/driver'
import { toast } from 'vue-sonner'

const router = useRouter()
const jobs = ref([])
const activeJob = ref(null)
const loading = ref(true)
const taking = reactive({})
const showFilter = ref(false)

const filters = reactive({
  sort: 'newest',
  method: '',
  minEarning: 0,
})

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'earning_high', label: 'Earning ↑' },
  { value: 'earning_low', label: 'Earning ↓' },
]

const earningThresholds = [
  { label: '>10rb', value: 10000 },
  { label: '>20rb', value: 20000 },
  { label: '>50rb', value: 50000 },
]

const availableMethods = computed(() => {
  const methods = jobs.value.map(j => j.order?.delivery_method).filter(Boolean)
  return [...new Set(methods)]
})

const hasActiveFilters = computed(() =>
  filters.sort !== 'newest' || filters.method !== '' || filters.minEarning > 0
)

const filteredJobs = computed(() => {
  let result = [...jobs.value]

  if (filters.method)
    result = result.filter(j => j.order?.delivery_method === filters.method)

  if (filters.minEarning > 0)
    result = result.filter(j => (j.order?.delivery_fee ?? 0) * 0.8 >= filters.minEarning)

  if (filters.sort === 'earning_high')
    result.sort((a, b) => (b.order?.delivery_fee ?? 0) - (a.order?.delivery_fee ?? 0))
  else if (filters.sort === 'earning_low')
    result.sort((a, b) => (a.order?.delivery_fee ?? 0) - (b.order?.delivery_fee ?? 0))

  return result
})

function resetFilters() {
  filters.sort = 'newest'
  filters.method = ''
  filters.minEarning = 0
}

function formatPrice(p) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p ?? 0)
}

function formatMethod(m) {
  return (m ?? '').replace(/_/g, ' ') || '—'
}

function formatDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function loadJobs() {
  loading.value = true
  try {
    const [jobsRes, activeRes] = await Promise.all([
      driverApi.getAvailableJobs(),
      driverApi.getActiveJob(),
    ])
    jobs.value = jobsRes.data.data
    activeJob.value = activeRes.data.data
  } finally {
    loading.value = false
  }
}

async function takeJob(job) {
  if (activeJob.value) return
  taking[job.id] = true
  try {
    await driverApi.takeJob(job.id)
    toast.success('Job berhasil diambil!')
    router.push('/driver/my-jobs')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal mengambil job.')
  } finally {
    taking[job.id] = false
  }
}

onMounted(loadJobs)
</script>
