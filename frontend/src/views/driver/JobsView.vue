<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Job Tersedia</h1>
        <p class="text-muted-foreground text-sm mt-1">Cari dan ambil job pengiriman</p>
      </div>
      <Button variant="outline" size="sm" @click="loadJobs">
        <RefreshCw class="w-4 h-4 mr-1" /> Refresh
      </Button>
    </div>

    <!-- Active job banner -->
    <div v-if="activeJob" class="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Truck class="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <p class="font-semibold text-blue-800 text-sm">Kamu sedang mengantarkan pesanan #{{ activeJob.order_id }}</p>
          <p class="text-xs text-blue-600">{{ activeJob.order?.store?.name }} · Diambil {{ formatDateTime(activeJob.picked_up_at) }}</p>
        </div>
      </div>
      <Button size="sm" @click="$router.push('/driver/my-jobs')">Lihat</Button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-32 bg-muted rounded-xl animate-pulse" />
    </div>

    <div v-else-if="!jobs.length" class="text-center py-16 text-muted-foreground">
      <Truck class="w-14 h-14 mx-auto mb-3 opacity-30" />
      <p class="font-medium">Tidak ada job tersedia saat ini.</p>
      <p class="text-sm mt-1">Coba refresh beberapa saat lagi.</p>
    </div>

    <div v-else class="space-y-4">
      <Card v-for="job in jobs" :key="job.id">
        <CardContent class="pt-5">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm">Pesanan #{{ job.order_id }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Menunggu Pengirim</span>
              </div>
              <p class="text-xs text-muted-foreground">
                Toko: <strong class="text-foreground">{{ job.order?.store?.name }}</strong>
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs text-muted-foreground">Estimasi penghasilan</p>
              <p class="font-bold text-green-600">{{ formatPrice(job.order?.delivery_fee * 0.8) }}</p>
              <p class="text-xs text-muted-foreground">80% dari {{ formatPrice(job.order?.delivery_fee) }}</p>
            </div>
          </div>

          <!-- Delivery info -->
          <div class="bg-muted/40 rounded-lg p-3 text-xs space-y-1 mb-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Metode</span>
              <span class="font-medium capitalize">{{ job.order?.delivery_method?.replace('_', ' ') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Ongkir</span>
              <span class="font-medium">{{ formatPrice(job.order?.delivery_fee) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Jumlah produk</span>
              <span class="font-medium">{{ job.order?.items?.length }} item</span>
            </div>
          </div>

          <!-- Alamat tujuan -->
          <div class="text-xs text-muted-foreground mb-3 flex gap-1">
            <MapPin class="w-3 h-3 shrink-0 mt-0.5" />
            <span>{{ job.order?.address_snapshot?.full_address }}, {{ job.order?.address_snapshot?.city }}</span>
          </div>

          <Button class="w-full" :disabled="!!activeJob || taking[job.id]" @click="takeJob(job)">
            {{ taking[job.id] ? 'Mengambil...' : activeJob ? 'Selesaikan job aktif dulu' : 'Ambil Job Ini' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, MapPin, RefreshCw } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { driverApi } from '@/services/driver'
import { toast } from 'vue-sonner'

const router = useRouter()
const jobs = ref([])
const activeJob = ref(null)
const loading = ref(true)
const taking = reactive({})

function formatPrice(p) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p ?? 0)
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
  } finally { loading.value = false }
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
  } finally { taking[job.id] = false }
}

onMounted(loadJobs)
</script>
