<template>
  <div class="detail-page">
    <button class="back-button" @click="router.push('/ai/drama')">← 返回我的项目</button>

    <t-loading :loading="loading" text="加载短剧项目中...">
      <template v-if="detail">
        <section class="hero-card">
          <div>
            <span class="badge">{{ detail.type }}</span>
            <h1>{{ detail.name }}</h1>
            <p>{{ detail.intro || '暂无简介。建议先补充项目类型、目标受众、主角设定和核心爽点。' }}</p>
            <div class="hero-meta">
              <span>{{ detail.totalEpisodes }} 集</span>
              <span>{{ detail.episodeDurationMinutes }} 分钟/集</span>
              <span>风格：{{ detail.style || '未设置' }}</span>
              <span>故事状态：{{ storyStatusText }}</span>
              <span>项目角色：{{ detail.characters.length }} 个</span>
            </div>
          </div>
          <t-button theme="primary" variant="outline" size="large" @click="goStory">编辑故事总纲</t-button>
        </section>

        <section class="workflow-grid">
          <article class="panel">
            <div class="panel-title">
              <div>
                <h2>项目角色</h2>
                <p>角色属于整个短剧项目，不属于某一集。后续每集、每个场景和镜头只引用这些项目角色。</p>
              </div>
              <t-button theme="primary" variant="outline" @click="openCharacterDialog">新增角色</t-button>
            </div>

            <div v-if="detail.characters.length" class="character-list">
              <article v-for="character in detail.characters" :key="character.id" class="character-card">
                <button
                  class="delete-button"
                  title="删除角色"
                  @click="handleDeleteCharacter(character.id, character.name)"
                >
                  ×
                </button>
                <h3>{{ character.name }}</h3>
                <p><strong>人设：</strong>{{ character.profile || '未填写' }}</p>
                <p><strong>外貌：</strong>{{ character.appearance || '未填写' }}</p>
                <p><strong>服装：</strong>{{ character.costume || '未填写' }}</p>
                <p><strong>性格：</strong>{{ character.personality || '未填写' }}</p>
                <p><strong>关系：</strong>{{ character.relationship || '未填写' }}</p>
              </article>
            </div>
            <t-empty
              v-else
              description="还没有项目角色。建议先创建主角、反派和关键配角，保证后续图片和视频人物一致。"
            />
          </article>

          <article class="panel">
            <div class="panel-title compact">
              <h2>RAG 知识库</h2>
              <span>Redis Stack</span>
            </div>
            <p class="muted">知识资料会按项目隔离，保存到 D:/AI视频/短剧-{{ detail.id }}/知识资料。</p>
            <t-button variant="outline">上传知识资料</t-button>
          </article>
        </section>
        <section class="panel">
          <div class="panel-title">
            <div>
              <h2>第二步：分集大纲</h2>
              <p>分集必须基于整部故事拆解，避免每集各写各的导致人物动机和反转断裂。</p>
            </div>
            <t-button
              theme="primary"
              :disabled="!detail.fullStory"
              :loading="generatingEpisodes"
              @click="handleGenerateEpisodes"
            >
              根据整部故事生成分集
            </t-button>
          </div>
          <div v-if="detail.episodes.length" class="episode-list">
            <article
              v-for="episode in detail.episodes"
              :key="episode.id"
              class="episode-card"
              @click="goEpisode(episode.id)"
            >
              <div class="episode-no">第 {{ episode.episodeNo }} 集</div>
              <h3>{{ episode.title }}</h3>
              <p>{{ episode.summary }}</p>
              <div class="episode-meta">
                <span>{{ episode.status }}</span>
                <span>点击进入单集工作台 →</span>
              </div>
            </article>
          </div>
          <t-empty v-else description="暂无分集大纲。请先生成整部故事，再生成分集。" />
        </section>

        <section class="workflow-grid">
          <article class="panel">
            <div class="panel-title compact">
              <h2>素材预览</h2>
              <span>{{ detail.recentAssets.length }} 个</span>
            </div>
            <div v-if="detail.recentAssets.length" class="asset-list">
              <a v-for="asset in detail.recentAssets" :key="asset.id" :href="asset.accessUrl" target="_blank">
                {{ asset.assetType }} · {{ asset.fileName }}
              </a>
            </div>
            <t-empty v-else description="暂无图片或视频素材。" />
          </article>

          <article class="panel">
            <div class="panel-title compact">
              <h2>任务状态</h2>
              <span>{{ detail.recentTasks.length }} 个</span>
            </div>
            <div v-if="detail.recentTasks.length" class="task-list">
              <div v-for="task in detail.recentTasks" :key="task.id" class="task-row">
                <span>{{ task.taskType }}</span>
                <t-tag theme="primary" variant="light">{{ task.status }}</t-tag>
              </div>
            </div>
            <t-empty v-else description="暂无生成任务。" />
          </article>
        </section>
      </template>
    </t-loading>

    <t-dialog
      v-model:visible="characterVisible"
      header="新增项目角色"
      width="640px"
      :confirm-loading="savingCharacter"
      @confirm="handleCreateCharacter"
    >
      <t-form :data="characterForm" label-width="92px">
        <t-form-item label="角色名" name="name">
          <t-input v-model="characterForm.name" placeholder="例如：林晚、陆承、反派继母" />
        </t-form-item>
        <t-form-item label="人设" name="profile">
          <t-textarea
            v-model="characterForm.profile"
            placeholder="身份、经历、目标、秘密"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </t-form-item>
        <t-form-item label="外貌" name="appearance">
          <t-input v-model="characterForm.appearance" placeholder="年龄感、发型、五官、体态" />
        </t-form-item>
        <t-form-item label="服装" name="costume">
          <t-input v-model="characterForm.costume" placeholder="常穿服饰、颜色、职业装、古装样式" />
        </t-form-item>
        <t-form-item label="性格" name="personality">
          <t-input v-model="characterForm.personality" placeholder="隐忍、强势、疯批、温柔等" />
        </t-form-item>
        <t-form-item label="人物关系" name="relationship">
          <t-textarea
            v-model="characterForm.relationship"
            placeholder="与主角、反派、配角的关系"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  createDramaCharacter,
  deleteDramaCharacter,
  generateDramaEpisodes,
  getDramaSeriesDetail,
} from '@/api/modules/ai/drama';
import type { DramaCharacterCreateRequest, DramaSeriesDetail } from '@/types/modules/ai/drama';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const generatingEpisodes = ref(false);
const characterVisible = ref(false);
const savingCharacter = ref(false);
const detail = ref<DramaSeriesDetail>();

