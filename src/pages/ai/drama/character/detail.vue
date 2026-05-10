<template>
  <div class="character-detail-page">
    <button class="back-button" @click="goBackToProject">← 返回项目详情</button>

    <t-loading :loading="loading" text="加载角色详情中...">
      <template v-if="character">
        <section class="hero-card">
          <div class="character-mark">
            <img v-if="avatarAsset" :src="avatarAsset.accessUrl" :alt="character.name" />
            <span v-else>{{ character.name.slice(0, 1) }}</span>
          </div>

          <div class="hero-main">
            <span class="badge">项目级角色</span>
            <h1>{{ character.name }}</h1>
            <p>{{ character.profile || '暂无人设。后续可以在这里编辑角色定位、目标、秘密和剧情功能。' }}</p>
            <div class="meta-row">
              <span>全身定妆照：{{ portraitAsset ? `#${portraitAsset.id}` : '未生成' }}</span>
              <span>头像素材：{{ character.avatarAssetId ? `#${character.avatarAssetId}` : '未生成' }}</span>
              <span>一致性种子：{{ character.imageSeed || '待生成' }}</span>
            </div>
          </div>

          <div
            class="portrait-stage"
            :class="{ clickable: portraitAsset }"
            @click="portraitAsset && openAssetPreview(portraitAsset)"
          >
            <img v-if="portraitAsset" :src="portraitAsset.accessUrl" :alt="`${character.name}全身定妆照`" />
            <button v-if="portraitAsset" class="image-danger-button" @click.stop="confirmDeleteAsset(portraitAsset)">
              删除
            </button>
            <div v-if="portraitAsset" class="preview-mask">点击预览</div>
            <div v-else class="portrait-empty">
              <span>全身定妆照</span>
              <small>点击 AI角色生成 后展示</small>
            </div>
          </div>

          <div class="hero-actions">
            <t-button
              theme="primary"
              :loading="generatingPortrait"
              :disabled="generatingPortrait"
              @click="handleGeneratePortrait"
              >AI角色生成</t-button
            >
            <t-button variant="outline" @click="openEditCharacter">编辑角色资料</t-button>
          </div>
        </section>

        <section v-if="imageTasks.length" class="task-panel">
          <div class="task-panel-title">
            <h2>图片生成进度</h2>
            <span>没有真实百分比时，按生成阶段展示进度</span>
          </div>
          <div class="task-list">
            <div v-for="task in imageTasks" :key="task.id" class="task-item">
              <div>
                <strong>{{ taskTitle(task) }}</strong>
                <span>{{ taskStageText(task) }}</span>
              </div>
              <t-progress :percentage="task.progress || 0" :status="task.status === 'FAILED' ? 'error' : 'active'" />
            </div>
          </div>
        </section>

        <section class="workspace-grid">
          <article class="panel info-panel">
            <div class="panel-title compact">
              <div>
                <h2>角色设定</h2>
                <span>后续用于图片、视频和镜头一致性</span>
              </div>
            </div>
            <div class="info-list">
              <div>
                <label>人设定位</label>
                <p>{{ character.profile || '待补充' }}</p>
              </div>
              <div>
                <label>外貌特点</label>
                <p>{{ character.appearance || '待补充' }}</p>
              </div>
              <div>
                <label>常用服装</label>
                <p>{{ character.costume || '待补充' }}</p>
              </div>
              <div>
                <label>性格特点</label>
                <p>{{ character.personality || '待补充' }}</p>
              </div>
              <div>
                <label>人物关系</label>
                <p>{{ character.relationship || '待补充' }}</p>
              </div>
            </div>
            <div class="voice-config">
              <div class="voice-config-head">
                <div>
                  <h3>角色音色</h3>
                  <span>{{ voiceTypeLabel(character.voiceProfileType) }}</span>
                </div>
                <t-tag theme="primary" variant="light">{{ voiceStatusText }}</t-tag>
              </div>
              <div class="voice-type-tabs">
                <button
                  v-for="item in voiceTypeOptions"
                  :key="item.value"
                  type="button"
                  :class="{ active: voiceForm.voiceProfileType === item.value }"
                  @click="switchVoiceType(item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
              <t-textarea
                v-if="voiceForm.voiceProfileType === 'PROMPT'"
                v-model="voiceForm.voiceProfile"
                class="voice-input"
                :autosize="{ minRows: 4, maxRows: 6 }"
                placeholder="标签：清冷、克制、低语感；描述：声线、语速、情绪质感和适合的对白场景"
              />
              <t-input
                v-else-if="voiceForm.voiceProfileType === 'VOICE_ID'"
                v-model="voiceForm.voiceProfile"
                class="voice-input"
                placeholder="请输入平台或模型侧的音色 ID"
              />
              <div v-else class="voice-file-panel">
                <div class="voice-file-main">
                  <strong>{{ voiceSampleAsset ? voiceSampleAsset.fileName : '未绑定音频样例' }}</strong>
                  <span>{{ voiceSampleAsset ? `素材 #${voiceSampleAsset.id}` : '上传后会自动保存素材 ID' }}</span>
                </div>
                <audio v-if="voiceSampleAsset" :src="voiceSampleAsset.accessUrl" controls />
                <input
                  ref="voiceFileInput"
                  class="voice-file-input"
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                  @change="handleVoiceFileChange"
                />
                <t-button variant="outline" :loading="uploadingVoiceSample" @click="triggerVoiceFileSelect">
                  {{ voiceSampleAsset ? '更换音频' : '上传音频' }}
                </t-button>
              </div>
              <div v-if="voiceForm.voiceProfileType !== 'AUDIO_ASSET_ID'" class="voice-actions">
                <t-button theme="primary" :loading="savingVoiceProfile" @click="handleSaveVoiceProfile">
                  保存音色
                </t-button>
              </div>
            </div>
          </article>

          <article class="panel image-panel">
            <div class="image-toolbar">
              <div class="image-heading">
                <h2>辅助角色图片</h2>
                <p>围绕定妆图生成头像、三视图、表情与服装参考，保证后续镜头一致。</p>
              </div>
              <div class="image-toolbar-actions">
                <span v-if="portraitAsset" class="asset-count">{{ auxiliaryAssets.length }} 张辅助图</span>
                <t-button
                  v-if="portraitAsset"
                  theme="primary"
                  :loading="generatingAuxiliary"
                  :disabled="generatingAuxiliary"
                  @click="handleGenerateAuxiliaryImages"
                >
                  生成辅助图
                </t-button>
              </div>
            </div>

            <div v-if="!portraitAsset" class="need-portrait">
              <strong>请先生成全身定妆照</strong>
              <p>全身定妆照是人物一致性基准。生成后，这里会开放辅助图生成能力。</p>
            </div>

            <template v-else>
              <div class="image-filter-bar">
                <div class="filter-tabs" role="tablist">
                  <button :class="{ active: !selectedAuxiliaryType }" @click="selectedAuxiliaryType = ''">
                    全部
                    <span>{{ auxiliaryAssets.length }}</span>
                  </button>
                  <button
                    v-for="item in auxiliaryImageTypes"
                    :key="item.value"
                    :class="{ active: selectedAuxiliaryType === item.value }"
                    @click="toggleAuxiliaryType(item.value)"
                  >
                    {{ item.label }}
                    <span>{{ auxiliaryTypeCount(item.value) }}</span>
                  </button>
                </div>
                <small>{{
                  selectedAuxiliaryType ? `当前只看：${imageTypeLabel(selectedAuxiliaryType)}` : '当前展示全部辅助图'
                }}</small>
              </div>

              <div
                v-if="filteredAuxiliaryAssets.length"
                class="asset-gallery"
                :class="{
                  'is-filtered': selectedAuxiliaryType,
                  'is-single': selectedAuxiliaryType && filteredAuxiliaryAssets.length === 1,
                }"
              >
                <div
                  v-for="asset in filteredAuxiliaryAssets"
                  :key="asset.id"
                  class="asset-card"
                  @click="openAssetPreview(asset)"
                >
                  <div class="asset-preview">
                    <img :src="asset.accessUrl" :alt="asset.fileName" />
                    <span>{{ imageTypeLabel(asset.assetSubType) }}</span>
                    <button class="image-danger-button small" @click.stop="confirmDeleteAsset(asset)">删除</button>
                    <div class="preview-mask">点击预览</div>
                  </div>
                  <div class="asset-info">
                    <strong>{{ imageTypeLabel(asset.assetSubType) }}</strong>
                    <small>#{{ asset.id }} · {{ asset.status || 'READY' }}</small>
                  </div>
                </div>
              </div>

              <div v-else class="empty-gallery">
                <div class="empty-icon">IMG</div>
                <strong>还没有辅助图</strong>
                <p>点击“生成辅助图”后，会一次生成头像、三视图、表情参考图和服装版本图。</p>
              </div>
            </template>
          </article>
        </section>
      </template>
    </t-loading>

    <t-dialog
      v-model:visible="editVisible"
      width="760px"
      header="编辑角色资料"
      confirm-btn="保存资料"
      cancel-btn="取消"
      :confirm-loading="savingCharacter"
      @confirm="handleSaveCharacter"
    >
      <t-form label-align="top" class="character-edit-form">
        <t-form-item label="角色名称">
          <t-input v-model="editForm.name" placeholder="请输入角色名称" />
        </t-form-item>
        <t-form-item label="人设定位">
          <t-textarea
            v-model="editForm.profile"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="身份、人设、目标、秘密或剧情功能"
          />
        </t-form-item>
        <t-form-item label="外貌特点">
          <t-textarea
            v-model="editForm.appearance"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="年龄感、发型、五官、体态、气质、可用于图片生成的视觉特点"
          />
        </t-form-item>
        <t-form-item label="常用服装">
          <t-textarea
            v-model="editForm.costume"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="服装颜色、材质、时代/职业特征、配饰"
          />
        </t-form-item>
        <t-form-item label="性格特点">
          <t-textarea
            v-model="editForm.personality"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="性格关键词和行为特点"
          />
        </t-form-item>
        <t-form-item label="人物关系">
          <t-textarea
            v-model="editForm.relationship"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="与主角、反派、配角之间的关系和冲突"
          />
        </t-form-item>
      </t-form>
      <template #footer>
        <div class="edit-dialog-footer">
          <span>保存只更新角色资料，不会自动删除已生成图片。需要重生成时，请先删除旧定妆图。</span>
          <div>
            <t-button variant="outline" @click="editVisible = false">取消</t-button>
            <t-button theme="primary" :loading="savingCharacter" @click="handleSaveCharacter">保存资料</t-button>
          </div>
        </div>
      </template>
    </t-dialog>

    <t-dialog
      v-model:visible="assetPreviewVisible"
      width="980px"
      :footer="false"
      :header="previewAsset ? imageTypeLabel(previewAsset.assetSubType) : '图片预览'"
    >
      <div v-if="previewAsset" class="asset-preview-dialog">
        <div class="asset-preview-large">
          <img :src="previewAsset.accessUrl" :alt="previewAsset.fileName" />
        </div>
        <aside class="asset-preview-meta">
          <h3>{{ imageTypeLabel(previewAsset.assetSubType) }}</h3>
          <p>{{ previewAsset.fileName }}</p>
          <div class="meta-list">
            <span>素材ID：#{{ previewAsset.id }}</span>
            <span>类型：{{ previewAsset.assetType }}</span>
            <span>子类型：{{ previewAsset.assetSubType || '未标注' }}</span>
            <span>状态：{{ previewAsset.status || 'READY' }}</span>
            <span>创建时间：{{ previewAsset.createdAt }}</span>
          </div>
          <div class="preview-actions">
            <t-button variant="outline" @click="assetPreviewVisible = false">关闭</t-button>
            <t-button theme="danger" @click="confirmDeletePreviewAsset">删除图片</t-button>
          </div>
        </aside>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  deleteDramaCharacterAsset,
  generateDramaCharacterAuxiliaryImages,
  generateDramaCharacterImage,
  getDramaCharacterDetail,
  getDramaTask,
  listDramaCharacterAssets,
  updateDramaCharacter,
  uploadDramaCharacterVoiceSample,
} from '@/api/modules/ai/drama';
import type { DramaAsset, DramaCharacter, DramaCharacterCreateRequest, DramaTask } from '@/types/modules/ai/drama';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const generatingPortrait = ref(false);
const generatingAuxiliary = ref(false);
const editVisible = ref(false);
const savingCharacter = ref(false);
const savingVoiceProfile = ref(false);
const uploadingVoiceSample = ref(false);
const assetPreviewVisible = ref(false);
const character = ref<DramaCharacter>();
const assets = ref<DramaAsset[]>([]);
const imageTasks = ref<DramaTask[]>([]);
const selectedAuxiliaryType = ref('');
const previewAsset = ref<DramaAsset>();
const voiceFileInput = ref<HTMLInputElement>();
let pollingTimer: number | undefined;

