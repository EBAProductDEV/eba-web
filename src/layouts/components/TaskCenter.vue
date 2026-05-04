<template>
  <div class="task-center-entry">
    <t-badge :count="activeCount" :offset="[2, 4]">
      <t-tooltip placement="bottom" content="异步任务中心">
        <t-button theme="default" shape="square" variant="text" @click="openDrawer">
          <t-icon name="time" />
        </t-button>
      </t-tooltip>
    </t-badge>

    <t-drawer
      v-model:visible="visible"
      size="720px"
      header="异步任务中心"
      :footer="false"
      placement="right"
      @close="visible = false"
    >
      <div class="task-center">
        <div class="task-summary">
          <div>
            <strong>{{ activeCount }}</strong>
            <span>执行中</span>
          </div>
          <div>
            <strong>{{ allTasks.length }}</strong>
            <span>最近任务</span>
          </div>
          <div>
            <strong>{{ socketConnected ? '实时' : '离线' }}</strong>
            <span>推送状态</span>
          </div>
          <t-button size="small" variant="outline" :loading="loading" @click="loadTasks">刷新</t-button>
        </div>

        <div class="task-tabs">
          <button :class="{ active: filter === 'active' }" @click="filter = 'active'">执行中</button>
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
          <button :class="{ active: filter === 'failed' }" @click="filter = 'failed'">失败</button>
          <button :class="{ active: filter === 'done' }" @click="filter = 'done'">已完成</button>
        </div>

        <t-loading :loading="loading">
          <div v-if="filteredTasks.length" class="task-list">
            <article v-for="task in filteredTasks" :key="task.id" class="task-card">
              <div class="task-card-head">
                <div>
                  <div class="task-title">
                    <span>{{ task.title }}</span>
                    <t-tag size="small" :theme="statusTheme(task.status)" variant="light">{{
                      statusText(task.status)
                    }}</t-tag>
                  </div>
                  <p>{{ task.description }}</p>
                </div>
                <div class="task-actions">
                  <span class="task-id">#{{ task.id }}</span>
                  <t-button
                    v-if="isActiveTask(task)"
                    size="small"
                    theme="danger"
                    variant="outline"
                    :loading="cancellingTaskIds[task.id]"
                    @click="confirmCancelTask(task)"
                  >
                    终止删除
                  </t-button>
                </div>
              </div>

              <div class="task-links">
                <button v-if="task.seriesId && task.seriesId > 0" @click="goProject(task.seriesId)">
                  项目：{{ task.seriesName || task.seriesId }}
                </button>
                <button v-if="task.seriesId && task.characterId" @click="goCharacter(task.seriesId, task.characterId)">
                  角色：{{ task.characterName || task.characterId }}
                </button>
                <span v-if="task.assetSubType">{{ imageTypeLabel(task.assetSubType) }}</span>
              </div>

              <div class="task-progress">
                <div class="progress-line">
                  <span>{{ task.stageText || '执行中' }}</span>
                  <strong>{{ task.progress || 0 }}%</strong>
                </div>
                <t-progress :percentage="task.progress || 0" :status="task.status === 'FAILED' ? 'error' : 'active'" />
              </div>

              <t-steps
                class="task-steps"
                :current="task.currentStep || 0"
                :status="task.status === 'FAILED' ? 'error' : 'process'"
                layout="vertical"
                theme="dot"
              >
                <t-step-item v-for="step in task.steps" :key="step" :title="step" />
              </t-steps>

              <div v-if="task.errorMessage" class="task-message" :class="{ error: task.status === 'FAILED' }">
                {{ task.errorMessage }}
              </div>
            </article>
          </div>

          <div v-else class="empty-tasks">
            <strong>暂无任务</strong>
            <p>生成故事、角色图片、镜头图片或视频后，任务会出现在这里。</p>
          </div>
        </t-loading>
      </div>
    </t-drawer>
  </div>
</template>
<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { cancelDramaTask, listDramaTaskCenter } from '@/api/modules/ai/drama';
import type { DramaTaskSocketClient } from '@/services/drama-task-socket';
import { createDramaTaskSocket } from '@/services/drama-task-socket';
import type { DramaTaskCenterItem } from '@/types/modules/ai/drama';

const router = useRouter();
const visible = ref(false);
const loading = ref(false);
const filter = ref<'active' | 'all' | 'failed' | 'done'>('all');
const activeCount = ref(0);
const allTasks = ref<DramaTaskCenterItem[]>([]);
const socketConnected = ref(false);
const cancellingTaskIds = ref<Record<number, boolean>>({});
let taskSocket: DramaTaskSocketClient | undefined;

const filteredTasks = computed(() => {
  if (filter.value === 'active') {
    return allTasks.value.filter((task) => ['PENDING', 'RUNNING'].includes(task.status));
  }
  if (filter.value === 'failed') {
    return allTasks.value.filter((task) => task.status === 'FAILED');
  }
  if (filter.value === 'done') {
    return allTasks.value.filter((task) => task.status === 'SUCCEEDED');
  }
  return allTasks.value;
});

async function loadTasks() {
  loading.value = true;
  try {
    const result = await listDramaTaskCenter(80);
    applyTaskSnapshot(result);
  } catch (error: any) {
    MessagePlugin.error(error?.message || '异步任务加载失败');
  } finally {
    loading.value = false;
  }
}

function openDrawer() {
  visible.value = true;
  taskSocket?.refresh();
}

function isActiveTask(task: DramaTaskCenterItem) {
  return ['PENDING', 'RUNNING'].includes(task.status);
}

