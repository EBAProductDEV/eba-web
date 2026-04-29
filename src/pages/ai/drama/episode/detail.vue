<template>
  <div class="episode-page">
    <button class="back-button" @click="router.push(`/ai/drama/projects/${projectId}`)">← 返回项目详情</button>

    <t-loading :loading="loading" text="加载单集工作台中...">
      <template v-if="detail">
        <section class="hero-card">
          <div>
            <span class="badge">第 {{ detail.episode.episodeNo }} 集</span>
            <h1>{{ detail.episode.title }}</h1>
            <p>{{ detail.episode.summary }}</p>
            <div class="hero-meta">
              <span>状态：{{ detail.episode.status }}</span>
              <span>场景：{{ detail.scenes.length }}</span>
              <span>镜头：{{ detail.shots.length }}</span>
              <span>素材：{{ detail.assets.length }}</span>
            </div>
          </div>
          <div class="hero-actions">
            <t-button theme="primary" :loading="generatingScript" @click="handleGenerateScript"
              >生成单集剧本和场景</t-button
            >
            <t-button
              theme="primary"
              variant="outline"
              :disabled="!detail.episode.script"
              :loading="generatingShots"
              @click="handleGenerateShots"
              >按场景拆分镜头</t-button
            >
          </div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>单集剧本</h2>
            <span>先完成剧本，再拆场景和镜头</span>
          </div>
          <div v-if="detail.episode.script" class="script-box">
            <pre>{{ detail.episode.script }}</pre>
          </div>
          <t-empty v-else description="暂无单集剧本。点击“生成单集剧本和场景”生成占位内容。" />
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>场景和镜头</h2>
            <span>视频生成以镜头为最小单位</span>
          </div>
          <div v-if="sceneGroups.length" class="scene-list">
            <article v-for="group in sceneGroups" :key="group.scene.id" class="scene-block">
              <div class="scene-header">
                <div>
                  <h3>{{ group.scene.name }}</h3>
                  <p>
                    地点：{{ group.scene.location || '-' }} · 时间：{{ group.scene.timeOfDay || '-' }} · 氛围：{{
                      group.scene.atmosphere || '-'
                    }}
                  </p>
                  <p>{{ group.scene.plotPurpose }}</p>
                </div>
                <t-tag theme="primary" variant="light">{{ group.shots.length }} 个镜头</t-tag>
              </div>

              <div v-if="group.shots.length" class="shot-list">
                <article v-for="shot in group.shots" :key="shot.id" class="shot-card">
                  <div class="shot-no">镜头 {{ shot.shotNo }} · {{ shot.shotSize }}</div>
                  <p><strong>动作：</strong>{{ shot.action }}</p>
                  <p><strong>对白：</strong>{{ shot.dialogue }}</p>
                  <p><strong>图片提示词：</strong>{{ shot.imagePrompt }}</p>
                  <p><strong>视频提示词：</strong>{{ shot.videoPrompt }}</p>
                  <div class="shot-actions">
                    <t-button size="small" variant="outline" @click="handleGenerateShotImage(shot.id)"
                      >生成图片</t-button
                    >
                    <t-button size="small" theme="primary" variant="outline" @click="handleGenerateShotVideo(shot.id)"
                      >生成视频</t-button
                    >
                  </div>
                </article>
              </div>
              <t-empty v-else description="该场景暂无镜头。点击“按场景拆分镜头”生成。" />
            </article>
          </div>
          <t-empty v-else description="暂无场景。请先生成单集剧本和场景。" />
        </section>

        <section class="grid-two">
          <article class="panel">
            <div class="panel-title">
              <h2>素材</h2>
              <span>{{ detail.assets.length }} 个</span>
            </div>
            <div v-if="detail.assets.length" class="asset-list">
              <a v-for="asset in detail.assets" :key="asset.id" :href="asset.accessUrl" target="_blank">
                {{ asset.assetType }} · {{ asset.fileName }}
              </a>
            </div>
            <t-empty v-else description="暂无图片或视频素材。" />
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>任务</h2>
              <span>{{ detail.tasks.length }} 个</span>
            </div>
            <div v-if="detail.tasks.length" class="task-list">
              <div v-for="task in detail.tasks" :key="task.id" class="task-row">
                <span>{{ task.taskType }}</span>
                <t-tag theme="primary" variant="light">{{ task.status }}</t-tag>
              </div>
            </div>
            <t-empty v-else description="暂无任务。" />
          </article>
        </section>
      </template>
    </t-loading>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  generateDramaEpisodeScript,
  generateDramaEpisodeShots,
  generateDramaShotImage,
  generateDramaShotVideo,
  getDramaEpisodeDetail,
} from '@/api/modules/ai/drama';
import type { DramaEpisodeDetail, DramaScene, DramaShot } from '@/types/modules/ai/drama';

