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
          <t-button theme="primary" variant="outline" size="large" @click="goStory">编辑故事原文</t-button>
        </section>

        <section class="workflow-grid character-rag-grid">
          <article class="panel character-panel">
            <div class="panel-title">
              <div>
                <h2>项目角色</h2>
                <p>
                  角色属于整个短剧项目，不属于某一集。后续每集、每个场景和镜头只引用这些项目角色，保证人物图和视频人物一致。
                </p>
              </div>
              <div class="panel-actions">
                <t-button theme="primary" :loading="generatingCharacters" @click="handleGenerateCharacters">
                  AI 生成角色
                </t-button>
                <t-button theme="primary" variant="outline" @click="openCharacterDialog">新增角色</t-button>
              </div>
            </div>

            <div v-if="detail.characters.length" class="character-carousel-shell">
              <button
                class="carousel-arrow carousel-arrow--left"
                type="button"
                @click="changeSelectedCharacter('left')"
              >
                ‹
              </button>
              <div class="character-stack">
                <article
                  v-for="item in visibleCharacterCards"
                  :key="item.character.id"
                  class="character-card"
                  :class="[`character-card--${item.position}`, { 'is-active': item.position === 'center' }]"
                  :style="{ '--active-seed': selectedCharacterIndex }"
                  @click="handleCharacterCardClick(item)"
                >
                  <button
                    class="delete-button"
                    title="删除角色"
                    @click.stop="handleDeleteCharacter(item.character.id, item.character.name)"
                  >
                    ×
                  </button>
                  <div class="character-card-top">
                    <div class="character-avatar" :class="{ 'has-image': item.character.avatarAccessUrl }">
                      <img
                        v-if="item.character.avatarAccessUrl"
                        :src="item.character.avatarAccessUrl"
                        :alt="item.character.name"
                      />
                      <span v-else>{{ item.character.name.slice(0, 1) }}</span>
                    </div>
                    <div>
                      <h3>{{ item.character.name }}</h3>
                      <span>{{ getCharacterRoleTag(item.character.profile) }}</span>
                    </div>
                  </div>
                  <p class="character-brief">{{ item.character.profile || '暂无人设，点击进入详情补充角色定位。' }}</p>
                  <div class="character-tags">
                    <span v-for="tag in getCharacterTags(item.character.personality)" :key="tag">{{ tag }}</span>
                  </div>
                  <div class="character-tags voice-tags">
                    <span
                      v-for="tag in getVoiceTags(item.character.voiceProfile, item.character.voiceProfileType)"
                      :key="tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="card-link">{{ item.position === 'center' ? '查看详情 →' : '点击选中' }}</div>
                </article>
              </div>
              <button
                class="carousel-arrow carousel-arrow--right"
                type="button"
                @click="changeSelectedCharacter('right')"
              >
                ›
              </button>
              <div class="character-carousel-meta">
                {{ selectedCharacterIndex + 1 }} / {{ detail.characters.length }}
              </div>
            </div>
            <t-empty
              v-else
              description="还没有项目角色。建议先点击 AI 生成角色，系统会根据故事原文提取主角、反派和关键配角。"
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
              <p>AI 会以专业编剧导演视角拆分合适集数，项目总集数只作为参考上限，不会为了凑数强行注水。</p>
            </div>
            <t-button
              theme="primary"
              :disabled="!detail.originalStory && !detail.storySummary"
              :loading="generatingEpisodes"
              @click="handleGenerateEpisodes"
            >
              {{ episodeGenerateButtonText }}
            </t-button>
          </div>
          <div v-if="detail.episodes.length" class="episode-list">
            <article
              v-for="episode in detail.episodes"
              :key="episode.id"
              class="episode-card"
              @click="goEpisode(episode.id)"
            >
              <div class="episode-slate-strip">
                <span v-for="index in 5" :key="index"></span>
              </div>
              <div class="episode-card-header">
                <div class="episode-index">
                  <span>EPISODE</span>
                  <strong>{{ episode.episodeNo }}</strong>
                </div>
                <span class="episode-status" :class="getEpisodeStatusClass(episode.status)">
                  {{ getEpisodeStatusText(episode.status) }}
                </span>
              </div>
              <h3>{{ episode.title || `第 ${episode.episodeNo} 集` }}</h3>
              <div class="episode-preview">
                <p>{{ getEpisodePreview(episode) }}</p>
              </div>
              <div class="episode-card-footer">
                <strong>进入主控台 →</strong>
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
        <t-form-item label="音色特点" name="voiceProfile">
          <t-textarea
            v-model="characterForm.voiceProfile"
            placeholder="标签：清冷、克制、低语感；描述：声线、语速、情绪质感和适合的对白场景"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
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

    <t-dialog
      v-model:visible="episodeRegenerateVisible"
      header="重新拆分分集"
      width="680px"
      :confirm-loading="generatingEpisodes"
      confirm-btn="确认重新拆分"
      cancel-btn="取消"
      @confirm="handleConfirmRegenerateEpisodes"
    >
      <div class="regenerate-dialog">
        <p>
          当前项目已经存在分集大纲。重新拆分会删除旧分集、旧分集下的场景和镜头，再根据你的原因让 AI 重新拆分。
          你的每次重新拆分要求都会被系统记住，并在后续拆分时提供给 AI 参考。
        </p>
        <t-textarea
          v-model="episodeRegenerateReason"
          placeholder="请说明为什么要重新拆分，例如：前两集节奏太慢；不要强行拆满10集；每集结尾要更强反转；减少重复冲突。"
          :autosize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  createDramaCharacter,
  deleteDramaCharacter,
  generateDramaCharacters,
  generateDramaEpisodes,
  getDramaSeriesDetail,
} from '@/api/modules/ai/drama';
import type {
  DramaCharacter,
  DramaCharacterCreateRequest,
  DramaEpisode,
  DramaSeriesDetail,
} from '@/types/modules/ai/drama';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const generatingEpisodes = ref(false);
const generatingCharacters = ref(false);
const characterVisible = ref(false);
const savingCharacter = ref(false);
const episodeRegenerateVisible = ref(false);
const episodeRegenerateReason = ref('');
const detail = ref<DramaSeriesDetail>();
const selectedCharacterIndex = ref(0);
let characterCarouselTimer: number | undefined;

