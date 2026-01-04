<template>
  <t-chat-sender
    v-model="query"
    :stop-disabled="loading"
    :textarea-props="{
      placeholder: '请输入消息...',
    }"
    @send="inputEnter"
  >
    <template #suffix="{ renderPresets }">
      <!-- 在这里可以进行自由的组合使用，或者新增预设 -->
      <!-- 不需要附件操作的使用方式 -->
      <component :is="renderPresets([])" />
    </template>
  </t-chat-sender>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const query = ref('');
const loading = ref(false);
const answer = ref('');
const inputEnter = function () {
  if (loading.value) {
    return;
  }
  if (!query.value) return;
  loading.value = true;
  const params = new URLSearchParams({ question: query.value });
  const url = `/api/ai/agent/chat?${params.toString()}`;
  const eventSource = new EventSource(url);
  eventSource.onopen = () => {
    console.log('EventSource opened');
  };
  eventSource.onmessage = (event) => {
    answer.value += event.data;
    console.log('EventSource message:', answer.value);
  };
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    loading.value = false;
  };
};
</script>
<style scoped>
.test {
  color: var(--td-brand-color);
}
</style>
