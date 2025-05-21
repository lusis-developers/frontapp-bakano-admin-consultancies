<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__brand">
        <a href="https://bakano.ec" target="_blank" rel="noopener noreferrer">
          <img 
            src="@/assets/logos/bakano-light.png" 
            alt="Bakano Logo" 
            class="footer__logo"
          >
        </a>
      </div>
      <p class="footer__copyright">
        © {{ currentYear }} Bakano. Todos los derechos reservados.
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.footer {
  background-color: $BAKANO-DARK;
  color: $text-light;
  padding: 1.5rem;

  &__content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__brand {
    display: flex;
    align-items: center;
  }

  &__logo {
    height: 32px;
    width: auto;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__copyright {
    color: rgba($text-light, 0.6);
    font-size: 0.9rem;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 1rem;

    &__content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
}
</style>