const editForm = ref<DramaCharacterCreateRequest>({
  name: '',
  profile: '',
  appearance: '',
  costume: '',
  personality: '',
  relationship: '',
});

const voiceForm = ref<Pick<DramaCharacterCreateRequest, 'voiceProfileType' | 'voiceProfile'>>({
  voiceProfileType: 'PROMPT',
  voiceProfile: '',
});

type VoiceProfileType = NonNullable<DramaCharacterCreateRequest['voiceProfileType']>;

const voiceTypeOptions: Array<{ value: VoiceProfileType; label: string }> = [
  { value: 'PROMPT', label: '提示词' },
  { value: 'VOICE_ID', label: '音色 ID' },
  { value: 'AUDIO_ASSET_ID', label: '音频样例' },
];

const auxiliaryImageTypes = [
  { value: 'AVATAR', label: '头像' },
  { value: 'THREE_VIEW', label: '三视图' },
  { value: 'EXPRESSION', label: '表情参考图' },
  { value: 'COSTUME', label: '服装版本图' },
];

const imageTypeLabels: Record<string, string> = {
  PORTRAIT: '全身定妆照',
  AVATAR: '头像',
  THREE_VIEW: '三视图',
  EXPRESSION: '表情参考图',
  COSTUME: '服装版本图',
};

