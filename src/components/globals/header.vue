<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const isAuthenticated = computed(() => {
  return route.meta.requiresAuth
})

const isInDashboard = computed(() => {
  return route.name === 'dashboard'
})

const isInProfile = computed(() => {
  return route.name === 'profile'
})
</script>

<template>
  <header :class="['header', { 'header--scrolled': isScrolled }]">
    <nav class="nav">
      <router-link to="/" class="logo-container">
        <img 
          src="@/assets/logos/bakano-dark.png" 
          alt="Bakano Logo" 
          class="logo"
        />
      </router-link>
      
      <!-- Menú para usuarios no autenticados -->
      <div v-if="!isAuthenticated" class="nav-links">
        <router-link to="/login" class="nav-link nav-link--primary">
          <i class="fas fa-sign-in-alt"></i> Iniciar sesión
        </router-link>
      </div>

      <!-- Menú para usuarios autenticados -->
      <div v-else class="nav-links">
        <router-link to="/dashboard" class="nav-link" :class="{ 'nav-link--active': isInDashboard }">
          <i class="fas fa-chart-line"></i> Dashboard
        </router-link>
        <router-link to="/generar" class="nav-link nav-link--primary">
          <i class="fas fa-plus"></i> Nuevo Reel
        </router-link>
        <router-link to="/perfil" class="nav-link" :class="{ 'nav-link--active': isInProfile }">
          <i class="fas fa-user"></i> Perfil
        </router-link>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: $white;
  transition: all 0.3s ease;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba($BAKANO-PINK, 0.1);

  &--scrolled {
    background-color: rgba($white, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba($BAKANO-PINK, 0.1);
  }
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.logo {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: $BAKANO-DARK;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: $BAKANO-PINK;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover,
  &.router-link-active {
    color: $BAKANO-PINK;

    &::after {
      width: 80%;
    }
  }

  &--primary {
    background: $BAKANO-PINK;
    color: $white;
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba($BAKANO-PINK, 0.2);

    &:hover,
    &.router-link-active {
      background: darken($BAKANO-PINK, 5%);
      color: $white;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba($BAKANO-PINK, 0.3);
    }

    &::after {
      display: none;
    }
  }

  &--danger {
    color: #ff4444;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      color: darken(#ff4444, 10%);
      background-color: rgba(#ff4444, 0.1);
    }
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .logo {
    height: 32px;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-link {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;

    &--primary {
      padding: 0.4rem 1.2rem;
    }
  }
}
</style>