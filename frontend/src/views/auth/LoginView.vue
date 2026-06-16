<template>
  <div class="auth-bg">
    <!-- Blobs -->
    <div class="blob blob-1" />
    <div class="blob blob-2" />
    <div class="blob blob-3" />

    <div class="glass-card">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-logo">
          <div class="brand-icon">S</div>
          <span class="brand-name">SEAPEDIA</span>
        </div>
        <h1 class="form-title">Selamat datang</h1>
        <p class="form-subtitle">Masuk ke akun kamu untuk melanjutkan</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active">Masuk</button>
        <RouterLink to="/register" class="tab">Daftar</RouterLink>
      </div>

      <form @submit.prevent="handleLogin" class="form-body">
        <div class="form-group">
          <label for="login">Email / Username</label>
          <input id="login" v-model="form.login" type="text" placeholder="email atau username" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPw ? 'text' : 'password'"
              class="pw-input"
              placeholder="••••••••"
              required
            />
            <button type="button" class="pw-toggle" @click="showPw = !showPw">
              <EyeOff v-if="showPw" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="role">Masuk sebagai</label>
          <div class="select-wrap">
            <select id="role" v-model="form.role" required>
              <option value="">Pilih role</option>
              <option value="admin">Admin</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="driver">Driver</option>
            </select>
            <ChevronDown :size="14" class="select-icon" />
          </div>
        </div>

        <div v-if="error" class="error-box">
          <AlertCircle :size="14" />
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner" />
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <p class="footer-link">
        Belum punya akun?
        <RouterLink to="/register">Daftar sekarang</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Eye, EyeOff, AlertCircle, ChevronDown } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ login: '', password: '', role: '' })
const error = ref('')
const loading = ref(false)
const showPw = ref(false)

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

<style scoped>
.auth-bg {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* Blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  pointer-events: none;
}
.blob-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #6366f1, #8b5cf6);
  top: -150px; left: -100px;
  animation: float1 8s ease-in-out infinite;
}
.blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #06b6d4, #3b82f6);
  bottom: -100px; right: -80px;
  animation: float2 10s ease-in-out infinite;
}
.blob-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #ec4899, #f43f5e);
  top: 40%; left: 55%;
  animation: float3 7s ease-in-out infinite;
}
@keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,30px)} }
@keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-40px)} }
@keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }

/* Glass card */
.glass-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
}

/* Brand */
.brand { text-align: center; margin-bottom: 28px; }
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.brand-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  font-weight: 700;
}
.brand-name { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
.form-title { font-size: 22px; font-weight: 600; color: #fff; letter-spacing: -0.02em; }
.form-subtitle { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }

/* Tabs */
.tabs {
  display: flex;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 24px;
}
.tab {
  flex: 1;
  padding: 7px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  border: none;
  background: none;
  font-family: inherit;
  text-decoration: none;
  transition: all .2s;
  display: block;
}
.tab.active, .tab:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Form */
.form-body { display: flex; flex-direction: column; gap: 0; }
.form-group { margin-bottom: 16px; }

label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

input, select {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  font-family: inherit;
  font-size: 14px;
  color: #fff;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  outline: none;
  transition: border-color .2s, background .2s, box-shadow .2s;
  appearance: none;
  -webkit-appearance: none;
}
input::placeholder { color: rgba(255,255,255,0.3); }
input:focus, select:focus {
  border-color: rgba(99,102,241,0.8);
  background: rgba(255,255,255,0.12);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.25);
}
select option { background: #302b63; color: #fff; }

.input-wrap { position: relative; }
.pw-input { padding-right: 44px !important; }
.pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color .15s;
}
.pw-toggle:hover { color: rgba(255,255,255,0.8); }

.select-wrap { position: relative; }
.select-wrap select { padding-right: 36px; cursor: pointer; }
.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.4);
  pointer-events: none;
}

/* Error */
.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(244,63,94,0.15);
  border: 1px solid rgba(244,63,94,0.35);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #fda4af;
  margin-bottom: 16px;
}

/* Button */
.btn-primary {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #fff;
  box-shadow: 0 4px 20px rgba(99,102,241,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity .15s, transform .1s, box-shadow .15s;
  letter-spacing: -0.01em;
}
.btn-primary:hover:not(:disabled) { opacity: .9; box-shadow: 0 6px 24px rgba(99,102,241,0.5); }
.btn-primary:active:not(:disabled) { transform: scale(.98); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

/* Spinner */
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.footer-link {
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin-top: 20px;
}
.footer-link a {
  color: #a5b4fc;
  font-weight: 500;
  text-decoration: none;
}
.footer-link a:hover { color: #c7d2fe; text-decoration: underline; }
</style>
