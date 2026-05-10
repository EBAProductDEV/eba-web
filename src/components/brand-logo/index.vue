<template>
  <span class="brand-logo" :class="[{ 'brand-logo--compact': compact }]">
    <img class="brand-logo__icon" src="/brand/jingran-ai-icon.png" alt="镜燃 AI" />
    <span v-if="!compact" class="brand-logo__name">镜燃 AI</span>
  </span>
</template>
<script setup lang="ts">
defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="less" scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  min-width: 0;
  color: var(--td-text-color-primary);
}

.brand-logo--compact {
  justify-content: center;
}

.brand-logo__icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgb(0 82 217 / 14%);
}

.brand-logo__name {
  overflow: hidden;
  color: currentcolor;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
}
</style>
