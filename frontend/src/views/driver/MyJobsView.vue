<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Job Saya</h1>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-24 bg-muted rounded-xl animate-pulse" />
    </div>

    <template v-else>
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent class="pt-5">
            <p class="text-xs text-muted-foreground">Total Job</p>
            <p class="text-2xl font-bold mt-1">{{ report.summary.total_jobs }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-5">
            <p class="text-xs text-muted-foreground">Selesai</p>
            <p class="text-2xl font-bold mt-1 text-green-600">{{ report.summary.completed_jobs }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-5">
            <p class="text-xs text-muted-foreground">Total Earning</p>
            <p class="text-base font-bold mt-1 text-primary">{{ formatPrice(report.summary.total_earning) }}</p>
            <p class="text-xs text-muted-foreground">{{ report.summary.earning_rate }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Active job -->
      <div v-if="report.active_job" class="mb-6">
        <h2 class="font-semibold mb-3">Job Aktif</h2>
        <Card class="border-blue-200 bg-blue-50/50">
          <CardContent class="pt-5">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold">Pesanan #{{ report.active_job.order_id }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">Sedang Dikirim</span>
                </div>
                <p class="text-xs text-muted-foreground">{{ report.active_job.order?.store?.name }}</p>
                <p class="text-xs text-muted-foreground">Diambil: {{ formatDateTime(report.active_job.picked_up_at) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-muted-foreground">Estimasi earning</p>
                <p class="font-bold text-green-600">{{ formatPrice(report.active_job.order?.delivery_fee * 0.8) }}</p>
              </div>
            </div>

            <!-- Alamat -->
            <div class="text-xs text-muted-foreground mb-3 flex gap-1">
              <MapPin class="w-3 h-3 shrink-0 mt-0.5" />
              <span>{{ report.active_job.order?.address_snapshot?.full_address }}, {{ report.active_job.order?.address_snapshot?.city }}</span>
            </div>

            <!-- Items -->
            <div class="bg-white rounded-lg p-2 mb-3 space-y-1">
              <div v-for="item in report.active_job.order?.items" :key="item.id" class="text-xs flex justify-between">
                <span class="text-muted-foreground">{{ item.product_name }} x{{ item.quantity }}</span>
                <span>{{ formatPrice(item.subtotal) }}</span>
              </div>
            </div>

            <Button class="w-full" :disabled="completing" @click="completeJob(report.active_job)">
              {{ completing ? 'Memproses...' : 'Konfirmasi Pesanan Selesai' }}
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Job history -->
      <h2 class="font-semibold mb-3">Riwayat Job</h2>
      <div v-if="!completedJobs.length" class="text-center py-8 text-muted-foreground text-sm">
        Belum ada job selesai.
      </div>
      <div v-else class="space-y-3">
        <Card v-for="job in completedJobs" :key="job.id">
          <CardContent class="py-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-sm">Pesanan #{{ job.order_id }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Selesai</span>
                </div>
                <p class="text-xs text-muted-foreground">{{ job.order?.store?.name }}</p>
                <p class="text-xs text-muted-foreground">Selesai: {{ formatDateTime(job.delivered_at) }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-green-600">+{{ formatPrice(job.earning) }}</p>
                <p class="text-xs text-muted-foreground">{{ job.order?.items?.length }} item</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MapPin } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { driverApi } from '@/services/driver'
import { toast } from 'vue-sonner'

const report = ref({ summary: {}, active_job: null, jobs: [] })
const loading = ref(true)
const completing = ref(false)

const completedJobs = computed(() => report.value.jobs?.filter(j => j.status === 'completed') ?? [])

function formatPrice(p) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p ?? 0)
}
function formatDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadReport() {
  loading.value = true
  try {
    const { data } = await driverApi.getMyJobs()
    report.value = data.data
  } finally { loading.value = false }
}

async function completeJob(job) {
  completing.value = true
  try {
    await driverApi.completeJob(job.id)
    toast.success('Pengiriman selesai!')
    await loadReport()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal konfirmasi.')
  } finally { completing.value = false }
}

onMounted(loadReport)
</script>