interface SceneGroup {
  scene: DramaScene;
  shots: DramaShot[];
}

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const generatingScript = ref(false);
const generatingShots = ref(false);
const detail = ref<DramaEpisodeDetail>();

const projectId = computed(() => Number(route.params.id));
const episodeId = computed(() => Number(route.params.episodeId));

const sceneGroups = computed<SceneGroup[]>(() => {
  if (!detail.value) return [];
  return detail.value.scenes.map((scene) => ({
    scene,
    shots: detail.value?.shots.filter((shot) => shot.sceneId === scene.id) || [],
  }));
});

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getDramaEpisodeDetail(episodeId.value);
  } finally {
    loading.value = false;
  }
}

async function handleGenerateScript() {
  generatingScript.value = true;
  try {
    await generateDramaEpisodeScript(episodeId.value);
    MessagePlugin.success('单集剧本和场景占位内容已生成');
    await loadDetail();
  } finally {
    generatingScript.value = false;
  }
}

async function handleGenerateShots() {
  generatingShots.value = true;
  try {
    await generateDramaEpisodeShots(episodeId.value);
    MessagePlugin.success('已按场景拆分镜头');
    await loadDetail();
  } finally {
    generatingShots.value = false;
  }
}

async function handleGenerateShotImage(shotId: number) {
  await generateDramaShotImage(shotId);
  MessagePlugin.success('镜头图片生成任务已创建');
  await loadDetail();
}

async function handleGenerateShotVideo(shotId: number) {
  await generateDramaShotVideo(shotId);
  MessagePlugin.success('镜头视频生成任务已创建');
  await loadDetail();
}

onMounted(loadDetail);
</script>
<style scoped lang="less">
.episode-page {
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
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  margin-bottom: 22px;

  h1 {
    margin: 12px 0;
    color: #202235;
    font-size: 30px;
  }

  p {
    max-width: 760px;
    color: #697084;
    line-height: 1.7;
  }
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge {
  padding: 6px 12px;
  color: #6757d8;
  background: #f3f0ff;
  border-radius: 999px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #8a90a2;
}

.panel {
  padding: 24px;
  margin-bottom: 22px;
}

.panel-title,
.scene-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;

  h2,
  h3 {
    margin: 0;
    color: #22243a;
  }

  h2 {
    font-size: 20px;
  }

  span,
  p {
    color: #8a90a2;
  }
}

.script-box,
.scene-block,
.shot-card {
  padding: 18px;
  background: #f8f8fc;
  border-radius: 18px;
}

.script-box pre {
  margin: 0;
  color: #4f566b;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.scene-list,
.task-list,
.asset-list,
.shot-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.shot-card {
  background: #fff;
  border: 1px solid rgb(114 92 255 / 14%);
}

.shot-card p {
  color: #697084;
  line-height: 1.6;
}

.task-row,
.shot-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.shot-no {
  color: #725cff;
  font-weight: 700;
}

.asset-list a {
  color: #6757d8;
}

@media (width <= 960px) {
  .hero-card,
  .grid-two,
  .scene-header {
    display: block;
  }

  .hero-actions {
    margin-top: 18px;
  }
}
</style>