const projectId = computed(() => Number(route.params.id));
const characterId = computed(() => Number(route.params.characterId));

const portraitAsset = computed(() => {
  if (character.value?.primaryReferenceAssetId) {
    const primary = assets.value.find((item) => item.id === character.value?.primaryReferenceAssetId);
    if (primary) return primary;
  }
  return assets.value.find((item) => item.assetSubType === 'PORTRAIT');
});

const avatarAsset = computed(() => {
  if (character.value?.avatarAssetId) {
    const avatar = assets.value.find((item) => item.id === character.value?.avatarAssetId);
    if (avatar) return avatar;
  }
  return assets.value.find((item) => item.assetSubType === 'AVATAR');
});

const auxiliaryAssets = computed(() =>
  assets.value.filter((item) => item.assetSubType && item.assetSubType !== 'PORTRAIT'),
);

const voiceSampleAsset = computed(() => {
  if (voiceForm.value.voiceProfileType !== 'AUDIO_ASSET_ID') return undefined;
  const assetId = Number(voiceForm.value.voiceProfile);
  if (!Number.isFinite(assetId) || assetId <= 0) return undefined;
  return assets.value.find((item) => item.id === assetId);
});

const voiceStatusText = computed(() => {
  if (voiceForm.value.voiceProfileType === 'AUDIO_ASSET_ID') {
    return voiceSampleAsset.value ? `素材 #${voiceSampleAsset.value.id}` : '待上传';
  }
  return voiceForm.value.voiceProfile?.trim() ? '已配置' : '待配置';
});