const characterForm = reactive<DramaCharacterCreateRequest>({
  name: '',
  profile: '',
  appearance: '',
  costume: '',
  personality: '',
  voiceProfileType: 'PROMPT',
  voiceProfile: '',
  relationship: '',
});

const projectId = computed(() => Number(route.params.id));
const storyStatusText = computed(() => (detail.value?.storyStatus === 'READY' ? '已生成' : '未开始'));
const episodeGenerateButtonText = computed(() => (detail.value?.episodes?.length ? '重新拆分分集' : 'AI 拆分分集'));
const visibleCharacterCards = computed(() => {
  const characters = detail.value?.characters || [];
  if (!characters.length) return [];
  if (characters.length === 1) {
    return [{ character: characters[0], index: 0, position: 'center' }] as Array<{
      character: DramaCharacter;
      index: number;
      position: CharacterCardPosition;
    }>;
  }
  if (characters.length === 2) {
    const center = normalizeCharacterIndex(selectedCharacterIndex.value);
    return [
      { character: characters[center], index: center, position: 'center' },
      {
        character: characters[normalizeCharacterIndex(center + 1)],
        index: normalizeCharacterIndex(center + 1),
        position: 'right',
      },
    ] as CharacterCardItem[];
  }
  if (characters.length === 3) {
    const center = normalizeCharacterIndex(selectedCharacterIndex.value);
    return [
      {
        character: characters[normalizeCharacterIndex(center - 1)],
        index: normalizeCharacterIndex(center - 1),
        position: 'left',
      },
      { character: characters[center], index: center, position: 'center' },
      {
        character: characters[normalizeCharacterIndex(center + 1)],
        index: normalizeCharacterIndex(center + 1),
        position: 'right',
      },
    ] as CharacterCardItem[];
  }
  if (characters.length === 4) {
    const center = normalizeCharacterIndex(selectedCharacterIndex.value);
    return [
      {
        character: characters[normalizeCharacterIndex(center - 1)],
        index: normalizeCharacterIndex(center - 1),
        position: 'left',
      },
      { character: characters[center], index: center, position: 'center' },
      {
        character: characters[normalizeCharacterIndex(center + 1)],
        index: normalizeCharacterIndex(center + 1),
        position: 'right',
      },
      {
        character: characters[normalizeCharacterIndex(center + 2)],
        index: normalizeCharacterIndex(center + 2),
        position: 'far-right',
      },
    ] as CharacterCardItem[];
  }
  const center = normalizeCharacterIndex(selectedCharacterIndex.value);
  return [
    {
      character: characters[normalizeCharacterIndex(center - 2)],
      index: normalizeCharacterIndex(center - 2),
      position: 'far-left',
    },
    {
      character: characters[normalizeCharacterIndex(center - 1)],
      index: normalizeCharacterIndex(center - 1),
      position: 'left',
    },
    { character: characters[center], index: center, position: 'center' },
    {
      character: characters[normalizeCharacterIndex(center + 1)],
      index: normalizeCharacterIndex(center + 1),
      position: 'right',
    },
    {
      character: characters[normalizeCharacterIndex(center + 2)],
      index: normalizeCharacterIndex(center + 2),
      position: 'far-right',
    },
  ] as CharacterCardItem[];
});