function applyTaskSnapshot(result: { activeCount?: number; tasks?: DramaTaskCenterItem[] }) {
  activeCount.value = result.activeCount || 0;
  allTasks.value = result.tasks || [];
}

function confirmCancelTask(task: DramaTaskCenterItem) {
  const dialog = DialogPlugin.confirm({
    header: '确认终止任务',
    body: `确定终止并从执行中移除任务 #${task.id} 吗？已提交到外部模型的请求可能无法真正撤回，但系统不会再把该任务继续标记为执行中。`,
    confirmBtn: '终止删除',
    cancelBtn: '取消',
    theme: 'danger',
    onConfirm: async () => {
      cancellingTaskIds.value = { ...cancellingTaskIds.value, [task.id]: true };
      try {
        const result = await cancelDramaTask(task.id);
        applyTaskSnapshot(result);
        MessagePlugin.success('任务已终止');
        taskSocket?.refresh();
        dialog.hide();
      } catch (error: any) {
        MessagePlugin.error(error?.message || '任务终止失败');
      } finally {
        const next = { ...cancellingTaskIds.value };
        delete next[task.id];
        cancellingTaskIds.value = next;
      }
    },
  });
}

function goProject(seriesId: number) {
  visible.value = false;
  router.push(`/ai/drama/projects/${seriesId}`);
}

function goCharacter(seriesId: number, characterId: number) {
  visible.value = false;
  router.push(`/ai/drama/projects/${seriesId}/characters/${characterId}`);
}

function statusTheme(status: string) {
  if (status === 'FAILED') return 'danger';
  if (status === 'SUCCEEDED') return 'success';
  if (status === 'RUNNING') return 'primary';
  return 'warning';
}

function statusText(status: string) {
  const map: Record<string, string> = {
    PENDING: '排队中',
    RUNNING: '执行中',
    SUCCEEDED: '已完成',
    FAILED: '失败',
  };
  return map[status] || status;
}

function imageTypeLabel(type: string) {
  const map: Record<string, string> = {
    PORTRAIT: '全身定妆照',
    AVATAR: '头像',
    THREE_VIEW: '三视图',
    EXPRESSION: '表情参考图',
    COSTUME: '服装版本图',
  };
  return map[type] || type;
}

onMounted(() => {
  void loadTasks();
  taskSocket = createDramaTaskSocket({
    onSnapshot: applyTaskSnapshot,
    onOpen: () => {
      socketConnected.value = true;
    },
    onClose: () => {
      socketConnected.value = false;
    },
    onError: () => {
      socketConnected.value = false;
    },
  });
  taskSocket.connect();
});

onBeforeUnmount(() => {
  taskSocket?.close();
});
</script>
<style scoped lang="less">
.task-center-entry {
  display: inline-flex;
  align-items: center;
  margin-left: var(--td-comp-margin-l);
}

.task-center {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.task-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 12px;
  align-items: center;

  > div {
    padding: 14px 16px;
    background: linear-gradient(135deg, #f2f7ff, #fff);
    border: 1px solid #e7eefb;
    border-radius: 16px;
  }

  strong {
    display: block;
    color: #0052d9;
    font-size: 26px;
    line-height: 1;
  }

  span {
    display: block;
    margin-top: 6px;
    color: #667085;
  }
}

.task-tabs {
  display: inline-flex;
  gap: 6px;
  width: fit-content;
  padding: 5px;
  background: #f3f6fb;
  border: 1px solid #e7eef8;
  border-radius: 14px;

  button {
    height: 34px;
    padding: 0 14px;
    color: #667085;
    font-weight: 700;
    background: transparent;
    border: 0;
    border-radius: 10px;
    cursor: pointer;

    &.active {
      color: #fff;
      background: #0052d9;
      box-shadow: 0 8px 18px rgb(0 82 217 / 18%);
    }
  }
}

.task-list {
  display: grid;
  gap: 14px;
  max-height: calc(100vh - 230px);
  overflow: auto;
  padding-right: 4px;
}

.task-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #edf1f7;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgb(31 41 55 / 5%);
}

.task-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  p {
    margin: 8px 0 0;
    color: #667085;
    line-height: 1.6;
  }
}

.task-title {
  display: flex;
  gap: 8px;
  align-items: center;

  span {
    color: #1f2937;
    font-size: 16px;
    font-weight: 800;
  }
}

.task-id {
  flex-shrink: 0;
  color: #98a2b3;
  font-weight: 800;
}

.task-actions {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.task-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0;

  button,
  span {
    padding: 6px 10px;
    color: #0052d9;
    font-weight: 700;
    background: #eef5ff;
    border: 1px solid #d9e8ff;
    border-radius: 999px;
  }

  button {
    cursor: pointer;

    &:hover {
      color: #fff;
      background: #0052d9;
    }
  }
}

.task-progress {
  margin-bottom: 14px;
}

.progress-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #475467;

  strong {
    color: #0052d9;
  }
}

.task-steps {
  padding: 10px 12px;
  background: #f8faff;
  border: 1px solid #edf2fb;
  border-radius: 14px;
}

.task-message {
  margin-top: 12px;
  padding: 10px 12px;
  color: #667085;
  line-height: 1.6;
  background: #f8fafc;
  border-radius: 12px;

  &.error {
    color: #b42318;
    background: #fff1f0;
  }
}

.empty-tasks {
  display: grid;
  place-items: center;
  min-height: 360px;
  color: #667085;
  text-align: center;

  strong {
    color: #1f2937;
    font-size: 18px;
  }

  p {
    margin: 8px 0 0;
  }
}
</style>
