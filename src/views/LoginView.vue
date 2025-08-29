<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor, complete todos los campos'
    return
  }

  const allowedEmails = ['lreyes@bakano.ec', 'dreyes@bakano.ec', 'dquimi@bakano.ec', 'cjouvin@bakano.ec']
  const allowedPassword = 'Bakano1234!'

  if (!allowedEmails.includes(email.value.trim()) || password.value !== allowedPassword) {
    error.value = 'Credenciales inválidas'
    return
  }

  try {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación de carga
    localStorage.setItem('access_token', 'dummy_token')
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Hubo un error inesperado'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="login">
    <div class="login-container">
      <img 
        src="@/assets/logos/bakano-dark.png" 
        alt="Bakano Logo" 
        class="login-logo"
      />
      <h1 class="login-title">Iniciar Sesión</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input 
            type="email" 
            id="email"
            v-model="email"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password"
            v-model="password"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button 
          type="submit" 
          class="submit-button"
          :disabled="isLoading"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Ingresar</span>
        </button>
      </form>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: $white;

  &-container {
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    border-radius: 20px;
    background: $white;
    box-shadow: 0 8px 32px rgba($BAKANO-DARK, 0.1);
  }

  &-logo {
    display: block;
    height: 40px;
    width: auto;
    margin: 0 auto 2rem;
  }

  &-title {
    color: $BAKANO-DARK;
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2rem;
    font-family: $font-principal;
  }
}

.login-form {
  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: $BAKANO-DARK;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid rgba($BAKANO-DARK, 0.1);
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: $BAKANO-PINK;
        box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
      }
    }
  }
}

.error-message {
  color: #ff4444;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background: $BAKANO-PINK;
  color: $white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: darken($BAKANO-PINK, 5%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  i {
    margin-right: 0.5rem;
  }
}

@media (max-width: 768px) {
  .login {
    padding: 1rem;

    &-container {
      padding: 2rem;
    }
  }
}
</style>