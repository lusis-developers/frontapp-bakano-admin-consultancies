<script setup lang="ts">
interface FooterLink {
  title: string
  items: {
    label: string
    url: string
  }[]
}

const currentYear = new Date().getFullYear()

const footerLinks: FooterLink[] = [
  {
    title: 'Producto',
    items: [
      { label: 'Características', url: '/caracteristicas' },
      { label: 'Precios', url: '/precios' },
      { label: 'Recursos', url: '/recursos' }
    ]
  },
  {
    title: 'Compañía',
    items: [
      { label: 'Acerca de', url: '/acerca' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contacto', url: '/contacto' }
    ]
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacidad', url: '/privacidad' },
      { label: 'Términos', url: '/terminos' },
      { label: 'Cookies', url: '/cookies' }
    ]
  }
]
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__brand">
        <img 
          src="@/assets/logos/bakano-light.png" 
          alt="Bakano Logo" 
          class="footer__logo"
        >
        <p class="footer__description">
          Crea contenido viral para tu marca con IA y voz profesional
        </p>
      </div>

      <div class="footer__links">
        <div 
          v-for="section in footerLinks" 
          :key="section.title" 
          class="footer__section"
        >
          <h3 class="footer__section-title">{{ section.title }}</h3>
          <ul class="footer__list">
            <li v-for="item in section.items" :key="item.label">
              <router-link :to="item.url" class="footer__link">
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <p class="footer__copyright">
        © {{ currentYear }} Bakano. Todos los derechos reservados.
      </p>
      <div class="footer__social">
        <a href="https://www.linkedin.com/company/bakanoec" class="footer__social-link" aria-label="Twitter">
          <i class="fab fa-twitter"></i>
        </a>
        <a href="https://www.instagram.com/bakano.ec" class="footer__social-link" aria-label="Instagram">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://x.com/bakanoec" class="footer__social-link" aria-label="LinkedIn">
          <i class="fab fa-linkedin"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.footer {
  background-color: $BAKANO-DARK;
  color: $text-light;
  padding: 4rem 2rem 2rem;

  &__content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
    margin-bottom: 3rem;
  }

  &__brand {
    max-width: 300px;
  }

  &__logo {
    height: 40px;
    width: auto;
    margin-bottom: 1.5rem;
  }

  &__description {
    color: rgba($text-light, 0.8);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  &__links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  &__section-title {
    color: $BAKANO-PINK;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__link {
    color: rgba($text-light, 0.8);
    text-decoration: none;
    font-size: 0.95rem;
    line-height: 2;
    transition: color 0.3s ease;

    &:hover {
      color: $BAKANO-PINK;
    }
  }

  &__bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 2rem;
    border-top: 1px solid rgba($text-light, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__copyright {
    color: rgba($text-light, 0.6);
    font-size: 0.9rem;
  }

  &__social {
    display: flex;
    gap: 1.5rem;
  }

  &__social-link {
    color: rgba($text-light, 0.6);
    font-size: 1.2rem;
    transition: color 0.3s ease;

    &:hover {
      color: $BAKANO-PINK;
    }
  }
}

@media (max-width: 1024px) {
  .footer {
    &__content {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    &__brand {
      max-width: 100%;
      text-align: center;
    }

    &__links {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 3rem 1.5rem 1.5rem;

    &__bottom {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
    }
  }
}
</style>