const filteredAuxiliaryAssets = computed(() => {
  if (!selectedAuxiliaryType.value) return auxiliaryAssets.value;
  return auxiliaryAssets.value.filter((item) => item.assetSubType === selectedAuxiliaryType.value);
});

async function loadCharacter() {
  loading.value = true;
  try {
    await refreshAssets();
  } catch (error: any) {
    MessagePlugin.error(error?.message || '角色详情加载失败');
  } finally {
    loading.value = false;
  }
}

function goBackToProject() {
  router.push({
    path: `/ai/drama/projects/${projectId.value}`,
    query: { focusCharacterId: String(characterId.value) },
  });
}

async function refreshAssets() {
  const [characterDetail, characterAssets] = await Promise.all([
    getDramaCharacterDetail(projectId.value, characterId.value),
    listDramaCharacterAssets(projectId.value, characterId.value),
  ]);
  character.value = characterDetail;
  assets.value = characterAssets;
  syncVoiceForm(characterDetail);
}

async function handleGeneratePortrait() {
  if (generatingPortrait.value) return;
  if (portraitAsset.value) {
    MessagePlugin.warning('数据已存在，请删除后再生成');
    return;
  }
  generatingPortrait.value = true;
  try {
    const task = await generateDramaCharacterImage(projectId.value, characterId.value, 'PORTRAIT');
    upsertTasks([task]);
    startPollingTasks();
    MessagePlugin.success('全身定妆照任务已提交');
  } catch (error: any) {
    MessagePlugin.error(error?.message || 'AI角色生成失败');
    generatingPortrait.value = false;
  }
}

function openEditCharacter() {
  if (!character.value) return;
  editForm.value = {
    name: character.value.name || '',
    profile: character.value.profile || '',
    appearance: character.value.appearance || '',
    costume: character.value.costume || '',
    personality: character.value.personality || '',
    relationship: character.value.relationship || '',
  };
  editVisible.value = true;
}

async function handleSaveCharacter() {
  if (!editForm.value.name?.trim()) {
    MessagePlugin.warning('角色名称不能为空');
    return;
  }
  savingCharacter.value = true;
  try {
    const updated = await updateDramaCharacter(projectId.value, characterId.value, {
      ...editForm.value,
      voiceProfileType: character.value?.voiceProfileType || 'PROMPT',
      voiceProfile: character.value?.voiceProfile || '',
      name: editForm.value.name.trim(),
    });
    character.value = updated;
    syncVoiceForm(updated);
    editVisible.value = false;
    MessagePlugin.success('角色资料已保存');
  } catch (error: any) {
    MessagePlugin.error(error?.message || '角色资料保存失败');
  } finally {
    savingCharacter.value = false;
  }
}

