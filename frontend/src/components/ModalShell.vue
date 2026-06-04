<script setup lang="ts">
defineEmits<{ close: [] }>()
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5); /* solid color w/ opacity — not a gradient */
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 360px;
  padding: 1.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
}
</style>
