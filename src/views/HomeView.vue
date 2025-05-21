<script setup lang="ts">
</script>

<template>
  <main class="home">
    <div class="home-content">
      <img 
        src="@/assets/logos/bakano-dark.png" 
        alt="Bakano Logo" 
        class="home-logo"
      />
      <h1 class="home-title">Panel Administrativo</h1>
      <p class="home-description">
        Bienvenido al sistema interno de Bakano Agency. Esta plataforma está diseñada exclusivamente 
        para el equipo administrativo y colaboradores autorizados.
      </p>
      <div class="home-access">
        <i class="fas fa-lock access-icon"></i>
        <p class="access-text">Acceso restringido solo para personal autorizado</p>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.home {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: $white;

  &-content {
    max-width: 600px;
    text-align: center;
    padding: 3rem;
    border-radius: 20px;
    background: rgba($BAKANO-LIGHT, 0.5);
    box-shadow: 0 8px 32px rgba($BAKANO-DARK, 0.1);
    backdrop-filter: blur(10px);
  }

  &-logo {
    height: 60px;
    width: auto;
    margin-bottom: 2rem;
  }

  &-title {
    color: $BAKANO-DARK;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    font-family: $font-principal;
  }

  &-description {
    color: rgba($BAKANO-DARK, 0.8);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    font-family: $font-secondary;
  }
}

.home-access {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba($BAKANO-PINK, 0.1);
  border-radius: 12px;

  .access-icon {
    color: $BAKANO-PINK;
    font-size: 1.5rem;
  }

  .access-text {
    color: $BAKANO-PINK;
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;

    &-content {
      padding: 2rem;
    }

    &-title {
      font-size: 2rem;
    }

    &-description {
      font-size: 1rem;
    }
  }
}
</style>