function syncVoiceForm(source?: DramaCharacter) {
  voiceForm.value = {
    voiceProfileType: normalizeVoiceType(source?.voiceProfileType),
    voiceProfile: source?.voiceProfile || '',
  };
}

function normalizeVoiceType(value?: string): VoiceProfileType {
  if (value === 'VOICE_ID' || value === 'AUDIO_ASSET_ID' || value === 'PROMPT') {
    return value;
  }
  return 'PROMPT';
}

function voiceTypeLabel(value?: string) {
  const normalized = normalizeVoiceType(value);
  return voiceTypeOptions.find((item) => item.value === normalized)?.label || '提示词';
}

function switchVoiceType(value: VoiceProfileType) {
  voiceForm.value.voiceProfileType = value;
  if (value === 'AUDIO_ASSET_ID' && !Number(voiceForm.value.voiceProfile)) {
    voiceForm.value.voiceProfile = '';
  }
}

async function handleSaveVoiceProfile() {
  if (!character.value) return;
  if (voiceForm.value.voiceProfileType === 'VOICE_ID' && !voiceForm.value.voiceProfile?.trim()) {
    MessagePlugin.warning('请填写音色 ID');
    return;
  }
  if (voiceForm.value.voiceProfileType === 'PROMPT' && !voiceForm.value.voiceProfile?.trim()) {
    MessagePlugin.warning('请填写音色提示词');
    return;
  }
  savingVoiceProfile.value = true;
  try {
    const updated = await updateDramaCharacter(projectId.value, characterId.value, {
      name: character.value.name,
      profile: character.value.profile,
      appearance: character.value.appearance,
      costume: character.value.costume,
      personality: character.value.personality,
      relationship: character.value.relationship,
      voiceProfileType: voiceForm.value.voiceProfileType,
      voiceProfile: voiceForm.value.voiceProfile?.trim() || '',
    });
    character.value = updated;
    syncVoiceForm(updated);
    MessagePlugin.success('角色音色已保存');
  } finally {
    savingVoiceProfile.value = false;
  }
}

function triggerVoiceFileSelect() {
  voiceFileInput.value?.click();
}

async function handleVoiceFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  uploadingVoiceSample.value = true;
  try {
    const asset = await uploadDramaCharacterVoiceSample(projectId.value, characterId.value, file);
    await refreshAssets();
    voiceForm.value = {
      voiceProfileType: 'AUDIO_ASSET_ID',
      voiceProfile: String(asset.id),
    };
    if (character.value) {
      character.value = {
        ...character.value,
        voiceProfileType: 'AUDIO_ASSET_ID',
        voiceProfile: String(asset.id),
      };
    }
    MessagePlugin.success('音频样例已上传并绑定');
  } catch (error: any) {
    MessagePlugin.error(error?.message || '音频样例上传失败');
  } finally {
    uploadingVoiceSample.value = false;
  }
}

async function handleGenerateAuxiliaryImages() {
  if (generatingAuxiliary.value) return;
  if (!portraitAsset.value) {
    MessagePlugin.warning('请先生成全身定妆照');
    return;
  }
  if (auxiliaryAssets.value.length >= auxiliaryImageTypes.length) {
    MessagePlugin.warning('数据已存在，请删除后再生成');
    return;
  }
  generatingAuxiliary.value = true;
  try {
    const tasks = await generateDramaCharacterAuxiliaryImages(projectId.value, characterId.value);
    if (!tasks.length) {
      MessagePlugin.info('辅助图已存在，没有新任务需要生成');
      return;
    }
    upsertTasks(tasks);
    startPollingTasks();
    selectedAuxiliaryType.value = '';
    MessagePlugin.success('辅助角色图片任务已提交');
  } catch (error: any) {
    MessagePlugin.error(error?.message || '辅助图生成失败');
    generatingAuxiliary.value = false;
  }
}

function toggleAuxiliaryType(value: string) {
  selectedAuxiliaryType.value = selectedAuxiliaryType.value === value ? '' : value;
}

function imageTypeLabel(value?: string) {
  return value ? imageTypeLabels[value] || '角色图片' : '角色图片';
}

function auxiliaryTypeCount(value: string) {
  return auxiliaryAssets.value.filter((item) => item.assetSubType === value).length;
}

function openAssetPreview(asset: DramaAsset) {
  previewAsset.value = asset;
  assetPreviewVisible.value = true;
}

function confirmDeletePreviewAsset() {
  if (!previewAsset.value) return;
  confirmDeleteAsset(previewAsset.value);
}

