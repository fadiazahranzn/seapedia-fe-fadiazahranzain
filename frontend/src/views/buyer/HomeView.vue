<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Selamat datang, {{ auth.user?.name }}!</h2>
    <p class="text-muted-foreground">Halaman buyer — coming soon.</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
