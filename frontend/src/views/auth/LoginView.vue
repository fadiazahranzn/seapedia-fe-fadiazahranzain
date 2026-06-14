<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight">SEAPEDIA</h1>
        <p class="text-muted-foreground mt-1 text-sm">Masuk ke akun kamu</p>
      </div>

      <Card>
        <CardContent class="pt-6">
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-2">
              <Label for="login">Email / Username</Label>
              <Input id="login" v-model="form.login" placeholder="email atau username" required />
            </div>

            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input id="password" v-model="form.password" type="password" placeholder="••••••••" required />
            </div>

            <div class="space-y-2">
              <Label for="role">Masuk sebagai</Label>
              <select
                id="role"
                v-model="form.role"
                class="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Pilih role</option>
                <option value="admin">Admin</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <p v-if="error" class="text-destructive text-sm">{{ error }}</p>

            <Button type="submit" class="w-full" :disabled="loading">
              {{ loading ? 'Memproses...' : 'Masuk' }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p class="text-center text-sm text-muted-foreground mt-4">
        Belum punya akun?
        <RouterLink to="/register" class="text-primary font-medium hover:underline">Daftar</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ login: '', password: '', role: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value)
    toast.success('Login berhasil!')
    router.push(`/${auth.activeRole}`)
  } catch (e) {
    error.value = e.response?.data?.message || 'Login gagal.'
  } finally {
    loading.value = false
  }
}
</script>