function upsertTasks(tasks: DramaTask[]) {
  const map = new Map(imageTasks.value.map((item) => [item.id, item]));
  tasks.forEach((task) => map.set(task.id, task));
  imageTasks.value = Array.from(map.values()).sort((a, b) => b.id - a.id);
}

function startPollingTasks() {
  if (pollingTimer) return;
  pollingTimer = window.setInterval(pollTasks, 2000);
  void pollTasks();
}

async function pollTasks() {
  const activeTasks = imageTasks.value.filter((task) => !['SUCCEEDED', 'FAILED'].includes(task.status));
  if (!activeTasks.length) {
    stopPollingTasks();
    generatingPortrait.value = false;
    generatingAuxiliary.value = false;
    await refreshAssets();
    return;
  }
  const latestTasks = await Promise.all(activeTasks.map((task) => getDramaTask(task.id)));
  upsertTasks(latestTasks);
  if (latestTasks.some((task) => task.status === 'SUCCEEDED')) {
    await refreshAssets();
  }
  if (!imageTasks.value.some((task) => !['SUCCEEDED', 'FAILED'].includes(task.status))) {
    stopPollingTasks();
    generatingPortrait.value = false;
    generatingAuxiliary.value = false;
    await refreshAssets();
  }
}

function stopPollingTasks() {
  if (!pollingTimer) return;
  window.clearInterval(pollingTimer);
  pollingTimer = undefined;
}

function taskTitle(task: DramaTask) {
  if (task.assetId) return `图片素材 #${task.assetId}`;
  return `图片任务 #${task.id}`;
}

function taskStageText(task: DramaTask) {
  const stageMap: Record<string, string> = {
    QUEUED: '排队中',
    GENERATING: '生成中',
    DOWNLOADING: '下载中',
    SAVING: '保存中',
    DONE: '已完成',
    FAILED: '失败',
  };
  return `${stageMap[task.stage || 'QUEUED'] || task.stage || '排队中'} · ${task.errorMessage || task.status}`;
}