type CharacterCardPosition = 'far-left' | 'left' | 'center' | 'right' | 'far-right';
interface CharacterCardItem {
  character: DramaCharacter;
  index: number;
  position: CharacterCardPosition;
}

function resetCharacterForm() {
  characterForm.name = '';
  characterForm.profile = '';
  characterForm.appearance = '';
  characterForm.costume = '';
  characterForm.personality = '';
  characterForm.voiceProfileType = 'PROMPT';
  characterForm.voiceProfile = '';
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
    syncSelectedCharacterFromRoute();
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

async function handleGenerateCharacters() {
  if (detail.value?.characters?.length) {
    MessagePlugin.warning('数据已存在，请删除后再生成');
    return;
  }
  generatingCharacters.value = true;
  try {
    const characters = await generateDramaCharacters(projectId.value);
    MessagePlugin.success(`AI 角色生成完成，当前共有 ${characters.length} 个项目角色`);
    await loadDetail();
  } finally {
    generatingCharacters.value = false;
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
  if (detail.value?.episodes?.length) {
    episodeRegenerateReason.value = '';
    episodeRegenerateVisible.value = true;
    return;
  }
  await submitGenerateEpisodes();
}

async function handleConfirmRegenerateEpisodes() {
  if (!episodeRegenerateReason.value.trim()) {
    MessagePlugin.warning('请填写重新拆分原因');
    return;
  }
  await submitGenerateEpisodes(episodeRegenerateReason.value.trim());
  episodeRegenerateVisible.value = false;
}

async function submitGenerateEpisodes(reason?: string) {
  generatingEpisodes.value = true;
  try {
    await generateDramaEpisodes(projectId.value, detail.value?.totalEpisodes || 3, reason);
    MessagePlugin.success(reason ? '分集大纲已重新拆分' : '分集大纲已生成');
    await loadDetail();
  } finally {
    generatingEpisodes.value = false;
  }
}

function goEpisode(episodeId: number) {
  router.push(`/ai/drama/projects/${projectId.value}/episodes/${episodeId}`);
}

function goCharacter(characterId: number) {
  sessionStorage.setItem(lastSelectedCharacterKey(), String(characterId));
  router.push(`/ai/drama/projects/${projectId.value}/characters/${characterId}`);
}

function goStory() {
  router.push(`/ai/drama/projects/${projectId.value}/story`);
}

function normalizeCharacterIndex(index: number) {
  const count = detail.value?.characters.length || 0;
  if (!count) return 0;
  return (index + count) % count;
}

function syncSelectedCharacterFromRoute() {
  const characters = detail.value?.characters || [];
  if (!characters.length) {
    selectedCharacterIndex.value = 0;
    return;
  }
  const focusCharacterId = resolveFocusCharacterId();
  if (focusCharacterId) {
    const index = characters.findIndex((character) => character.id === focusCharacterId);
    if (index >= 0) {
      selectedCharacterIndex.value = index;
      return;
    }
  }
  if (selectedCharacterIndex.value >= characters.length) {
    selectedCharacterIndex.value = 0;
  }
}

function resolveFocusCharacterId() {
  const queryValue = route.query.focusCharacterId || route.query.characterId;
  const fromQuery = Array.isArray(queryValue) ? queryValue[0] : queryValue;
  const queryId = Number(fromQuery);
  if (Number.isFinite(queryId) && queryId > 0) {
    return queryId;
  }
  const storageId = Number(sessionStorage.getItem(lastSelectedCharacterKey()));
  return Number.isFinite(storageId) && storageId > 0 ? storageId : 0;
}

function lastSelectedCharacterKey() {
  return `qctv1:drama:${projectId.value}:last-character`;
}

function changeSelectedCharacter(direction: 'left' | 'right') {
  selectedCharacterIndex.value = normalizeCharacterIndex(
    selectedCharacterIndex.value + (direction === 'left' ? -1 : 1),
  );
}

function startCharacterCarouselAutoPlay() {
  stopCharacterCarouselAutoPlay();
  characterCarouselTimer = window.setInterval(() => {
    if ((detail.value?.characters.length || 0) <= 1) {
      return;
    }
    changeSelectedCharacter('right');
  }, 5000);
}

function stopCharacterCarouselAutoPlay() {
  if (characterCarouselTimer) {
    window.clearInterval(characterCarouselTimer);
    characterCarouselTimer = undefined;
  }
}

function handleCharacterCardClick(item: CharacterCardItem) {
  if (item.position === 'center') {
    goCharacter(item.character.id);
    return;
  }
  selectedCharacterIndex.value = item.index;
}

function getCharacterRoleTag(profile?: string) {
  const text = profile || '';
  if (text.includes('主角') || text.includes('核心')) return '主角';
  if (text.includes('反派') || text.includes('阻碍')) return '反派';
  if (text.includes('配角') || text.includes('辅助')) return '配角';
  return '角色';
}

function getCharacterTags(personality?: string) {
  const text = (personality || '').replace(/[，。；、]/g, ',');
  const tags = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  return tags.length ? tags : ['待完善'];
}

function getVoiceTags(voiceProfile?: string, voiceProfileType?: string) {
  if (voiceProfileType === 'VOICE_ID') {
    return voiceProfile ? ['音色ID'] : ['待定音色'];
  }
  if (voiceProfileType === 'AUDIO_ASSET_ID') {
    return voiceProfile ? ['音频样例'] : ['待定音色'];
  }
  const text = voiceProfile || '';
  const tagPart = text.match(/标签[:：]([^；;。]+)/)?.[1] || text;
  const tags = tagPart
    .replace(/[，。；、]/g, ',')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  return tags.length ? tags : ['待定音色'];
}

function getEpisodeStatusText(status?: string) {
  const statusMap: Record<string, string> = {
    OUTLINE_READY: '大纲完成',
    PLANNED: '待编写',
    READY: '已生成',
    SCRIPT_READY: '剧本完成',
    SHOT_READY: '镜头完成',
    VIDEO_READY: '视频完成',
    FAILED: '生成失败',
  };
  return statusMap[status || ''] || status || '待推进';
}

function getEpisodeStatusClass(status?: string) {
  if (status === 'FAILED') return 'is-failed';
  if (status === 'VIDEO_READY') return 'is-done';
  if (status === 'SCRIPT_READY' || status === 'SHOT_READY' || status === 'OUTLINE_READY' || status === 'READY') {
    return 'is-ready';
  }
  return 'is-pending';
}

function getEpisodePreview(episode: DramaEpisode) {
  return (
    episode.summary ||
    episode.hook ||
    episode.cliffhanger ||
    '本集内容待补充。进入单集工作台后可继续生成剧本、场景和镜头。'
  );
}

onMounted(async () => {
  await loadDetail();
  startCharacterCarouselAutoPlay();
});

onBeforeUnmount(() => {
  stopCharacterCarouselAutoPlay();
});
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

.panel-actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.workflow-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 22px;
  margin-bottom: 22px;
}

.character-rag-grid {
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  align-items: stretch;
}

.character-panel {
  overflow: hidden;
}

.episode-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.character-card,
.episode-card {
  padding: 18px;
  background: #f8f8fc;
  border: 1px solid transparent;
  border-radius: 18px;
}

.character-carousel-shell {
  position: relative;
  min-height: 354px;
  padding: 8px 34px 26px;
}

.character-stack {
  position: relative;
  height: 316px;
  max-width: 860px;
  margin: 0 auto;
  perspective: 1200px;
}

.character-card {
  position: absolute;
  top: 18px;
  left: 50%;
  width: min(310px, 48%);
  min-height: 272px;
  padding: 20px;
  overflow: hidden;
  cursor: pointer;
  background:
    radial-gradient(circle at 18% 10%, rgb(0 82 217 / 12%) 0, transparent 34%),
    linear-gradient(180deg, #fbfcff 0%, #f7f8fc 100%);
  transition:
    transform 0.86s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.86s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.86s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.86s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.86s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
  transform-origin: center center;
  backface-visibility: hidden;
  will-change: transform, opacity, filter;

  &:hover {
    border-color: #c8d8ff;
    box-shadow: 0 16px 34px rgb(34 38 64 / 8%);
  }

  h3 {
    margin: 0 28px 4px 0;
    color: #24263b;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: #697084;
    line-height: 1.65;
  }
}

.character-card::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgb(255 255 255 / 0%) 38%,
    rgb(255 255 255 / 58%) 48%,
    transparent 60%
  );
  opacity: 0;
  transform: translateX(-130%);
}