const characterForm = reactive<DramaCharacterCreateRequest>({
  name: '',
  profile: '',
  appearance: '',
  costume: '',
  personality: '',
  relationship: '',
});

const projectId = computed(() => Number(route.params.id));
const storyStatusText = computed(() => (detail.value?.storyStatus === 'READY' ? '已生成' : '未开始'));

function resetCharacterForm() {
  characterForm.name = '';
  characterForm.profile = '';
  characterForm.appearance = '';
  characterForm.costume = '';
  characterForm.personality = '';
  characterForm.relationship = '';
}

function openCharacterDialog() {
  resetCharacterForm();
  characterVisible.value = true;
}

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getDramaSeriesDetail(projectId.value);
  } finally {
    loading.value = false;
  }
}

async function handleCreateCharacter() {
  if (!characterForm.name?.trim()) {
    MessagePlugin.warning('请先填写角色名');
    return;
  }
  savingCharacter.value = true;
  try {
    await createDramaCharacter(projectId.value, { ...characterForm, name: characterForm.name.trim() });
    MessagePlugin.success('项目角色已创建');
    characterVisible.value = false;
    await loadDetail();
  } finally {
    savingCharacter.value = false;
  }
}

async function handleDeleteCharacter(characterId: number, name: string) {
  const dialog = DialogPlugin.confirm({
    header: '确认删除角色',
    body: `确定删除项目角色「${name}」吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      await deleteDramaCharacter(projectId.value, characterId);
      MessagePlugin.success('项目角色已删除');
      await loadDetail();
      dialog.hide();
    },
  });
}

async function handleGenerateEpisodes() {
  generatingEpisodes.value = true;
  try {
    await generateDramaEpisodes(projectId.value, detail.value?.totalEpisodes || 3);
    MessagePlugin.success('分集大纲占位稿已生成');
    await loadDetail();
  } finally {
    generatingEpisodes.value = false;
  }
}

function goEpisode(episodeId: number) {
  router.push(`/ai/drama/projects/${projectId.value}/episodes/${episodeId}`);
}

function goStory() {
  router.push(`/ai/drama/projects/${projectId.value}/story`);
}

onMounted(loadDetail);
</script>
<style scoped lang="less">
.detail-page {
  min-height: calc(100vh - 96px);
  padding: 30px;
  background: #f5f6fb;
}

.back-button {
  margin-bottom: 18px;
  color: #667085;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.hero-card,
.panel {
  background: #fff;
  border: 1px solid rgb(133 139 160 / 12%);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgb(34 38 64 / 6%);
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  margin-bottom: 22px;

  h1 {
    margin: 12px 0;
    color: #202235;
    font-size: 32px;
  }

  p {
    max-width: 860px;
    color: #697084;
    line-height: 1.7;
  }
}

.badge {
  padding: 6px 12px;
  color: #6757d8;
  background: #f3f0ff;
  border-radius: 999px;
}

.hero-meta,
.episode-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #8a90a2;
}

.panel {
  padding: 24px;
  margin-bottom: 22px;
}

.panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    color: #22243a;
    font-size: 20px;
  }

  p,
  span {
    margin: 8px 0 0;
    color: #8a90a2;
  }
}

.panel-title.compact {
  align-items: center;
}

.character-list,
.episode-list {
  display: grid;
  gap: 14px;
}

.character-card,
.episode-card {
  padding: 18px;
  background: #f8f8fc;
  border: 1px solid transparent;
  border-radius: 18px;
}

.workflow-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 22px;
  margin-bottom: 22px;
}

.character-list {
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
}

.character-card {
  position: relative;

  h3 {
    margin: 0 28px 12px 0;
    color: #24263b;
  }

  p {
    margin: 8px 0;
    color: #697084;
    line-height: 1.55;
  }
}

.delete-button {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 26px;
  height: 26px;
  color: #d54941;
  font-size: 20px;
  line-height: 20px;
  background: #fff0ef;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.episode-list {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.episode-card {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 34px rgb(34 38 64 / 8%);
  }

  h3 {
    color: #24263b;
  }

  p {
    color: #697084;
    line-height: 1.6;
  }
}

.episode-no {
  color: #725cff;
  font-weight: 700;
}

.asset-list,
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-list a {
  color: #6757d8;
}

.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.muted {
  color: #697084;
  line-height: 1.7;
}

@media (width <= 960px) {
  .hero-card {
    display: block;
  }

  .hero-card :deep(.t-button) {
    margin-top: 18px;
  }

  .workflow-grid {
    display: block;
  }

  .panel-title {
    display: block;
  }
}
</style>