function confirmDeleteAsset(asset: DramaAsset) {
  const dialog = DialogPlugin.confirm({
    header: '确认删除图片',
    body: `确定删除这张「${imageTypeLabel(asset.assetSubType)}」吗？图片文件会移动到 D:\\AI视频\\回收站，页面和数据库中将不再引用。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      try {
        await deleteDramaCharacterAsset(projectId.value, characterId.value, asset.id);
        await refreshAssets();
        if (previewAsset.value?.id === asset.id) {
          assetPreviewVisible.value = false;
          previewAsset.value = undefined;
        }
        MessagePlugin.success('图片已删除，并已移动到回收站');
        dialog.hide();
      } catch (error: any) {
        MessagePlugin.error(error?.message || '图片删除失败');
      }
    },
  });
}

onMounted(loadCharacter);
onBeforeUnmount(stopPollingTasks);
</script>
<style scoped lang="less">
.character-detail-page {
  min-height: calc(100vh - 96px);
  padding: 30px;
  background:
    radial-gradient(circle at 10% 0%, rgb(0 82 217 / 8%), transparent 32%),
    linear-gradient(180deg, #f7f8fc 0%, #f2f4f8 100%);
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
  background: rgb(255 255 255 / 94%);
  border: 1px solid rgb(133 139 160 / 12%);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgb(34 38 64 / 6%);
}

.hero-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 210px auto;
  gap: 22px;
  align-items: center;
  min-height: 230px;
  padding: 28px 32px;
  margin-bottom: 22px;
}

.character-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  overflow: hidden;
  color: #fff;
  font-size: 38px;
  font-weight: 900;
  background: linear-gradient(135deg, #0052d9, #19a7ce);
  border: 4px solid #fff;
  border-radius: 30px;
  box-shadow: 0 16px 34px rgb(0 82 217 / 18%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hero-main {
  min-width: 0;

  h1 {
    margin: 10px 0 8px;
    color: #202235;
    font-size: 34px;
    line-height: 1.15;
  }

  p {
    display: -webkit-box;
    max-width: 980px;
    margin: 0;
    overflow: hidden;
    color: #697084;
    line-height: 1.7;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.badge {
  display: inline-flex;
  padding: 6px 12px;
  color: #0052d9;
  background: #eef5ff;
  border-radius: 999px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;

  span {
    padding: 6px 10px;
    color: #667085;
    background: #f5f7fb;
    border-radius: 999px;
  }
}

.portrait-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 186px;
  height: 210px;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fbff, #fff);
  border: 1px dashed #bed2f3;
  border-radius: 22px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.portrait-stage.clickable {
  cursor: pointer;

  &:hover .preview-mask {
    opacity: 1;
  }

  &:hover .image-danger-button {
    opacity: 1;
    transform: translateY(0);
  }
}

.portrait-empty {
  display: grid;
  gap: 8px;
  color: #98a2b3;
  text-align: center;

  span {
    color: #344054;
    font-weight: 700;
  }
}

.hero-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.task-panel {
  padding: 20px 24px;
  margin-bottom: 22px;
  background: rgb(255 255 255 / 94%);
  border: 1px solid rgb(133 139 160 / 12%);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgb(34 38 64 / 6%);
}

.task-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: #22243a;
    font-size: 18px;
  }

  span {
    color: #8a90a2;
  }
}

.task-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.task-item {
  display: grid;
  gap: 10px;
  padding: 14px;
  background: #f8faff;
  border: 1px solid #edf2fb;
  border-radius: 16px;

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  strong {
    color: #27314a;
  }

  span {
    color: #667085;
    font-size: 13px;
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.72fr) minmax(560px, 1.28fr);
  gap: 22px;
  align-items: stretch;
}

.panel {
  box-sizing: border-box;
  padding: 24px;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    color: #22243a;
    font-size: 20px;
  }

  span {
    color: #8a90a2;
  }
}

.panel-title.compact {
  align-items: flex-start;
}

.info-panel {
  display: flex;
  flex-direction: column;
  height: 720px;
  min-height: 720px;
  max-height: 720px;
}

.info-list {
  display: grid;
  gap: 10px;
  flex: 0 0 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;

  div {
    padding: 12px 14px;
    background: #f8f8fc;
    border-radius: 16px;
  }

  label {
    display: block;
    margin-bottom: 6px;
    color: #8a90a2;
    font-size: 13px;
  }

  p {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: #27314a;
    line-height: 1.65;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.voice-config {
  display: grid;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgb(0 82 217 / 8%), rgb(255 255 255 / 0%) 42%), #fbfcff;
  border: 1px solid #e7edf8;
  border-radius: 18px;
}

.voice-config-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  h3 {
    margin: 0 0 4px;
    color: #27314a;
    font-size: 16px;
  }

  span {
    color: #8a90a2;
    font-size: 13px;
  }
}

.voice-type-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 4px;
  background: #f2f5fb;
  border-radius: 12px;

  button {
    height: 34px;
    color: #667085;
    font-weight: 700;
    background: transparent;
    border: 0;
    border-radius: 9px;
    cursor: pointer;
  }

  button.active {
    color: #0052d9;
    background: #fff;
    box-shadow: 0 6px 16px rgb(34 38 64 / 8%);
  }
}

.voice-input {
  width: 100%;
}

.voice-file-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px dashed #cfd9ea;
  border-radius: 14px;

  audio {
    width: 100%;
  }
}

.voice-file-main {
  display: grid;
  gap: 4px;

  strong {
    color: #27314a;
  }

  span {
    color: #8a90a2;
    font-size: 13px;
  }
}

.voice-file-input {
  display: none;
}

.voice-actions {
  display: flex;
  justify-content: flex-end;
}

.image-panel {
  display: flex;
  flex-direction: column;
  height: 720px;
  min-height: 720px;
  max-height: 720px;
  padding: 0;
  overflow: hidden;
}

.image-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 26px 16px;
  border-bottom: 1px solid #eef2f8;
}

.image-heading {
  h2 {
    margin: 0;
    color: #202235;
    font-size: 22px;
    letter-spacing: -0.02em;
  }

  p {
    max-width: 620px;
    margin: 6px 0 0;
    color: #8a90a2;
    line-height: 1.6;
  }
}

.image-toolbar-actions {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
}

.asset-count {
  padding: 7px 10px;
  color: #667085;
  font-size: 13px;
  background: #f5f7fb;
  border: 1px solid #edf1f7;
  border-radius: 999px;
}

.image-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 26px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);

  small {
    flex-shrink: 0;
    color: #98a2b3;
  }
}

.filter-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 5px;
  overflow: auto;
  background: #f2f5fa;
  border: 1px solid #e8eef8;
  border-radius: 16px;

  button {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    height: 36px;
    padding: 0 12px;
    color: #667085;
    font-weight: 700;
    white-space: nowrap;
    background: transparent;
    border: 0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.18s ease;

    span {
      min-width: 20px;
      padding: 2px 6px;
      color: #8a90a2;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      background: rgb(255 255 255 / 72%);
      border-radius: 999px;
    }

    &:hover {
      color: #0052d9;
      background: rgb(255 255 255 / 72%);
    }

    &.active {
      color: #fff;
      background: linear-gradient(135deg, #0052d9, #0b74ff);
      box-shadow: 0 8px 18px rgb(0 82 217 / 18%);

      span {
        color: #0052d9;
        background: #fff;
      }
    }
  }
}

.need-portrait,
.empty-gallery {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 28px;
  color: #697084;
  text-align: center;
  background: linear-gradient(180deg, #f8fbff 0%, #fff 100%);
  border: 1px dashed #d8e0f0;
  border-radius: 22px;

  strong {
    color: #27314a;
    font-size: 18px;
  }

  p {
    max-width: 420px;
    line-height: 1.7;
  }
}

.asset-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-content: start;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 26px 26px;
}

.asset-gallery.is-filtered {
  grid-template-columns: repeat(auto-fit, minmax(300px, 360px));
  place-content: start center;
}

.asset-gallery.is-single {
  align-content: center;
  align-items: center;
}

.asset-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf1f7;
  border-radius: 20px;
  box-shadow: 0 12px 24px rgb(34 38 64 / 5%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: #c8d8ff;
    box-shadow: 0 18px 36px rgb(0 82 217 / 10%);
    transform: translateY(-2px);
  }
}

.asset-preview {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #eef5ff, #fff7ed);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  span {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 5px 10px;
    color: #0052d9;
    font-weight: 700;
    background: rgb(255 255 255 / 88%);
    border: 1px solid rgb(0 82 217 / 12%);
    border-radius: 999px;
    backdrop-filter: blur(8px);
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:hover .preview-mask {
    opacity: 1;
  }

  &:hover .image-danger-button {
    opacity: 1;
    transform: translateY(0);
  }
}

.asset-gallery.is-filtered .asset-card {
  width: 100%;
  max-width: 360px;
}

.asset-gallery.is-filtered .asset-preview {
  height: 260px;
}

.preview-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(180deg, rgb(16 24 40 / 8%), rgb(16 24 40 / 52%));
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.image-danger-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  padding: 5px 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  background: rgb(217 45 32 / 88%);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 10px 22px rgb(217 45 32 / 24%);
  cursor: pointer;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;

  &:hover {
    background: #b42318;
  }
}

.image-danger-button.small {
  padding: 4px 9px;
  font-size: 12px;
}

.asset-info {
  display: grid;
  gap: 4px;
  padding: 13px 15px 15px;

  strong {
    color: #27314a;
    font-size: 15px;
  }

  small {
    color: #8a90a2;
  }
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  margin-bottom: 14px;
  color: #fff;
  font-weight: 900;
  background: #0052d9;
  border-radius: 22px;
}

.character-edit-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 18px;

  :deep(.t-form__item:first-child) {
    grid-column: 1 / -1;
  }
}

.edit-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

  span {
    color: #8a90a2;
    font-size: 13px;
  }

  div {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
  }
}

.asset-preview-dialog {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: stretch;
}

.asset-preview-large {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 560px;
  overflow: hidden;
  background:
    linear-gradient(45deg, #f5f7fb 25%, transparent 25%), linear-gradient(-45deg, #f5f7fb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f5f7fb 75%), linear-gradient(-45deg, transparent 75%, #f5f7fb 75%);
  background-color: #fff;
  background-position:
    0 0,
    0 12px,
    12px -12px,
    -12px 0;
  background-size: 24px 24px;
  border: 1px solid #edf1f7;
  border-radius: 20px;

  img {
    max-width: 100%;
    max-height: 680px;
    object-fit: contain;
  }
}

.asset-preview-meta {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: #f8faff;
  border: 1px solid #edf2fb;
  border-radius: 20px;

  h3 {
    margin: 0 0 8px;
    color: #202235;
    font-size: 20px;
  }

  p {
    margin: 0 0 16px;
    overflow-wrap: anywhere;
    color: #667085;
    line-height: 1.6;
  }
}

.meta-list {
  display: grid;
  gap: 10px;

  span {
    padding: 9px 10px;
    color: #344054;
    background: #fff;
    border: 1px solid #edf1f7;
    border-radius: 12px;
  }
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 18px;
}

@media (width <= 1380px) {
  .hero-card {
    grid-template-columns: 88px minmax(0, 1fr) 180px;
  }

  .hero-actions {
    grid-column: 2 / 4;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 900px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .portrait-stage {
    width: 100%;
    height: 360px;
  }

  .asset-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .task-list {
    grid-template-columns: 1fr;
  }

  .asset-preview-dialog {
    grid-template-columns: 1fr;
  }

  .asset-preview-large {
    min-height: 420px;
  }
}

@media (width <= 620px) {
  .character-detail-page {
    padding: 18px;
  }

  .character-edit-form {
    grid-template-columns: 1fr;
  }

  .edit-dialog-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .asset-gallery {
    grid-template-columns: 1fr;
  }
}
</style>
