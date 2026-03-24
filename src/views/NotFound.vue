<template>
  <div class="not-found">
    <div class="not-found-content">
      <span class="not-found-code">{{ t('notFoundCode') }}</span>
      <h1 class="not-found-title">{{ t('notFoundTitle') }}</h1>
      <p class="not-found-message">{{ t('notFoundMessage') }}</p>
      <a class="not-found-link" href="#/">{{ t('goHome') }}</a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "../i18n/index.js";
const { t } = useI18n();
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0a0a14;
  color: #fff;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
}

.not-found-code {
  display: block;
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  color: #fd6a30;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

.not-found-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.8rem;
  color: #fff;
}

.not-found-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 2rem;
  line-height: 1.5;
}

.not-found-link {
  display: inline-block;
  padding: 0.6rem 1.6rem;
  background: #fd6a30;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
}

.not-found-link:hover {
  background: #e55a22;
}
</style>
