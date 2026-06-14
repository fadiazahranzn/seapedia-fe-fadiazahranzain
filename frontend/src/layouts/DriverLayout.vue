<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b px-6 py-3 flex items-center justify-between">
      <span class="font-bold text-lg">SEAPEDIA</span>
      <div class="flex items-center gap-3">
        <Badge variant="outline">Driver</Badge>
        <span class="text-sm text-muted-foreground">{{ auth.user?.name }}</span>
        <Button variant="ghost" size="sm" @click="handleLogout">Keluar</Button>
      </div>
    </nav>
    <main class="p-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>