.character-card > * {
  position: relative;
  z-index: 1;
}

.character-card--far-left,
.character-card--left,
.character-card--right,
.character-card--far-right {
  z-index: 1;
  opacity: 0.78;
  filter: saturate(0.95);

  .delete-button,
  .character-tags {
    display: none;
  }

  .character-brief {
    -webkit-line-clamp: 2;
  }
}

.character-card--far-left,
.character-card--far-right {
  z-index: 0;
  opacity: 0.58;
  filter: saturate(0.86);

  .character-brief,
  .card-link {
    display: none;
  }
}

.character-card--far-left {
  transform: translateX(-152%) scale(0.8) rotateY(20deg) rotate(-4deg) translateZ(-56px);
}

.character-card--left {
  transform: translateX(-104%) scale(0.91) rotateY(13deg) rotate(-2deg) translateZ(-22px);
}

.character-card--right {
  transform: translateX(4%) scale(0.91) rotateY(-13deg) rotate(2deg) translateZ(-22px);
}

.character-card--far-right {
  transform: translateX(52%) scale(0.8) rotateY(-20deg) rotate(4deg) translateZ(-56px);
}

.character-card--center {
  z-index: 3;
  border-color: #b8cdfd;
  box-shadow:
    0 28px 58px rgb(0 82 217 / 16%),
    0 8px 18px rgb(34 38 64 / 8%);
  transform: translateX(-50%) scale(1.055) translateZ(48px);
}

.character-card--center::before {
  animation: card-shine 0.72s ease-out;
}

.character-card.is-active::after {
  position: absolute;
  inset: auto 18px 0;
  height: 3px;
  content: '';
  background: linear-gradient(90deg, #0052d9, #19a7ce);
  border-radius: 999px 999px 0 0;
}

.character-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  span {
    display: inline-flex;
    padding: 3px 8px;
    color: #0052d9;
    font-size: 12px;
    font-weight: 700;
    background: #eaf2ff;
    border-radius: 999px;
  }
}

.character-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  overflow: hidden;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #0052d9, #19a7ce);
  border-radius: 14px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.character-avatar.has-image {
  background: #eef5ff;
  border: 2px solid #fff;
  box-shadow: 0 8px 18px rgb(0 82 217 / 16%);
}

.character-brief {
  display: -webkit-box;
  min-height: 54px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.character-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 28px;
  margin-top: 14px;

  span {
    max-width: 90px;
    padding: 4px 8px;
    overflow: hidden;
    color: #57647a;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: #fff;
    border: 1px solid #edf1f8;
    border-radius: 999px;
  }
}

.voice-tags {
  margin-top: 8px;

  span {
    color: #7a4b00;
    background: #fff8e6;
    border-color: #ffe3a3;
  }
}

.card-link {
  position: absolute;
  right: 18px;
  bottom: 16px;
  color: #0052d9;
  font-weight: 700;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 58px;
  color: #0052d9;
  font-size: 30px;
  background: #fff;
  border: 1px solid #dbe6ff;
  border-radius: 18px;
  box-shadow: 0 12px 26px rgb(34 38 64 / 10%);
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 16px 32px rgb(0 82 217 / 14%);
    transform: translateY(-50%) scale(1.06);
  }
}

@keyframes card-shine {
  0% {
    opacity: 0;
    transform: translateX(-130%);
  }

  35% {
    opacity: 0.75;
  }

  100% {
    opacity: 0;
    transform: translateX(130%);
  }
}

.carousel-arrow--left {
  left: 0;
}

.carousel-arrow--right {
  right: 0;
}

.character-carousel-meta {
  position: absolute;
  right: 54px;
  bottom: 0;
  color: #8791a5;
  font-size: 12px;
  font-weight: 700;
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

.episode-card {
  position: relative;
  min-height: 252px;
  padding: 16px;
  overflow: hidden;
  cursor: pointer;
  background:
    radial-gradient(circle at 18% 10%, rgb(0 82 217 / 12%) 0, transparent 34%),
    linear-gradient(180deg, #fbfcff 0%, #f7f8fc 100%);
  border: 1px solid rgb(190 207 232 / 72%);
  border-radius: 14px;
  box-shadow:
    0 1px 0 rgb(255 255 255 / 90%) inset,
    0 18px 40px rgb(34 38 64 / 6%);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease,
    background 0.24s ease;

  &::after {
    display: none;
  }

  &:hover {
    background:
      radial-gradient(circle at 18% 10%, rgb(0 82 217 / 16%) 0, transparent 36%),
      linear-gradient(180deg, #fbfcff 0%, #f5f8ff 100%);
    border-color: #9fb8df;
    transform: translateY(-5px);
    box-shadow:
      0 1px 0 #fff inset,
      0 24px 48px rgb(31 41 55 / 12%);
  }

  h3 {
    position: relative;
    z-index: 1;
    display: -webkit-box;
    min-height: 28px;
    margin: 10px 0 8px;
    overflow: hidden;
    color: #172033;
    font-size: 17px;
    font-weight: 900;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
}

.episode-slate-strip {
  display: none;
}

.episode-card-header,
.episode-card-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.episode-index {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #1f2a3d;

  span {
    color: #7b8494;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.12em;
  }

  strong {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: #0052d9;
    font-size: 16px;
    font-weight: 900;
    line-height: 1;
    background: #eaf2ff;
    border: 1px solid #d4e3ff;
    border-radius: 9px;
  }
}

.episode-status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 6px;
}

.episode-status.is-ready {
  color: #0052d9;
  background: rgb(234 242 255 / 82%);
}

.episode-status.is-done {
  color: #078aa6;
  background: #e8f8fb;
}

.episode-status.is-failed {
  color: #c9352b;
  background: #fff0ef;
}

.episode-status.is-pending {
  color: #a16207;
  background: #fff7df;
}

.episode-preview {
  position: absolute;
  inset: 92px 16px 14px;
  z-index: 1;
  height: auto;
  padding: 15px 14px 38px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 48%) 0%, rgb(239 247 255 / 72%) 100%),
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(184 205 253 / 20%) 28px);
  border: 1px solid rgb(255 255 255 / 68%);
  border-radius: 12px;
  backdrop-filter: blur(4px);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 80%) inset,
    0 10px 24px rgb(0 82 217 / 4%);

  p {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: #44546a;
    font-size: 13px;
    line-height: 1.68;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
  }
}

.episode-preview::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 42px;
  pointer-events: none;
  content: '';
  background: linear-gradient(180deg, rgb(240 247 255 / 0%), rgb(239 247 255 / 96%) 82%);
}

.episode-card-footer {
  position: absolute;
  right: 28px;
  bottom: 22px;
  left: auto;
  margin-top: 0;
  padding-top: 0;
  color: #0052d9;
  font-size: 12px;
  border-top: 0;
  justify-content: flex-end;
  z-index: 3;

  strong {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    height: auto;
    padding: 4px 8px;
    color: #0052d9;
    font-size: 13px;
    font-weight: 900;
    background: rgb(255 255 255 / 62%);
    border: 0;
    border-radius: 999px;
    box-shadow: 0 6px 16px rgb(0 82 217 / 8%);
    backdrop-filter: blur(5px);
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }
}

.episode-card:hover .episode-card-footer strong {
  color: #19a7ce;
  background: rgb(255 255 255 / 78%);
  transform: translateX(2px);
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

.regenerate-dialog {
  display: grid;
  gap: 14px;

  p {
    margin: 0;
    color: #4b5565;
    line-height: 1.8;
  }
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

  .panel-actions {
    margin-top: 14px;
  }

  .character-carousel-shell {
    padding: 0 30px 22px;
  }

  .character-stack {
    height: 300px;
    max-width: 100%;
  }

  .character-card {
    width: min(286px, 68%);
  }

  .character-card--far-left,
  .character-card--far-right {
    display: none;
  }

  .character-card--left {
    transform: translateX(-96%) scale(0.84) rotate(-2deg);
  }

  .character-card--right {
    transform: translateX(-4%) scale(0.84) rotate(2deg);
  }
}
</style>
