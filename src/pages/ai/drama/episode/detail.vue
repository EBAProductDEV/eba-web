<template>
  <div class="episode-page">
    <t-loading :loading="loading" text="加载单集主控台中...">
      <template v-if="detail">
        <section class="workspace-header">
          <div class="workspace-title">
            <button class="back-button" @click="router.push(`/ai/drama/projects/${projectId}`)">← 返回项目详情</button>
            <span class="episode-badge">第 {{ detail.episode.episodeNo }} 集</span>
            <h1>{{ detail.episode.title }}</h1>
          </div>

          <div class="workspace-metrics">
            <div>
              <span>当前推进</span>
              <strong>{{ productionSteps[currentProductionStep]?.title }}</strong>
            </div>
            <div>
              <span>当前查看</span>
              <strong>{{ activeStepTitle }}</strong>
            </div>
          </div>
        </section>

        <section class="steps-card">
          <div class="steps-header">
            <div>
              <strong>制作步骤</strong>
              <span>当前推进到：{{ productionSteps[currentProductionStep]?.title }}</span>
            </div>
            <t-button
              theme="danger"
              variant="outline"
              :disabled="rollbackOptions.length === 0"
              @click="openRollbackDialog"
            >
              进度回退
            </t-button>
          </div>
          <div class="clickable-steps">
            <button
              v-for="(step, index) in productionSteps"
              :key="step.key"
              class="step-node"
              :class="{
                'is-active': activeStepKey === step.key,
                'is-done': step.done,
                'is-current': index === currentProductionStep,
              }"
              type="button"
              @click="activeStepKey = step.key"
            >
              <span class="step-dot"></span>
              <strong>{{ step.title }}</strong>
              <small>{{ step.description }}</small>
            </button>
          </div>
        </section>

        <section class="stage-card">
          <template v-if="activeStepKey === 'outline'">
            <div class="outline-workbench">
              <aside class="outline-sidebar">
                <span class="section-kicker">分集大纲</span>
                <h2>制作蓝图</h2>
                <p>这里不是正文编辑区，而是本集生产的导演任务卡：确认本集要讲什么、从哪里进入、在哪里留下钩子。</p>
                <div class="outline-status">
                  <strong>已完成</strong>
                  <span>来自项目故事拆分结果</span>
                </div>
              </aside>

              <div class="outline-main">
                <div class="outline-main-header">
                  <div>
                    <strong>第 {{ detail.episode.episodeNo }} 集生产目标</strong>
                    <span>{{ detail.episode.title }}</span>
                  </div>
                  <t-tag theme="primary" variant="light">下一步：单集正文</t-tag>
                </div>

                <div class="outline-storyline">
                  <div class="storyline-item primary">
                    <span>剧情任务</span>
                    <p>{{ detail.episode.summary || '暂无本集摘要。' }}</p>
                  </div>
                  <div class="storyline-item">
                    <span>开场进入点</span>
                    <p>{{ detail.episode.hook || '待补充' }}</p>
                  </div>
                  <div class="storyline-item">
                    <span>结尾留钩点</span>
                    <p>{{ detail.episode.cliffhanger || '待补充' }}</p>
                  </div>
                </div>

                <div class="outline-next">
                  <div>
                    <span>生产建议</span>
                    <p>
                      下一步生成单集小说正文时，会围绕剧情任务扩写细节，保留开场钩子和结尾悬念，不在这一页重复编辑。
                    </p>
                  </div>
                  <t-button theme="primary" variant="outline" @click="activeStepKey = 'novel'">进入单集正文</t-button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeStepKey === 'novel'">
            <div class="section-title">
              <div>
                <span class="section-kicker">正文生产</span>
                <h2>本集小说正文</h2>
                <p>先把分集摘要扩写成小说式正文，再进入剧本、场景和镜头拆分。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('NOVEL')" theme="success" variant="light">正文步骤已完成</t-tag>
                <t-button v-if="hasNovelContent" variant="outline" theme="primary" @click="openNovelPreview"
                  >查看全文</t-button
                >
                <template v-if="!isStepCompleted('NOVEL')">
                  <t-button
                    v-if="!hasNovelContent"
                    theme="primary"
                    :loading="generatingNovel"
                    @click="handleGenerateNovel"
                  >
                    AI 生成正文
                  </t-button>
                  <t-button
                    v-else
                    theme="primary"
                    variant="outline"
                    :loading="generatingNovel"
                    @click="openNovelRegenerateDialog"
                  >
                    重新生成正文
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!hasNovelContent"
                    :loading="completingStep === 'NOVEL'"
                    @click="handleCompleteStep('NOVEL')"
                  >
                    完成正文步骤
                  </t-button>
                </template>
              </div>
            </div>
            <div v-if="hasNovelContent" class="novel-preview-card" @click="openNovelPreview">
              <div class="novel-preview-toolbar">
                <span>正文预览</span>
                <strong>{{ novelWordCount }} 字</strong>
              </div>
              <p>{{ novelPreviewText }}</p>
              <div class="novel-fade">点击查看完整正文</div>
            </div>
            <div v-else class="novel-empty-card">
              <div class="empty-mark">AI</div>
              <h3>还没有生成本集小说正文</h3>
              <p>生成后会作为单集剧本的直接上游材料，让对白、情节推进和场景拆分更稳定。</p>
              <t-button
                v-if="!isStepCompleted('NOVEL')"
                theme="primary"
                :loading="generatingNovel"
                @click="handleGenerateNovel"
              >
                开始生成正文
              </t-button>
            </div>
          </template>

          <template v-else-if="activeStepKey === 'script'">
            <div class="section-title script-title">
              <div>
                <span class="section-kicker">剧本生产</span>
                <h2>单集剧本</h2>
                <p>这是后续拆场景、拆镜头、生成图片和视频的基础。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('SCRIPT')" theme="success" variant="light">剧本步骤已完成</t-tag>
                <template v-else-if="isStepCompleted('NOVEL')">
                  <t-button v-if="!hasScript" theme="primary" :loading="generatingScript" @click="handleGenerateScript">
                    AI 生成本集剧本
                  </t-button>
                  <t-button
                    v-else
                    theme="primary"
                    variant="outline"
                    :loading="generatingScript"
                    @click="openRegenerateDialog"
                  >
                    重新生成剧本
                  </t-button>
                  <t-button
                    theme="primary"
                    variant="outline"
                    :disabled="!scriptForm.trim()"
                    :loading="savingScript"
                    @click="handleSaveScript"
                  >
                    保存当前剧本
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!hasScript"
                    :loading="completingStep === 'SCRIPT'"
                    @click="handleCompleteStep('SCRIPT')"
                  >
                    完成剧本步骤
                  </t-button>
                </template>
              </div>
            </div>
            <template v-if="isStepCompleted('NOVEL')">
              <div v-if="isStepCompleted('SCRIPT')" class="readonly-content">
                <div v-if="hasScript" class="markdown-preview" v-html="renderMarkdown(scriptForm)" />
                <t-empty v-else description="暂无单集剧本。" />
              </div>
              <t-textarea
                v-else
                v-model="scriptForm"
                class="script-editor"
                placeholder="这里会展示或编辑本集完整剧本。建议包含场次、地点、时间、人物、动作、对白、情绪和结尾钩子。"
                :autosize="{ minRows: 18, maxRows: 28 }"
              />
            </template>
            <t-empty v-else description="请先完成本集小说正文步骤，再进入单集剧本。" />
          </template>

          <template v-else-if="activeStepKey === 'scene'">
            <div class="section-title compact">
              <div>
                <span class="section-kicker">场景拆分</span>
                <h2>场景拆分</h2>
                <p>只拆本集的剧情空间、拍摄地点、时间氛围和剧情目的，不生成镜头。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('SCENE')" theme="success" variant="light">场景步骤已完成</t-tag>
                <template v-else-if="isStepCompleted('SCRIPT')">
                  <t-button
                    theme="primary"
                    variant="outline"
                    :disabled="!hasScript"
                    :loading="generatingScenes"
                    @click="sceneGroups.length ? openSceneRegenerateDialog() : handleGenerateScenes()"
                  >
                    {{ sceneGroups.length ? '重新拆分场景' : 'AI 拆分场景' }}
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!sceneGroups.length"
                    :loading="completingStep === 'SCENE'"
                    @click="handleCompleteStep('SCENE')"
                  >
                    完成场景步骤
                  </t-button>
                </template>
              </div>
            </div>
            <template v-if="isStepCompleted('SCRIPT')">
              <div v-if="sceneGroups.length" class="scene-list">
                <article v-for="group in sceneGroups" :key="group.scene.id" class="scene-block">
                  <h3>{{ group.scene.name }}</h3>
                  <p>地点：{{ group.scene.location || '-' }} · 时间：{{ group.scene.timeOfDay || '-' }}</p>
                  <p>{{ group.scene.plotPurpose || '暂无剧情目的。' }}</p>
                  <span>{{ group.shots.length }} 个镜头</span>
                </article>
              </div>
              <t-empty v-else description="暂无场景，请先按场景拆分镜头。" />
            </template>
            <t-empty v-else description="请先完成单集剧本步骤，再进入场景拆分。" />
          </template>

          <template v-else-if="activeStepKey === 'shot'">
            <div class="section-title compact">
              <div>
                <span class="section-kicker">镜头拆分</span>
                <h2>镜头清单</h2>
                <p>基于已完成的场景列表，生成可用于图片和视频生产的镜头级任务。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('SHOT')" theme="success" variant="light">镜头步骤已完成</t-tag>
                <template v-else-if="isStepCompleted('SCENE')">
                  <t-button
                    theme="primary"
                    variant="outline"
                    :loading="generatingShots"
                    @click="detail.shots.length ? openShotRegenerateDialog() : handleGenerateShots()"
                  >
                    {{ detail.shots.length ? '重新拆分镜头' : 'AI 拆分镜头' }}
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!detail.shots.length"
                    :loading="completingStep === 'SHOT'"
                    @click="handleCompleteStep('SHOT')"
                  >
                    完成镜头步骤
                  </t-button>
                </template>
              </div>
            </div>
            <template v-if="isStepCompleted('SCENE')">
              <div v-if="detail.shots.length" class="shot-list">
                <article v-for="shot in detail.shots" :key="shot.id" class="shot-block">
                  <strong>镜头 {{ shot.shotNo }} · {{ shot.shotSize || '未设置景别' }}</strong>
                  <div class="shot-meta-grid">
                    <span>{{ shot.durationSeconds ? `${shot.durationSeconds} 秒` : '未设置时长' }}</span>
                    <span>{{ shot.cameraMovement || '未设置运镜' }}</span>
                    <span>{{ shot.transitionType || '未设置转场' }}</span>
                    <span>{{ continuityTypeText(shot.continuityType) }}</span>
                  </div>
                  <p>{{ shot.action || '暂无镜头动作。' }}</p>
                  <p v-if="shot.startState || shot.endState" class="shot-subline">
                    起止：{{ shot.startState || '未设置起始状态' }} → {{ shot.endState || '未设置结束状态' }}
                  </p>
                  <p v-if="shot.continuityNote" class="shot-subline">衔接：{{ shot.continuityNote }}</p>
                  <p v-if="shot.composition" class="shot-subline">构图：{{ shot.composition }}</p>
                  <p v-if="shot.soundEffect || shot.musicCue || shot.voiceOver" class="shot-subline">
                    声音：{{ shot.soundEffect || '无音效' }} / {{ shot.musicCue || '无配乐' }} /
                    {{ shot.voiceOver || '无旁白' }}
                  </p>
                </article>
              </div>
              <t-empty v-else description="暂无镜头，请先完成场景拆分。" />
            </template>
            <t-empty v-else description="请先完成场景拆分步骤，再进入镜头拆分。" />
          </template>

          <template v-else-if="activeStepKey === 'dialogue'">
            <div class="section-title compact">
              <div>
                <span class="section-kicker">台词生成</span>
                <h2>镜头台词</h2>
                <p>基于镜头动作和单集剧本，为每个镜头生成短剧化台词或旁白。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('DIALOGUE')" theme="success" variant="light">台词步骤已完成</t-tag>
                <template v-else-if="isStepCompleted('SHOT')">
                  <t-button
                    theme="primary"
                    variant="outline"
                    :loading="generatingDialogues"
                    @click="hasAnyDialogues ? openDialogueRegenerateDialog() : handleGenerateDialogues()"
                  >
                    {{ hasAnyDialogues ? '重新生成台词' : 'AI 生成台词' }}
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!hasAllDialogues"
                    :loading="completingStep === 'DIALOGUE'"
                    @click="handleCompleteStep('DIALOGUE')"
                  >
                    完成台词步骤
                  </t-button>
                </template>
              </div>
            </div>
            <template v-if="isStepCompleted('SHOT')">
              <div v-if="detail.shots.length" class="dialogue-list-wrap">
                <div class="dialogue-progress-card">
                  <span class="dialogue-progress-dot" :class="{ 'is-complete': hasAllDialogues }"></span>
                  <strong>台词进度 {{ dialogueReadyCount }} / {{ detail.shots.length }}</strong>
                  <span>{{ hasAllDialogues ? '所有镜头已覆盖，可以完成本步骤。' : '每个镜头都需要台词或“无”。' }}</span>
                </div>
                <div class="shot-list dialogue-shot-list">
                  <article v-for="shot in detail.shots" :key="shot.id" class="shot-block">
                    <strong>镜头 {{ shot.shotNo }} · {{ shot.shotSize || '未设置景别' }}</strong>
                    <div class="shot-meta-grid compact">
                      <span>{{ shot.durationSeconds ? `${shot.durationSeconds} 秒` : '未设置时长' }}</span>
                      <span>{{ shot.cameraMovement || '未设置运镜' }}</span>
                    </div>
                    <p>{{ shot.action || '暂无镜头动作。' }}</p>
                    <span class="dialogue-line">台词：{{ shot.dialogue || '待生成' }}</span>
                  </article>
                </div>
              </div>
              <t-empty v-else description="暂无镜头，请先完成镜头拆分。" />
            </template>
            <t-empty v-else description="请先完成镜头拆分步骤，再进入台词生成。" />
          </template>

          <template v-else-if="activeStepKey === 'image'">
            <div class="section-title compact">
              <div>
                <span class="section-kicker">图片生成</span>
                <h2>图片素材</h2>
                <p>本步骤负责生成场景参考图和镜头参考图/首帧图，给后续视频生成提供稳定视觉依据。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('IMAGE')" theme="success" variant="light">图片步骤已完成</t-tag>
                <template v-else-if="isStepCompleted('DIALOGUE')">
                  <t-button
                    theme="primary"
                    variant="outline"
                    :disabled="
                      !sceneGroups.length || sceneImageReadyCount >= sceneGroups.length || generatingSceneImages
                    "
                    :loading="generatingSceneImages"
                    @click="handleGenerateSceneImages"
                  >
                    生成场景参考图
                  </t-button>
                  <t-button
                    theme="primary"
                    variant="outline"
                    :disabled="
                      !detail.shots.length || shotImageReadyCount >= detail.shots.length || generatingShotImages
                    "
                    :loading="generatingShotImages"
                    @click="handleGenerateShotImages"
                  >
                    生成镜头参考图/首帧图
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!canCompleteImageStep"
                    :loading="completingStep === 'IMAGE'"
                    @click="handleCompleteStep('IMAGE')"
                  >
                    完成图片步骤
                  </t-button>
                </template>
              </div>
            </div>
            <template v-if="isStepCompleted('DIALOGUE')">
              <div class="image-workbench">
                <div class="image-progress-row">
                  <div class="image-progress-pill">
                    <span>场景参考图</span>
                    <strong>{{ sceneImageReadyCount }} / {{ sceneGroups.length }}</strong>
                  </div>
                  <div class="image-progress-pill">
                    <span>镜头参考图</span>
                    <strong>{{ shotImageReadyCount }} / {{ detail.shots.length }}</strong>
                  </div>
                  <div class="image-progress-pill">
                    <span>进行中任务</span>
                    <strong>{{ activeImageTaskCount }}</strong>
                  </div>
                </div>

                <div class="image-columns">
                  <section class="image-panel">
                    <div class="image-panel-head">
                      <div>
                        <strong>场景参考图</strong>
                        <span>用于统一地点、空间、灯光和氛围</span>
                      </div>
                    </div>
                    <div v-if="sceneGroups.length" class="asset-grid scene-asset-grid">
                      <article
                        v-for="group in sceneGroups"
                        :key="group.scene.id"
                        class="asset-card"
                        :class="{
                          'is-generating': isSceneImageGenerating(group.scene.id),
                          'has-image': Boolean(findSceneImage(group.scene.id)),
                        }"
                        @click="openAssetPreview(findSceneImage(group.scene.id))"
                      >
                        <template v-if="findSceneImage(group.scene.id)?.accessUrl">
                          <img :src="findSceneImage(group.scene.id)?.accessUrl" alt="场景参考图" />
                          <button
                            class="image-delete-button"
                            type="button"
                            @click.stop="confirmDeleteAsset(findSceneImage(group.scene.id))"
                          >
                            删除
                          </button>
                          <button
                            class="video-prompt-button"
                            type="button"
                            @click.stop="openImagePromptViewer(findSceneImage(group.scene.id), '场景参考图提示词')"
                          >
                            预览提示词
                          </button>
                          <div class="image-preview-mask">点击预览</div>
                        </template>
                        <div
                          v-else-if="isSceneImageGenerating(group.scene.id)"
                          class="asset-placeholder generating-placeholder"
                        >
                          <div class="ai-render-orb"></div>
                          <span>AI 渲染中</span>
                          <small>{{ imageTaskStageText(findSceneImageTask(group.scene.id)) }}</small>
                        </div>
                        <div v-else class="asset-placeholder empty-generation-card">
                          <div class="generation-icon">AI</div>
                          <small>生成场景参考图</small>
                          <button
                            class="single-generate-button secondary"
                            type="button"
                            :disabled="generatingSingleSceneImages[group.scene.id]"
                            @click.stop="handleEditSceneImagePrompt(group.scene.id)"
                          >
                            编辑提示词
                          </button>
                          <button
                            class="single-generate-button"
                            type="button"
                            :disabled="generatingSingleSceneImages[group.scene.id]"
                            @click.stop="handleGenerateSingleSceneImage(group.scene.id)"
                          >
                            {{ generatingSingleSceneImages[group.scene.id] ? '提交中...' : '生成图片' }}
                          </button>
                        </div>
                        <div class="asset-meta">
                          <strong>{{ group.scene.name }}</strong>
                          <span
                            >{{ group.scene.location || '未设置地点' }} ·
                            {{ group.scene.timeOfDay || '未设置时间' }}</span
                          >
                        </div>
                      </article>
                    </div>
                    <t-empty v-else description="暂无场景，请先完成场景拆分。" />
                  </section>

                  <section class="image-panel">
                    <div class="image-panel-head">
                      <div>
                        <strong>镜头参考图 / 首帧图</strong>
                        <span>用于后续单镜头视频生成的视觉起点</span>
                      </div>
                    </div>
                    <div v-if="detail.shots.length" class="asset-grid">
                      <article
                        v-for="shot in detail.shots"
                        :key="shot.id"
                        class="asset-card"
                        :class="{
                          'is-generating': isShotImageGenerating(shot.id),
                          'has-image': Boolean(findShotImage(shot.id)),
                        }"
                        @click="openAssetPreview(findShotImage(shot.id))"
                      >
                        <template v-if="findShotImage(shot.id)?.accessUrl">
                          <img :src="findShotImage(shot.id)?.accessUrl" alt="镜头参考图" />
                          <button
                            class="image-delete-button"
                            type="button"
                            @click.stop="confirmDeleteAsset(findShotImage(shot.id))"
                          >
                            删除
                          </button>
                          <button
                            class="video-prompt-button"
                            type="button"
                            @click.stop="openImagePromptViewer(findShotImage(shot.id), '镜头首帧图提示词')"
                          >
                            预览提示词
                          </button>
                          <div class="image-preview-mask">点击预览</div>
                        </template>
                        <div
                          v-else-if="isShotImageGenerating(shot.id)"
                          class="asset-placeholder generating-placeholder"
                        >
                          <div class="ai-render-orb"></div>
                          <span>AI 渲染中</span>
                          <small>{{ imageTaskStageText(findShotImageTask(shot.id)) }}</small>
                        </div>
                        <div v-else class="asset-placeholder empty-generation-card">
                          <div class="generation-icon">AI</div>
                          <small>生成镜头首帧图</small>
                          <button
                            class="single-generate-button secondary"
                            type="button"
                            :disabled="generatingSingleShotImages[shot.id]"
                            @click.stop="handleEditShotImagePrompt(shot.id)"
                          >
                            编辑提示词
                          </button>
                          <button
                            class="single-generate-button"
                            type="button"
                            :disabled="generatingSingleShotImages[shot.id]"
                            @click.stop="handleGenerateSingleShotImage(shot.id)"
                          >
                            {{ generatingSingleShotImages[shot.id] ? '提交中...' : '生成图片' }}
                          </button>
                        </div>
                        <div class="asset-meta">
                          <strong>镜头 {{ shot.shotNo }} · {{ shot.shotSize || '未设置景别' }}</strong>
                          <span>{{ shot.action || '暂无镜头动作' }}</span>
                        </div>
                      </article>
                    </div>
                    <t-empty v-else description="暂无镜头，请先完成镜头拆分。" />
                  </section>
                </div>
              </div>
            </template>
            <t-empty v-else description="请先完成台词生成步骤，再进入图片生成。" />
          </template>

          <template v-else-if="activeStepKey === 'video'">
            <div class="section-title compact">
              <div>
                <span class="section-kicker">视频生成</span>
                <h2>视频任务</h2>
                <p>按镜头首帧图生成单镜头视频。视频只负责画面表演和运镜，台词与配音后续单独合成。</p>
              </div>
              <div class="panel-actions">
                <t-tag v-if="isStepCompleted('VIDEO')" theme="success" variant="light">视频步骤已完成</t-tag>
                <template v-else-if="isStepCompleted('IMAGE')">
                  <t-button
                    theme="primary"
                    variant="outline"
                    :disabled="
                      !detail.shots.length || shotVideoReadyCount >= detail.shots.length || generatingShotVideos
                    "
                    :loading="generatingShotVideos"
                    @click="handleGenerateShotVideos"
                  >
                    一键生成缺失视频
                  </t-button>
                  <t-button
                    theme="success"
                    :disabled="!canCompleteVideoStep"
                    :loading="completingStep === 'VIDEO'"
                    @click="handleCompleteStep('VIDEO')"
                  >
                    完成视频步骤
                  </t-button>
                </template>
              </div>
            </div>
            <template v-if="isStepCompleted('IMAGE')">
              <div class="image-workbench video-workbench">
                <div class="image-progress-row">
                  <div class="image-progress-pill">
                    <span>镜头视频</span>
                    <strong>{{ shotVideoReadyCount }} / {{ detail.shots.length }}</strong>
                  </div>
                  <div class="image-progress-pill">
                    <span>进行中任务</span>
                    <strong>{{ activeVideoTaskCount }}</strong>
                  </div>
                  <div class="image-progress-pill">
                    <span>生成策略</span>
                    <strong>首帧图生视频</strong>
                  </div>
                </div>

                <section class="image-panel">
                  <div class="image-panel-head">
                    <div>
                      <strong>镜头视频片段</strong>
                      <span>每个镜头生成一个无声视频，后续再做配音、字幕和成片合成</span>
                    </div>
                  </div>
                  <div v-if="detail.shots.length" class="asset-grid video-asset-grid">
                    <article
                      v-for="shot in detail.shots"
                      :key="shot.id"
                      class="asset-card video-asset-card"
                      :class="{
                        'is-generating': isShotVideoGenerating(shot.id),
                        'has-image': Boolean(findShotVideo(shot.id)),
                      }"
                      @click="openAssetPreview(findShotVideo(shot.id))"
                    >
                      <template v-if="findShotVideo(shot.id)?.accessUrl">
                        <video :src="findShotVideo(shot.id)?.accessUrl" muted preload="metadata"></video>
                        <button
                          class="image-delete-button"
                          type="button"
                          @click.stop="confirmDeleteAsset(findShotVideo(shot.id))"
                        >
                          删除
                        </button>
                        <button
                          class="video-prompt-button"
                          type="button"
                          @click.stop="openVideoPromptViewer(findShotVideo(shot.id))"
                        >
                          提示词
                        </button>
                        <div class="image-preview-mask">点击预览</div>
                      </template>
                      <div
                        v-else-if="isShotVideoGenerating(shot.id)"
                        class="asset-placeholder generating-placeholder video-generating-placeholder"
                      >
                        <button
                          class="video-prompt-button is-visible"
                          type="button"
                          :disabled="!shot.videoPrompt"
                          @click.stop="openShotVideoPromptViewer(shot)"
                        >
                          提示词
                        </button>
                        <div class="ai-render-orb"></div>
                        <span>AI 生视频中</span>
                        <small>{{ videoTaskStageText(findShotVideoTask(shot.id)) }}</small>
                        <t-progress
                          class="video-task-progress"
                          theme="line"
                          :percentage="findShotVideoTask(shot.id)?.progress || 0"
                          :show-info="false"
                        />
                      </div>
                      <div v-else class="asset-placeholder empty-generation-card video-empty-card">
                        <img
                          v-if="findShotImage(shot.id)?.accessUrl"
                          :src="findShotImage(shot.id)?.accessUrl"
                          alt="镜头首帧图"
                        />
                        <div v-else class="generation-icon">AI</div>
                        <small>{{ findShotImage(shot.id) ? '使用首帧图生成视频' : '请先生成首帧图' }}</small>
                        <button
                          class="single-generate-button secondary"
                          type="button"
                          :disabled="!findShotImage(shot.id) || generatingSingleShotVideos[shot.id]"
                          @click.stop="handleEditShotVideoPrompt(shot.id)"
                        >
                          编辑提示词
                        </button>
                        <button
                          class="single-generate-button"
                          type="button"
                          :disabled="!findShotImage(shot.id) || generatingSingleShotVideos[shot.id]"
                          @click.stop="handleGenerateSingleShotVideo(shot.id)"
                        >
                          {{ generatingSingleShotVideos[shot.id] ? '提交中...' : '生成视频' }}
                        </button>
                      </div>
                      <div class="asset-meta">
                        <strong>镜头 {{ shot.shotNo }} · {{ shot.durationSeconds || 10 }} 秒</strong>
                        <span>{{ shot.videoPrompt || shot.action || '暂无视频提示词' }}</span>
                      </div>
                    </article>
                  </div>
                  <t-empty v-else description="暂无镜头，请先完成镜头拆分。" />
                </section>
              </div>
            </template>
            <t-empty v-else description="请先完成图片步骤，再进入视频生成。" />
          </template>

          <template v-else>
            <div class="section-title compact">
              <div>
                <span class="section-kicker">剪映初稿</span>
                <h2>成片预览与剪映素材包</h2>
                <p>自动合成参考成片，同时输出干净视频、配音分轨、BGM 音效、字幕和弹幕时间表。</p>
              </div>
              <div class="panel-actions">
                <t-button
                  theme="primary"
                  :disabled="!isStepCompleted('VIDEO') || Boolean(activeJianyingDraftTask)"
                  :loading="generatingJianyingDraft || Boolean(activeJianyingDraftTask)"
                  @click="handleGenerateJianyingDraft"
                >
                  {{ activeJianyingDraftTask ? '生成中...' : '合成剪映初稿' }}
                </t-button>
              </div>
            </div>

            <template v-if="isStepCompleted('VIDEO')">
              <div class="draft-workbench">
                <div v-if="activeJianyingDraftTask" class="draft-status">
                  <div>
                    <strong>{{ activeJianyingDraftTask.stage || 'RUNNING' }}</strong>
                    <span>{{ activeJianyingDraftTask.errorMessage || '正在生成剪映初稿素材包' }}</span>
                  </div>
                  <t-progress theme="line" :percentage="activeJianyingDraftTask.progress || 0" :show-info="true" />
                </div>

                <section v-if="latestJianyingDraft" class="draft-result">
                  <div class="draft-preview">
                    <video
                      v-if="authenticatedJianyingDraftPreviewUrl"
                      :key="authenticatedJianyingDraftPreviewUrl"
                      :src="authenticatedJianyingDraftPreviewUrl"
                      controls
                      preload="metadata"
                    ></video>
                    <t-empty v-else description="参考成片路径已生成，但暂不可预览。" />
                  </div>
                  <div class="draft-files">
                    <strong>剪映素材包</strong>
                    <span>生成时间：{{ latestJianyingDraft.createdAt }}</span>
                    <ul>
                      <li>参考成片：{{ latestJianyingDraft.referenceVideoPath }}</li>
                      <li>干净视频：{{ latestJianyingDraft.cleanVideoPath }}</li>
                      <li>配音混音：{{ latestJianyingDraft.voiceMixPath }}</li>
                      <li>BGM 音效：{{ latestJianyingDraft.bgmSfxPath }}</li>
                      <li>字幕：{{ latestJianyingDraft.subtitleSrtPath }}</li>
                      <li>弹幕时间表：{{ latestJianyingDraft.danmakuCsvPath }}</li>
                    </ul>
                    <t-button
                      v-if="latestJianyingDraft.packageDownloadUrl"
                      theme="primary"
                      variant="outline"
                      @click="downloadJianyingPackage"
                    >
                      下载剪映素材包
                    </t-button>
                  </div>
                </section>

                <t-empty v-else description="还没有剪映初稿。点击合成后，会在本地素材库生成参考成片和可编辑素材包。" />
              </div>
            </template>
            <t-empty v-else description="请先完成视频步骤，再合成剪映初稿。" />
          </template>
        </section>
      </template>
    </t-loading>

    <t-dialog
      v-model:visible="regenerateVisible"
      header="重新生成单集剧本"
      width="680px"
      confirm-btn="确认重新生成"
      cancel-btn="取消"
      :confirm-loading="generatingScript"
      @confirm="handleConfirmRegenerateScript"
    >
      <div class="regenerate-dialog">
        <p>重新生成会覆盖当前单集剧本，但不会删除已经存在的场景、镜头和素材。请说明这次重写的原因和方向。</p>
        <t-textarea
          v-model="regenerateReason"
          placeholder="例如：本集节奏太慢；开头冲突不够强；对白更口语化；结尾悬念要更强。"
          :autosize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="novelRegenerateVisible"
      header="重新生成本集小说正文"
      width="680px"
      confirm-btn="确认重新生成"
      cancel-btn="取消"
      :confirm-loading="generatingNovel"
      @confirm="handleConfirmRegenerateNovel"
    >
      <div class="regenerate-dialog">
        <p>重新生成会覆盖当前本集小说正文，并影响后续剧本生成质量。请写清楚这次要调整的方向。</p>
        <t-textarea
          v-model="novelRegenerateReason"
          placeholder="例如：正文节奏太拖；强化男主冲突；增加女主出场铺垫；减少旁白，增强动作和心理描写。"
          :autosize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </t-dialog>

    <t-dialog v-model:visible="novelPreviewVisible" header="本集小说正文" width="900px" :footer="false">
      <div
        v-if="detail?.episode.novelContent"
        class="markdown-preview"
        v-html="renderMarkdown(detail.episode.novelContent)"
      />
      <t-empty v-else description="暂无本集小说正文，请先点击 AI 生成正文。" />
    </t-dialog>

    <t-dialog
      v-model:visible="sceneRegenerateVisible"
      header="重新拆分场景"
      width="680px"
      confirm-btn="确认重新拆分"
      cancel-btn="取消"
      :confirm-loading="generatingScenes"
      @confirm="handleConfirmRegenerateScenes"
    >
      <div class="regenerate-dialog">
        <p>重新拆分场景会覆盖当前场景，并清空这些场景下已经生成的镜头。请说明这次重新拆分的原因和方向。</p>
        <t-textarea
          v-model="sceneRegenerateReason"
          placeholder="例如：场景太少；地点跳转不清晰；开场压迫感不足；结尾场景要更适合留下悬念。"
          :autosize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="shotRegenerateVisible"
      header="重新拆分镜头"
      width="680px"
      confirm-btn="确认重新拆分"
      cancel-btn="取消"
      :confirm-loading="generatingShots"
      @confirm="handleConfirmRegenerateShots"
    >
      <div class="regenerate-dialog">
        <p>重新拆分镜头会覆盖当前镜头列表，但不会删除已经落盘的图片或视频文件。请说明这次重新拆分的原因和方向。</p>
        <t-textarea
          v-model="shotRegenerateReason"
          placeholder="例如：镜头太少；缺少特写；动作不够连续；视频提示词需要更适合竖屏短剧。"
          :autosize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="dialogueRegenerateVisible"
      header="重新生成台词"
      width="680px"
      confirm-btn="确认重新生成"
      cancel-btn="取消"
      :confirm-loading="generatingDialogues"
      @confirm="handleConfirmRegenerateDialogues"
    >
      <div class="regenerate-dialog">
        <p>
          重新生成台词会覆盖当前镜头台词，但不会修改镜头动作、图片提示词和视频提示词。请说明这次重新生成的原因和方向。
        </p>
        <t-textarea
          v-model="dialogueRegenerateReason"
          placeholder="例如：台词太平；反派压迫感不足；女主需要更隐忍；对白更短更短剧化。"
          :autosize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="rollbackVisible"
      header="进度回退"
      width="620px"
      confirm-btn="下一步"
      cancel-btn="取消"
      :confirm-loading="rollingBack"
      @confirm="confirmRollbackStep"
    >
      <div class="regenerate-dialog">
        <p>请选择要回退到的步骤。确认后，系统会删除该步骤后面的业务内容；图片和视频文件会移动到 D:\AI视频\回收站。</p>
        <t-select v-model="rollbackStep" placeholder="选择回退步骤" :options="rollbackOptions" />
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="imagePromptDialogVisible"
      width="1120px"
      placement="center"
      :footer="false"
      :close-on-overlay-click="false"
      destroy-on-close
    >
      <template #header>
        <div class="image-prompt-dialog-title">
          <span>AI 图片任务确认</span>
          <strong>{{ imagePromptPreview?.title || '图片生成' }}</strong>
        </div>
      </template>
      <div v-if="imagePromptPreview" class="image-prompt-dialog">
        <section class="image-prompt-reference-zone">
          <div class="image-prompt-reference-strip">
            <div
              v-for="(asset, index) in imagePromptReferenceImages"
              :key="asset.id"
              class="image-prompt-reference-thumb"
            >
              <img :src="asset.accessUrl" :alt="asset.fileName" />
              <span class="video-reference-token">@图片{{ index + 1 }}</span>
              <button
                class="image-prompt-reference-remove"
                type="button"
                @click.stop="removeImagePromptReference(asset.id)"
              >
                ×
              </button>
              <div class="image-prompt-reference-popover">
                <img :src="asset.accessUrl" :alt="asset.fileName" />
              </div>
            </div>
            <button
              class="image-prompt-reference-upload"
              type="button"
              :disabled="loadingProjectImageAssets"
              @click="openImageAssetPicker('IMAGE')"
            >
              +
            </button>
          </div>
        </section>

        <section class="image-spec-panel">
          <div class="video-spec-field">
            <span>图片尺寸</span>
            <div class="video-segmented-control">
              <button
                v-for="item in imageSizeOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': imageSize === item.value }"
                @click="imageSize = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <div class="video-spec-field">
            <span>图片质量</span>
            <div class="video-segmented-control">
              <button
                v-for="item in imageQualityOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': imageQuality === item.value }"
                @click="imageQuality = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <div class="video-spec-field">
            <span>图片格式</span>
            <div class="video-segmented-control">
              <button
                v-for="item in imageFormatOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': imageFormat === item.value }"
                @click="imageFormat = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </section>

        <div class="image-prompt-body">
          <section class="image-prompt-editor">
            <div class="image-prompt-section-head">
              <div>
                <strong>中文提示词</strong>
                <span>可直接修改，确认后按这里的内容提交</span>
              </div>
              <span>{{ imagePromptWordCount }} 字</span>
            </div>
            <t-loading :loading="imagePromptLoading" text="提示词加载中...">
              <div v-if="imagePromptLoadError" class="video-prompt-load-error">
                {{ imagePromptLoadError }}
              </div>
              <t-textarea
                v-else
                v-model="imagePromptText"
                class="image-prompt-textarea"
                placeholder="请输入图片生成提示词，输入 @ 可引用项目参考图"
                :disabled="imagePromptLoading"
                :autosize="{ minRows: 14, maxRows: 20 }"
                @input="handleImagePromptInput"
              />
            </t-loading>
          </section>
        </div>

        <footer class="image-prompt-footer">
          <t-button
            v-if="!imagePromptText.trim()"
            variant="outline"
            :loading="imagePromptLoading"
            :disabled="imagePromptSubmitting || Boolean(imagePromptLoadError)"
            @click="handleGenerateImagePrompt"
          >
            生成提示词
          </t-button>
          <t-button variant="outline" :disabled="imagePromptSubmitting" @click="imagePromptDialogVisible = false">
            取消
          </t-button>
          <t-button
            theme="primary"
            :loading="imagePromptSubmitting"
            :disabled="imagePromptLoading || Boolean(imagePromptLoadError)"
            @click="handleConfirmImagePrompt"
          >
            确认并提交任务
          </t-button>
        </footer>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="videoPromptDialogVisible"
      width="1120px"
      placement="center"
      :footer="false"
      :close-on-overlay-click="false"
      destroy-on-close
    >
      <template #header>
        <div class="image-prompt-dialog-title">
          <span>AI 视频任务确认</span>
          <strong>{{ videoPromptPreview?.title || '视频生成' }}</strong>
        </div>
      </template>
      <div v-if="videoPromptPreview" class="image-prompt-dialog">
        <section class="image-prompt-reference-zone">
          <div class="image-prompt-reference-strip">
            <div
              v-for="(asset, index) in videoPromptReferenceImages"
              :key="asset.id"
              class="image-prompt-reference-thumb"
            >
              <img :src="asset.accessUrl" :alt="asset.fileName" />
              <span class="video-reference-token">@图片{{ index + 1 }}</span>
              <button
                class="image-prompt-reference-remove"
                type="button"
                @click.stop="removeVideoPromptReference(asset.id)"
              >
                脳
              </button>
              <div class="image-prompt-reference-popover">
                <img :src="asset.accessUrl" :alt="asset.fileName" />
              </div>
            </div>
            <button
              class="image-prompt-reference-upload"
              type="button"
              :disabled="loadingProjectImageAssets"
              @click="openImageAssetPicker('VIDEO')"
            >
              +
            </button>
          </div>
        </section>

        <section class="video-spec-panel">
          <div class="video-spec-field duration">
            <span>视频时长</span>
            <div class="video-duration-control">
              <button type="button" :disabled="videoDurationSeconds <= 9" @click="videoDurationSeconds -= 1">-</button>
              <strong>{{ videoDurationSeconds }} 秒</strong>
              <button type="button" :disabled="videoDurationSeconds >= 12" @click="videoDurationSeconds += 1">+</button>
            </div>
          </div>
          <div class="video-spec-field">
            <span>视频质量</span>
            <div class="video-segmented-control">
              <button
                v-for="item in videoResolutionOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': videoResolution === item.value }"
                @click="videoResolution = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <div class="video-spec-field">
            <span>视频帧数</span>
            <div class="video-segmented-control">
              <button
                v-for="item in videoFpsOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': videoFps === item.value }"
                @click="videoFps = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <div class="video-spec-field ratio">
            <span>画面比例</span>
            <div class="video-segmented-control">
              <button
                v-for="item in videoRatioOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': videoRatio === item.value }"
                @click="videoRatio = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </section>

        <div class="image-prompt-body">
          <section class="image-prompt-editor">
            <div class="image-prompt-section-head">
              <div>
                <strong>视频生成提示词</strong>
                <span>确认后会按这里的内容提交给视频模型，可写音色、口型、无配乐、无音效等要求</span>
              </div>
              <span>{{ videoPromptWordCount }} 字</span>
            </div>
            <t-loading :loading="videoPromptLoading" text="提示词加载中...">
              <div v-if="videoPromptLoadError" class="video-prompt-load-error">
                {{ videoPromptLoadError }}
              </div>
              <t-textarea
                v-else
                v-model="videoPromptText"
                class="image-prompt-textarea"
                placeholder="输入视频生成提示词，输入 @ 可引用项目参考图"
                :disabled="videoPromptLoading"
                :autosize="{ minRows: 14, maxRows: 20 }"
                @input="handleVideoPromptInput"
              />
            </t-loading>
          </section>
        </div>

        <footer class="image-prompt-footer">
          <t-button
            v-if="!videoPromptText.trim()"
            variant="outline"
            :loading="videoPromptLoading"
            :disabled="videoPromptSubmitting || Boolean(videoPromptLoadError)"
            @click="handleGenerateVideoPrompt"
          >
            生成提示词
          </t-button>
          <t-button variant="outline" :disabled="videoPromptSubmitting" @click="videoPromptDialogVisible = false">
            取消
          </t-button>
          <t-button
            theme="primary"
            :loading="videoPromptSubmitting"
            :disabled="videoPromptLoading || Boolean(videoPromptLoadError)"
            @click="handleSaveVideoPrompt"
          >
            保存提示词
          </t-button>
        </footer>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="imageAssetPickerVisible"
      header="选择项目素材"
      width="880px"
      :footer="false"
      destroy-on-close
    >
      <div class="image-asset-picker">
        <t-loading :loading="loadingProjectImageAssets" text="加载项目素材中...">
          <div v-if="imageAssetCategoryTabs.length" class="image-asset-picker-categories">
            <button
              v-for="item in imageAssetCategoryTabs"
              :key="item.key"
              class="image-asset-category"
              :class="{ 'is-active': activeImageAssetCategory === item.key }"
              type="button"
              @click="activeImageAssetCategory = item.key"
            >
              {{ item.label }} {{ item.count }}
            </button>
          </div>
          <div v-if="categorizedProjectImageAssets.length" class="image-asset-picker-grid">
            <button
              v-for="asset in categorizedProjectImageAssets"
              :key="asset.id"
              class="image-asset-picker-item"
              type="button"
              @click="addProjectImageReference(asset)"
            >
              <img :src="asset.accessUrl" :alt="asset.fileName" />
            </button>
          </div>
          <t-empty v-else description="暂无可选图片素材" />
        </t-loading>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="assetPreviewVisible"
      width="980px"
      :footer="false"
      :header="previewAsset ? imageAssetTitle(previewAsset) : '素材预览'"
    >
      <div v-if="previewAsset" class="asset-preview-dialog">
        <div class="asset-preview-main">
          <div class="asset-preview-large">
            <video
              v-if="previewAsset.assetType === 'SHOT_VIDEO'"
              :src="previewAsset.accessUrl"
              controls
              autoplay
              muted
            ></video>
            <img v-else :src="previewAsset.accessUrl" :alt="previewAsset.fileName" />
          </div>
          <div class="asset-preview-brief">
            <span class="section-kicker">{{ imageAssetTitle(previewAsset) }}</span>
            <h3>{{ previewBusinessTitle }}</h3>
            <p>{{ previewBusinessDescription }}</p>
            <div v-if="previewPromptText" class="preview-prompt-box">
              <strong>{{ previewAsset.assetType === 'SHOT_VIDEO' ? '视频生成提示词' : '图片生成提示词' }}</strong>
              <span>{{ previewPromptText }}</span>
            </div>
          </div>
        </div>
        <aside class="asset-preview-meta">
          <span class="section-kicker">素材详情</span>
          <h3>{{ imageAssetTitle(previewAsset) }}</h3>
          <p>{{ previewAsset.fileName }}</p>
          <div class="meta-list">
            <span>素材ID：{{ previewAsset.id }}</span>
            <span>大类：{{ previewAsset.assetType }}</span>
            <span>小类：{{ previewAsset.assetSubType || '未标记' }}</span>
            <span>场景ID：{{ previewAsset.sceneId || '无' }}</span>
            <span>镜头ID：{{ previewAsset.shotId || '无' }}</span>
            <span>状态：{{ previewAsset.status || 'READY' }}</span>
            <span>创建时间：{{ previewAsset.createdAt }}</span>
          </div>
          <div class="preview-actions">
            <t-button variant="outline" @click="assetPreviewVisible = false">关闭</t-button>
            <t-button theme="danger" @click="confirmDeletePreviewAsset">删除素材</t-button>
          </div>
        </aside>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="videoPromptViewerVisible"
      width="920px"
      :footer="false"
      :header="
        videoPromptViewerTitle ||
        (videoPromptViewerAsset ? `镜头视频提示词 · ${imageAssetTitle(videoPromptViewerAsset)}` : '镜头视频提示词')
      "
    >
      <div class="video-prompt-viewer">
        <div class="video-prompt-viewer-head">
          <span>{{ videoPromptViewerAsset?.fileName || videoPromptViewerTitle || '未选择视频素材' }}</span>
          <strong>{{ fullVideoPromptWordCount }} 字</strong>
        </div>
        <pre>{{ fullVideoPromptText || '暂无保存的提示词' }}</pre>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  completeDramaEpisodeStep,
  deleteDramaAsset,
  generateDramaEpisodeDialogues,
  generateDramaEpisodeJianyingDraft,
  generateDramaEpisodeNovel,
  generateDramaEpisodeSceneImages,
  generateDramaEpisodeScenes,
  generateDramaEpisodeScript,
  generateDramaEpisodeShotImages,
  generateDramaEpisodeShots,
  generateDramaEpisodeShotVideos,
  generateDramaSceneImage,
  generateDramaShotImage,
  generateDramaShotVideo,
  getDramaEpisodeDetail,
  getDramaEpisodeJianyingDraft,
  getSavedDramaSceneImagePrompt,
  getSavedDramaShotImagePrompt,
  getSavedDramaShotVideoPrompt,
  listDramaSeriesImageAssets,
  previewDramaSceneImage,
  previewDramaShotImage,
  previewDramaShotVideo,
  regenerateDramaEpisodeScript,
  rollbackDramaEpisodeStep,
  saveDramaEpisodeScript,
  saveDramaShotVideoPrompt,
} from '@/api/modules/ai/drama';
import { useUserStore } from '@/store';
import type {
  DramaAsset,
  DramaEpisodeDetail,
  DramaImageGenerateParameters,
  DramaImagePromptPreview,
  DramaJianyingDraft,
  DramaScene,
  DramaShot,
  DramaTask,
  DramaVideoGenerateParameters,
  DramaVideoPromptPreview,
} from '@/types/modules/ai/drama';

interface SceneGroup {
  scene: DramaScene;
  shots: DramaShot[];
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const generatingScript = ref(false);
const generatingNovel = ref(false);
const generatingScenes = ref(false);
const generatingShots = ref(false);
const generatingDialogues = ref(false);
const generatingSceneImages = ref(false);
const generatingShotImages = ref(false);
const generatingShotVideos = ref(false);
const generatingJianyingDraft = ref(false);
const generatingSingleSceneImages = ref<Record<number, boolean>>({});
const generatingSingleShotImages = ref<Record<number, boolean>>({});
const generatingSingleShotVideos = ref<Record<number, boolean>>({});
const savingScript = ref(false);
const completingStep = ref('');
const rollbackVisible = ref(false);
const rollingBack = ref(false);
const rollbackStep = ref('');
const regenerateVisible = ref(false);
const novelRegenerateVisible = ref(false);
const novelPreviewVisible = ref(false);
const sceneRegenerateVisible = ref(false);
const shotRegenerateVisible = ref(false);
const dialogueRegenerateVisible = ref(false);
const regenerateReason = ref('');
const novelRegenerateReason = ref('');
const sceneRegenerateReason = ref('');
const shotRegenerateReason = ref('');
const dialogueRegenerateReason = ref('');
const scriptForm = ref('');
const activeStepKey = ref('novel');
const detail = ref<DramaEpisodeDetail>();
const latestJianyingDraft = ref<DramaJianyingDraft | null>(null);
const imageAutoRefreshTimer = ref<number>();
const assetPreviewVisible = ref(false);
const previewAsset = ref<DramaAsset>();
const videoPromptViewerVisible = ref(false);
const videoPromptViewerAsset = ref<DramaAsset>();
const videoPromptViewerTitle = ref('');
const videoPromptViewerText = ref('');
const imagePromptDialogVisible = ref(false);
const imagePromptSubmitting = ref(false);
const imagePromptLoading = ref(false);
const imagePromptLoadError = ref('');
const imagePromptPreview = ref<DramaImagePromptPreview>();
const imagePromptText = ref('');
const imagePromptTarget = ref<{ type: 'SCENE' | 'SHOT'; id: number }>();
const imagePromptReferences = ref<DramaAsset[]>([]);
const imagePromptReferenceInsertPending = ref(false);
const imageSize = ref('1024x1536');
const imageQuality = ref('low');
const imageFormat = ref('jpeg');
const videoPromptDialogVisible = ref(false);
const videoPromptSubmitting = ref(false);
const videoPromptLoading = ref(false);
const videoPromptLoadError = ref('');
const videoPromptPreview = ref<DramaVideoPromptPreview>();
const videoPromptText = ref('');
const videoPromptTarget = ref<{ id: number }>();
const videoPromptReferences = ref<DramaAsset[]>([]);
const videoPromptReferenceInsertPending = ref(false);
const videoDurationSeconds = ref(10);
const videoResolution = ref('720p');
const videoFps = ref(24);
const videoRatio = ref('9:16');
const imageAssetPickerVisible = ref(false);
const imageAssetPickerMode = ref<'IMAGE' | 'VIDEO'>('IMAGE');
const loadingProjectImageAssets = ref(false);
const projectImageAssets = ref<DramaAsset[]>([]);
const activeImageAssetCategory = ref('ALL');

const projectId = computed(() => Number(route.params.id));
const episodeId = computed(() => Number(route.params.episodeId));
const hasScript = computed(() => Boolean(detail.value?.episode.script?.trim()));
const hasNovelContent = computed(() => Boolean(detail.value?.episode.novelContent?.trim()));
const novelWordCount = computed(() => detail.value?.episode.novelContent?.trim().length || 0);
const novelPreviewText = computed(() => {
  const content = detail.value?.episode.novelContent?.trim() || '';
  return content.length > 520 ? `${content.slice(0, 520)}...` : content;
});
const authenticatedJianyingDraftPreviewUrl = computed(() =>
  buildAuthenticatedFileUrl(latestJianyingDraft.value?.referenceVideoUrl),
);
const episodeStatusRank = computed(() => getStepRank(detail.value?.episode.status));
const dialogueReadyCount = computed(
  () => detail.value?.shots.filter((shot) => isDialogueReady(shot.dialogue)).length || 0,
);
const hasAnyDialogues = computed(() => dialogueReadyCount.value > 0);
const hasAllDialogues = computed(() =>
  Boolean(detail.value?.shots.length && dialogueReadyCount.value === detail.value.shots.length),
);
const sceneImages = computed(() => detail.value?.assets.filter((asset) => asset.assetType === 'SCENE_IMAGE') || []);
const shotImages = computed(() => detail.value?.assets.filter((asset) => asset.assetType === 'SHOT_IMAGE') || []);
const shotVideos = computed(() => detail.value?.assets.filter((asset) => asset.assetType === 'SHOT_VIDEO') || []);
const sceneImageReadyCount = computed(
  () => sceneGroups.value.filter((group) => Boolean(findSceneImage(group.scene.id))).length,
);
const shotImageReadyCount = computed(
  () => detail.value?.shots.filter((shot) => Boolean(findShotImage(shot.id))).length || 0,
);
const shotVideoReadyCount = computed(
  () => detail.value?.shots.filter((shot) => Boolean(findShotVideo(shot.id))).length || 0,
);
const activeImageTaskCount = computed(
  () =>
    detail.value?.tasks.filter(
      (task) => task.assetType?.includes('IMAGE') && ['PENDING', 'RUNNING'].includes(task.status),
    ).length || 0,
);
const activeVideoTaskCount = computed(
  () =>
    detail.value?.tasks.filter(
      (task) => task.assetType === 'SHOT_VIDEO' && ['PENDING', 'RUNNING'].includes(task.status),
    ).length || 0,
);
const activeJianyingDraftTask = computed(() =>
  detail.value?.tasks.find(
    (task) => task.taskType === 'JIANYING_DRAFT_GENERATE' && ['PENDING', 'RUNNING'].includes(task.status),
  ),
);
const activeMediaTaskCount = computed(
  () => activeImageTaskCount.value + activeVideoTaskCount.value + (activeJianyingDraftTask.value ? 1 : 0),
);
const canCompleteImageStep = computed(
  () =>
    Boolean(sceneGroups.value.length && detail.value?.shots.length) &&
    sceneImageReadyCount.value >= sceneGroups.value.length &&
    shotImageReadyCount.value >= (detail.value?.shots.length || 0),
);
const canCompleteVideoStep = computed(
  () => Boolean(detail.value?.shots.length) && shotVideoReadyCount.value >= (detail.value?.shots.length || 0),
);
const previewScene = computed(() => {
  const sceneId = previewAsset.value?.sceneId;
  if (!sceneId) return undefined;
  return detail.value?.scenes.find((scene) => scene.id === sceneId);
});
const previewShot = computed(() => {
  const shotId = previewAsset.value?.shotId;
  if (!shotId) return undefined;
  return detail.value?.shots.find((shot) => shot.id === shotId);
});
const previewBusinessTitle = computed(() => {
  const asset = previewAsset.value;
  if (!asset) return '素材预览';
  if (asset.assetType === 'SCENE_IMAGE') {
    return previewScene.value?.name || '场景参考图';
  }
  if (asset.assetType === 'SHOT_IMAGE') {
    return buildShotTitle(previewShot.value, '镜头参考图/首帧图');
  }
  if (asset.assetType === 'SHOT_VIDEO') {
    return buildShotTitle(previewShot.value, '镜头视频');
  }
  return imageAssetTitle(asset);
});
const previewBusinessDescription = computed(() => {
  const asset = previewAsset.value;
  if (!asset) return '';
  if (asset.assetType === 'SCENE_IMAGE') {
    const scene = previewScene.value;
    if (!scene) return '用于统一本场景的地点、空间、灯光和氛围。';
    return (
      [
        scene.location ? `地点：${scene.location}` : '',
        scene.timeOfDay ? `时间：${scene.timeOfDay}` : '',
        scene.atmosphere ? `氛围：${scene.atmosphere}` : '',
        scene.plotPurpose ? `剧情目的：${scene.plotPurpose}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || '用于统一本场景的地点、空间、灯光和氛围。'
    );
  }
  if (asset.assetType === 'SHOT_IMAGE' || asset.assetType === 'SHOT_VIDEO') {
    const shot = previewShot.value;
    if (!shot)
      return asset.assetType === 'SHOT_VIDEO' ? '本素材是按镜头首帧图生成的视频片段。' : '本素材是镜头参考图/首帧图。';
    return [
      shot.shotSize ? `景别：${shot.shotSize}` : '',
      shot.durationSeconds ? `时长：${shot.durationSeconds} 秒` : '',
      shot.cameraMovement ? `运镜：${shot.cameraMovement}` : '',
      shot.continuityType ? `连续性：${continuityTypeText(shot.continuityType)}` : '',
      shot.startState ? `起始：${shot.startState}` : '',
      shot.endState ? `结束：${shot.endState}` : '',
      shot.continuityNote ? `衔接：${shot.continuityNote}` : '',
      shot.action ? `动作：${shot.action}` : '',
      shot.dialogue ? `台词：${shot.dialogue}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }
  return asset.fileName;
});
const previewPromptText = computed(() => {
  const asset = previewAsset.value;
  if (!asset) return '';
  const shot = previewShot.value;
  if (asset.assetType === 'SHOT_VIDEO') {
    return limitPreviewText(asset.prompt || shot?.videoPrompt || '', 900);
  }
  if (asset.assetType === 'SHOT_IMAGE') {
    return limitPreviewText(asset.prompt || shot?.imagePrompt || '', 900);
  }
  return limitPreviewText(asset.prompt || '', 900);
});
const fullVideoPromptText = computed(() => {
  if (videoPromptViewerText.value) return videoPromptViewerText.value;
  const asset = videoPromptViewerAsset.value;
  if (!asset) return '';
  const shot = detail.value?.shots.find((item) => item.id === asset.shotId);
  if (asset.assetType === 'SHOT_IMAGE') {
    return asset.prompt || shot?.imagePrompt || '';
  }
  if (asset.assetType === 'SHOT_VIDEO') {
    return asset.prompt || shot?.videoPrompt || '';
  }
  return asset.prompt || '';
});
const fullVideoPromptWordCount = computed(() => fullVideoPromptText.value.trim().length);
const imagePromptWordCount = computed(() => imagePromptText.value.trim().length);
const imagePromptReferenceImages = computed(() => imagePromptReferences.value);
const videoPromptWordCount = computed(() => videoPromptText.value.trim().length);
const videoPromptReferenceImages = computed(() => videoPromptReferences.value);
const imageSizeOptions = [
  { label: '竖图 1024×1536', value: '1024x1536' },
  { label: '横图 1536×1024', value: '1536x1024' },
  { label: '方图 1024×1024', value: '1024x1024' },
];
const imageQualityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
];
const imageFormatOptions = [
  { label: 'JPEG', value: 'jpeg' },
  { label: 'PNG', value: 'png' },
  { label: 'WebP', value: 'webp' },
];
const videoResolutionOptions = [
  { label: '480p', value: '480p' },
  { label: '720p', value: '720p' },
  { label: '1080p', value: '1080p' },
];
const videoFpsOptions = [
  { label: '24 fps', value: 24 },
  { label: '25 fps', value: 25 },
  { label: '30 fps', value: 30 },
];
const videoRatioOptions = [
  { label: '竖屏 9:16', value: '9:16' },
  { label: '横屏 16:9', value: '16:9' },
];
const selectableProjectImageAssets = computed(() => {
  const references = imageAssetPickerMode.value === 'VIDEO' ? videoPromptReferences.value : imagePromptReferences.value;
  const selectedIds = new Set(references.map((asset) => asset.id));
  return projectImageAssets.value.filter((asset) => !selectedIds.has(asset.id));
});
const currentSelectedImageAssets = computed(() =>
  imageAssetPickerMode.value === 'VIDEO' ? videoPromptReferences.value : imagePromptReferences.value,
);
const imageAssetCategoryTabs = computed(() => {
  const categories = [
    { key: 'ALL', label: '全部' },
    { key: 'SELECTED', label: '当前已选素材' },
    { key: 'CHARACTER', label: '角色' },
    { key: 'SCENE', label: '场景' },
    { key: 'SHOT', label: '镜头' },
    { key: 'OTHER', label: '其他' },
  ];
  return categories
    .map((category) => ({
      ...category,
      count:
        category.key === 'ALL'
          ? selectableProjectImageAssets.value.length
          : category.key === 'SELECTED'
            ? currentSelectedImageAssets.value.length
            : selectableProjectImageAssets.value.filter((asset) => imageAssetCategoryKey(asset) === category.key)
                .length,
    }))
    .filter((category) => category.key === 'ALL' || category.key === 'SELECTED' || category.count > 0);
});
const categorizedProjectImageAssets = computed(() => {
  if (activeImageAssetCategory.value === 'ALL') {
    return selectableProjectImageAssets.value;
  }
  if (activeImageAssetCategory.value === 'SELECTED') {
    return currentSelectedImageAssets.value;
  }
  return selectableProjectImageAssets.value.filter(
    (asset) => imageAssetCategoryKey(asset) === activeImageAssetCategory.value,
  );
});

const sceneGroups = computed<SceneGroup[]>(() => {
  if (!detail.value) return [];
  return detail.value.scenes.map((scene) => ({
    scene,
    shots: detail.value?.shots.filter((shot) => shot.sceneId === scene.id) || [],
  }));
});

const productionSteps = computed(() => {
  const hasOutline = Boolean(detail.value?.episode.id);
  const novelReady = isStepCompleted('NOVEL');
  const scriptReady = isStepCompleted('SCRIPT');
  const sceneReady = isStepCompleted('SCENE');
  const shotReady = isStepCompleted('SHOT');
  const dialogueReady = isStepCompleted('DIALOGUE');
  const imageReady = isStepCompleted('IMAGE');
  const videoReady = isStepCompleted('VIDEO');
  return [
    { key: 'outline', title: '分集大纲', description: '标题、摘要、钩子、悬念', done: hasOutline },
    { key: 'novel', title: '单集正文', description: '小说式详细内容', done: novelReady },
    { key: 'script', title: '单集剧本', description: '完整对白和动作', done: scriptReady },
    { key: 'scene', title: '场景拆分', description: '地点、时间、剧情目的', done: sceneReady },
    { key: 'shot', title: '镜头拆分', description: '景别、动作、提示词', done: shotReady },
    { key: 'dialogue', title: '台词生成', description: '对白、旁白、情绪', done: dialogueReady },
    { key: 'image', title: '图片生成', description: '角色、场景、镜头参考图', done: imageReady },
    { key: 'video', title: '视频生成', description: '镜头级视频任务', done: videoReady },
    { key: 'draft', title: '剪映初稿', description: '成片预览与素材包', done: Boolean(latestJianyingDraft.value) },
  ];
});

const currentProductionStep = computed(() => Math.min(episodeStatusRank.value + 1, productionSteps.value.length - 1));
const activeStepTitle = computed(
  () => productionSteps.value.find((step) => step.key === activeStepKey.value)?.title || '制作步骤',
);
const rollbackOptions = computed(() =>
  [
    { label: '分集大纲', value: 'OUTLINE', rank: 0 },
    { label: '单集正文', value: 'NOVEL', rank: 1 },
    { label: '单集剧本', value: 'SCRIPT', rank: 2 },
    { label: '场景拆分', value: 'SCENE', rank: 3 },
    { label: '镜头拆分', value: 'SHOT', rank: 4 },
    { label: '台词生成', value: 'DIALOGUE', rank: 5 },
    { label: '图片生成', value: 'IMAGE', rank: 6 },
  ].filter((item) => item.rank < episodeStatusRank.value),
);

watch(
  () => detail.value?.episode.status,
  () => {
    activeStepKey.value = productionSteps.value[currentProductionStep.value]?.key || 'novel';
  },
);

watch(videoPromptText, (value, oldValue) => {
  if (!videoPromptDialogVisible.value || imageAssetPickerVisible.value) return;
  if (value === oldValue || !value.endsWith('@')) return;
  videoPromptReferenceInsertPending.value = true;
  openImageAssetPicker('VIDEO', 'SELECTED');
});

watch(imagePromptText, (value, oldValue) => {
  if (!imagePromptDialogVisible.value || imageAssetPickerVisible.value) return;
  if (value === oldValue || !value.endsWith('@')) return;
  imagePromptReferenceInsertPending.value = true;
  openImageAssetPicker('IMAGE', 'SELECTED');
});

function isStepCompleted(step: string) {
  return episodeStatusRank.value >= getStepRank(`${step}_READY`);
}

function getStepRank(status?: string) {
  const rankMap: Record<string, number> = {
    OUTLINE_READY: 0,
    NOVEL_READY: 1,
    SCRIPT_READY: 2,
    SCENE_READY: 3,
    SHOT_READY: 4,
    DIALOGUE_READY: 5,
    IMAGE_READY: 6,
    VIDEO_READY: 7,
  };
  return rankMap[status || ''] ?? 0;
}

function isDialogueReady(dialogue?: string) {
  const text = (dialogue || '').trim();
  return Boolean(text && text !== '暂无');
}

function findSceneImage(sceneId?: number): DramaAsset | undefined {
  if (!sceneId) return undefined;
  return sceneImages.value.find((asset) => asset.sceneId === sceneId);
}

function findShotImage(shotId?: number): DramaAsset | undefined {
  if (!shotId) return undefined;
  return shotImages.value.find((asset) => asset.shotId === shotId);
}

function findShotVideo(shotId?: number): DramaAsset | undefined {
  if (!shotId) return undefined;
  return shotVideos.value.find((asset) => asset.shotId === shotId);
}

function findSceneImageTask(sceneId?: number): DramaTask | undefined {
  if (!sceneId) return undefined;
  return detail.value?.tasks.find(
    (task) =>
      task.targetType === 'SCENE' &&
      task.targetId === sceneId &&
      task.assetType === 'SCENE_IMAGE' &&
      ['PENDING', 'RUNNING'].includes(task.status),
  );
}

function findShotImageTask(shotId?: number): DramaTask | undefined {
  if (!shotId) return undefined;
  return detail.value?.tasks.find(
    (task) =>
      task.targetType === 'SHOT' &&
      task.targetId === shotId &&
      task.assetType === 'SHOT_IMAGE' &&
      ['PENDING', 'RUNNING'].includes(task.status),
  );
}

function findShotVideoTask(shotId?: number): DramaTask | undefined {
  if (!shotId) return undefined;
  return detail.value?.tasks.find(
    (task) =>
      task.targetType === 'SHOT' &&
      task.targetId === shotId &&
      task.assetType === 'SHOT_VIDEO' &&
      ['PENDING', 'RUNNING'].includes(task.status),
  );
}

function isSceneImageGenerating(sceneId?: number) {
  return Boolean(findSceneImageTask(sceneId));
}

function isShotImageGenerating(shotId?: number) {
  return Boolean(findShotImageTask(shotId));
}

function isShotVideoGenerating(shotId?: number) {
  return Boolean(findShotVideoTask(shotId));
}

function openAssetPreview(asset?: DramaAsset) {
  if (!asset) return;
  previewAsset.value = asset;
  assetPreviewVisible.value = true;
}

function openVideoPromptViewer(asset?: DramaAsset) {
  if (!asset) return;
  videoPromptViewerAsset.value = asset;
  videoPromptViewerText.value = '';
  videoPromptViewerTitle.value = '';
  videoPromptViewerVisible.value = true;
}

function openImagePromptViewer(asset?: DramaAsset, title = '图片生成提示词') {
  if (!asset) return;
  videoPromptViewerAsset.value = asset;
  videoPromptViewerText.value = '';
  videoPromptViewerTitle.value = `${title} · ${imageAssetTitle(asset)}`;
  videoPromptViewerVisible.value = true;
}

function openShotVideoPromptViewer(shot: DramaShot) {
  videoPromptViewerAsset.value = undefined;
  videoPromptViewerText.value = shot.videoPrompt || '';
  videoPromptViewerTitle.value = `镜头 ${shot.shotNo} · 生成中提示词`;
  videoPromptViewerVisible.value = true;
}

function confirmDeletePreviewAsset() {
  if (!previewAsset.value) return;
  confirmDeleteAsset(previewAsset.value);
}

function confirmDeleteAsset(asset?: DramaAsset) {
  if (!asset) return;
  const dialog = DialogPlugin.confirm({
    header: '确认删除素材',
    body: `确定删除「${imageAssetTitle(asset)}」吗？文件会移动到 D:\\AI视频\\回收站，页面和数据库中将不再引用。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      try {
        await deleteDramaAsset(asset.id);
        await loadDetail(true);
        if (previewAsset.value?.id === asset.id) {
          assetPreviewVisible.value = false;
          previewAsset.value = undefined;
        }
        MessagePlugin.success('素材已删除，并已移动到回收站');
        dialog.hide();
      } catch (error: any) {
        MessagePlugin.error(error?.message || '素材删除失败');
      }
    },
  });
}

function imageAssetTitle(asset?: DramaAsset) {
  if (!asset) return '素材';
  const subTypeMap: Record<string, string> = {
    SCENE_REFERENCE: '场景参考图',
    SHOT_REFERENCE: '镜头参考图/首帧图',
    VIDEO_CLIP: '镜头视频',
    PORTRAIT: '角色定妆图',
    AVATAR: '角色头像',
    THREE_VIEW: '角色三视图',
    EXPRESSION: '表情参考图',
    COSTUME: '服装版本图',
  };
  if (asset.assetSubType && subTypeMap[asset.assetSubType]) {
    return subTypeMap[asset.assetSubType];
  }
  if (asset.assetType === 'SCENE_IMAGE') return '场景参考图';
  if (asset.assetType === 'SHOT_IMAGE') return '镜头参考图/首帧图';
  if (asset.assetType === 'SHOT_VIDEO') return '镜头视频';
  return asset.assetType || '素材';
}

function imageAssetCategoryKey(asset: DramaAsset) {
  if (asset.assetType === 'CHARACTER_IMAGE' || asset.characterId) return 'CHARACTER';
  if (asset.assetType === 'SCENE_IMAGE' || asset.sceneId) return 'SCENE';
  if (asset.assetType === 'SHOT_IMAGE' || asset.shotId) return 'SHOT';
  return 'OTHER';
}

function buildShotTitle(shot?: { shotNo?: number; shotSize?: string }, fallback = '镜头素材') {
  if (!shot) return fallback;
  return `镜头 ${shot.shotNo || '-'}${shot.shotSize ? ` · ${shot.shotSize}` : ''}`;
}

function continuityTypeText(type?: string) {
  const map: Record<string, string> = {
    CONTINUOUS: '连续动作',
    SAME_SCENE: '同场景切换',
    CUT: '普通切换',
    TRANSITION: '转场/新场景',
  };
  return map[type || ''] || '普通切换';
}

function limitPreviewText(value: string, maxLength: number) {
  const text = (value || '').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function formatReadonlyParameter(value: unknown) {
  if (value === null || value === undefined || value === '') return '未设置';
  if (Array.isArray(value)) {
    return value.length ? value.join('、') : '无';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function _buildChineseParameterEntries(parameters: Record<string, unknown>) {
  const labelMap: Record<string, string> = {
    provider: '供应商',
    endpoint: '接口',
    model: '模型',
    prompt: '提示词来源',
    n: '数量',
    size: '尺寸',
    quality: '质量',
    output_format: '格式',
    output_compression: '压缩',
    background: '背景',
    moderation: '审核',
    stream: '流式',
    partial_images: '过程图',
    reference_asset_ids: '参考图ID',
    reference_image_count: '参考图数',
    save_content_type: '保存类型',
  };
  const order = [
    'provider',
    'endpoint',
    'model',
    'size',
    'quality',
    'output_format',
    'output_compression',
    'reference_image_count',
    'reference_asset_ids',
    'background',
    'moderation',
    'stream',
    'partial_images',
    'save_content_type',
    'n',
    'prompt',
  ];
  return order
    .filter((key) => Object.prototype.hasOwnProperty.call(parameters, key))
    .map((key) => ({
      label: labelMap[key] || key,
      value:
        key === 'reference_image_count'
          ? String(imagePromptReferences.value.length)
          : key === 'reference_asset_ids'
            ? formatReadonlyParameter(imagePromptReferences.value.map((asset) => asset.id))
            : formatReadonlyParameter(parameters[key]),
    }));
}

function imageTaskStageText(task?: DramaTask) {
  const stageMap: Record<string, string> = {
    QUEUED: '排队中',
    PROMPTING: '提示词生成中',
    GENERATING: 'AI 生图中',
    DOWNLOADING: '下载图片中',
    SAVING: '保存素材中',
    RETRYING: '等待重试',
  };
  return stageMap[task?.stage || ''] || '生成中';
}

function videoTaskStageText(task?: DramaTask) {
  const stageMap: Record<string, string> = {
    QUEUED: '排队中',
    PROMPTING: '组装视频提示词',
    SUBMITTING: '提交视频任务',
    GENERATING: 'AI 生视频中',
    DOWNLOADING: '下载视频中',
    SAVING: '保存素材中',
    DONE: '已完成',
    FAILED: '生成失败',
  };
  return stageMap[task?.stage || ''] || '生成中';
}

async function loadDetail(silent = false) {
  if (!silent) {
    loading.value = true;
  }
  try {
    detail.value = await getDramaEpisodeDetail(episodeId.value);
    latestJianyingDraft.value = await getDramaEpisodeJianyingDraft(episodeId.value);
    scriptForm.value = detail.value.episode.script || '';
  } finally {
    if (!silent) {
      loading.value = false;
    }
  }
}

function startImageAutoRefresh() {
  if (imageAutoRefreshTimer.value) return;
  imageAutoRefreshTimer.value = window.setInterval(async () => {
    await loadDetail(true);
    if (activeMediaTaskCount.value <= 0) {
      stopImageAutoRefresh();
      await loadDetail(true);
    }
  }, 3000);
}

function stopImageAutoRefresh() {
  if (!imageAutoRefreshTimer.value) return;
  window.clearInterval(imageAutoRefreshTimer.value);
  imageAutoRefreshTimer.value = undefined;
}

async function handleGenerateScript() {
  generatingScript.value = true;
  try {
    await generateDramaEpisodeScript(episodeId.value);
    MessagePlugin.success('单集剧本已生成');
    await loadDetail();
  } finally {
    generatingScript.value = false;
  }
}

async function handleGenerateNovel() {
  if (hasNovelContent.value) {
    openNovelRegenerateDialog();
    return;
  }
  generatingNovel.value = true;
  try {
    detail.value = await generateDramaEpisodeNovel(episodeId.value);
    scriptForm.value = detail.value.episode.script || '';
    MessagePlugin.success('本集小说正文已生成');
  } finally {
    generatingNovel.value = false;
  }
}

function openNovelPreview() {
  novelPreviewVisible.value = true;
}

function openNovelRegenerateDialog() {
  novelRegenerateReason.value = '';
  novelRegenerateVisible.value = true;
}

async function handleConfirmRegenerateNovel() {
  if (!novelRegenerateReason.value.trim()) {
    MessagePlugin.warning('请填写重新生成正文的原因');
    return;
  }
  generatingNovel.value = true;
  try {
    detail.value = await generateDramaEpisodeNovel(episodeId.value, novelRegenerateReason.value.trim());
    scriptForm.value = detail.value.episode.script || '';
    novelRegenerateVisible.value = false;
    MessagePlugin.success('本集小说正文已重新生成');
  } finally {
    generatingNovel.value = false;
  }
}

function openRegenerateDialog() {
  regenerateReason.value = '';
  regenerateVisible.value = true;
}

async function handleConfirmRegenerateScript() {
  if (!regenerateReason.value.trim()) {
    MessagePlugin.warning('请填写重新生成原因');
    return;
  }
  generatingScript.value = true;
  try {
    await regenerateDramaEpisodeScript(episodeId.value, regenerateReason.value.trim());
    MessagePlugin.success('单集剧本已重新生成');
    regenerateVisible.value = false;
    await loadDetail();
  } finally {
    generatingScript.value = false;
  }
}

async function handleSaveScript() {
  if (!scriptForm.value.trim()) {
    MessagePlugin.warning('请先填写单集剧本');
    return;
  }
  savingScript.value = true;
  try {
    detail.value = await saveDramaEpisodeScript(episodeId.value, { script: scriptForm.value.trim() });
    scriptForm.value = detail.value.episode.script || '';
    MessagePlugin.success('单集剧本已保存');
  } finally {
    savingScript.value = false;
  }
}

async function handleGenerateScenes() {
  if (detail.value?.scenes.length) {
    MessagePlugin.warning('场景数据已存在，请删除后再生成');
    return;
  }
  generatingScenes.value = true;
  try {
    await generateDramaEpisodeScenes(episodeId.value);
    MessagePlugin.success('场景拆分已生成');
    await loadDetail();
  } finally {
    generatingScenes.value = false;
  }
}

function openSceneRegenerateDialog() {
  sceneRegenerateReason.value = '';
  sceneRegenerateVisible.value = true;
}

async function handleConfirmRegenerateScenes() {
  if (!sceneRegenerateReason.value.trim()) {
    MessagePlugin.warning('请填写重新拆分场景的原因');
    return;
  }
  generatingScenes.value = true;
  try {
    await generateDramaEpisodeScenes(episodeId.value, sceneRegenerateReason.value.trim());
    sceneRegenerateVisible.value = false;
    MessagePlugin.success('场景已重新拆分');
    await loadDetail();
  } finally {
    generatingScenes.value = false;
  }
}

async function handleGenerateShots() {
  if (detail.value?.shots.length) {
    MessagePlugin.warning('镜头数据已存在，请删除后再生成');
    return;
  }
  generatingShots.value = true;
  try {
    await generateDramaEpisodeShots(episodeId.value);
    MessagePlugin.success('镜头拆分已生成');
    await loadDetail();
  } finally {
    generatingShots.value = false;
  }
}

function openShotRegenerateDialog() {
  shotRegenerateReason.value = '';
  shotRegenerateVisible.value = true;
}

async function handleConfirmRegenerateShots() {
  if (!shotRegenerateReason.value.trim()) {
    MessagePlugin.warning('请填写重新拆分镜头的原因');
    return;
  }
  generatingShots.value = true;
  try {
    await generateDramaEpisodeShots(episodeId.value, shotRegenerateReason.value.trim());
    shotRegenerateVisible.value = false;
    MessagePlugin.success('镜头已重新拆分');
    await loadDetail();
  } finally {
    generatingShots.value = false;
  }
}

async function handleGenerateDialogues() {
  if (hasAnyDialogues.value) {
    MessagePlugin.warning('台词数据已存在，请填写原因后重新生成');
    return;
  }
  generatingDialogues.value = true;
  try {
    await generateDramaEpisodeDialogues(episodeId.value);
    MessagePlugin.success('镜头台词已生成');
    await loadDetail();
  } finally {
    generatingDialogues.value = false;
  }
}

function openDialogueRegenerateDialog() {
  dialogueRegenerateReason.value = '';
  dialogueRegenerateVisible.value = true;
}

async function handleConfirmRegenerateDialogues() {
  if (!dialogueRegenerateReason.value.trim()) {
    MessagePlugin.warning('请填写重新生成台词的原因');
    return;
  }
  generatingDialogues.value = true;
  try {
    await generateDramaEpisodeDialogues(episodeId.value, dialogueRegenerateReason.value.trim());
    dialogueRegenerateVisible.value = false;
    MessagePlugin.success('镜头台词已重新生成');
    await loadDetail();
  } finally {
    generatingDialogues.value = false;
  }
}

async function handleGenerateSceneImages() {
  if (!sceneGroups.value.length) {
    MessagePlugin.warning('暂无场景，请先完成场景拆分');
    return;
  }
  if (sceneImageReadyCount.value >= sceneGroups.value.length) {
    MessagePlugin.warning('场景参考图已全部存在，无需重复生成');
    return;
  }
  generatingSceneImages.value = true;
  try {
    const tasks = await generateDramaEpisodeSceneImages(episodeId.value);
    MessagePlugin.success(`已提交 ${tasks.length} 个场景参考图任务`);
    await loadDetail();
    startImageAutoRefresh();
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '场景参考图任务提交失败'));
  } finally {
    generatingSceneImages.value = false;
  }
}

async function handleGenerateShotImages() {
  if (!detail.value?.shots.length) {
    MessagePlugin.warning('暂无镜头，请先完成镜头拆分');
    return;
  }
  if (shotImageReadyCount.value >= (detail.value?.shots.length || 0)) {
    MessagePlugin.warning('镜头参考图已全部存在，无需重复生成');
    return;
  }
  generatingShotImages.value = true;
  try {
    const tasks = await generateDramaEpisodeShotImages(episodeId.value);
    MessagePlugin.success(`已提交 ${tasks.length} 个镜头参考图任务`);
    await loadDetail();
    startImageAutoRefresh();
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '镜头参考图任务提交失败'));
  } finally {
    generatingShotImages.value = false;
  }
}

async function handleGenerateSingleSceneImage(sceneId: number) {
  if (!sceneId) return;
  if (findSceneImage(sceneId)) {
    MessagePlugin.warning('场景参考图已存在，请删除后再生成');
    return;
  }
  if (isSceneImageGenerating(sceneId)) {
    MessagePlugin.warning('该场景参考图正在生成中');
    return;
  }
  generatingSingleSceneImages.value = { ...generatingSingleSceneImages.value, [sceneId]: true };
  openImagePromptLoadingDialog('SCENE', sceneId);
  try {
    const preview = await getSavedDramaSceneImagePrompt(sceneId);
    openImagePromptDialog('SCENE', sceneId, preview);
  } catch (error) {
    imagePromptLoadError.value = getErrorMessage(error, '场景参考图提示词读取失败');
    MessagePlugin.error(imagePromptLoadError.value);
  } finally {
    imagePromptLoading.value = false;
    generatingSingleSceneImages.value = { ...generatingSingleSceneImages.value, [sceneId]: false };
  }
}

async function handleGenerateSingleShotImage(shotId: number) {
  if (!shotId) return;
  if (findShotImage(shotId)) {
    MessagePlugin.warning('镜头参考图已存在，请删除后再生成');
    return;
  }
  if (isShotImageGenerating(shotId)) {
    MessagePlugin.warning('该镜头参考图正在生成中');
    return;
  }
  generatingSingleShotImages.value = { ...generatingSingleShotImages.value, [shotId]: true };
  openImagePromptLoadingDialog('SHOT', shotId);
  try {
    const preview = await getSavedDramaShotImagePrompt(shotId);
    openImagePromptDialog('SHOT', shotId, preview);
  } catch (error) {
    imagePromptLoadError.value = getErrorMessage(error, '镜头参考图提示词读取失败');
    MessagePlugin.error(imagePromptLoadError.value);
  } finally {
    imagePromptLoading.value = false;
    generatingSingleShotImages.value = { ...generatingSingleShotImages.value, [shotId]: false };
  }
}

function openImagePromptLoadingDialog(type: 'SCENE' | 'SHOT', id: number) {
  const shot = detail.value?.shots.find((item) => item.id === id);
  const scene = detail.value?.scenes.find((item) => item.id === id);
  imagePromptTarget.value = { type, id };
  imagePromptPreview.value = {
    targetType: type,
    targetId: id,
    assetType: type === 'SCENE' ? 'SCENE_IMAGE' : 'SHOT_IMAGE',
    assetSubType: type === 'SCENE' ? 'SCENE_REFERENCE' : 'SHOT_REFERENCE',
    title: type === 'SCENE' ? `场景参考图 · ${scene?.name || '未命名场景'}` : `镜头 ${shot?.shotNo || ''} · 首帧参考图`,
    prompt: '',
    parameters: {
      size: imageSize.value,
      quality: imageQuality.value,
      format: imageFormat.value,
    },
    referenceImages: [],
  };
  imagePromptText.value = '';
  imagePromptReferences.value = [];
  imagePromptReferenceInsertPending.value = false;
  imagePromptLoading.value = true;
  imagePromptLoadError.value = '';
  imagePromptDialogVisible.value = true;
}

function openImagePromptDialog(type: 'SCENE' | 'SHOT', id: number, preview: DramaImagePromptPreview) {
  imagePromptTarget.value = { type, id };
  imagePromptPreview.value = preview;
  imagePromptText.value = preview.prompt || '';
  imagePromptReferences.value = [...(preview.referenceImages || [])];
  imagePromptReferenceInsertPending.value = false;
  imagePromptLoading.value = false;
  imagePromptLoadError.value = '';
  imageSize.value = normalizeImageSize(preview.parameters?.size);
  imageQuality.value = normalizeImageQuality(preview.parameters?.quality);
  imageFormat.value = normalizeImageFormat(preview.parameters?.format ?? preview.parameters?.output_format);
  imagePromptDialogVisible.value = true;
}

async function handleEditSceneImagePrompt(sceneId: number) {
  await handleGenerateSingleSceneImage(sceneId);
}

async function handleEditShotImagePrompt(shotId: number) {
  await handleGenerateSingleShotImage(shotId);
}

async function handleConfirmImagePrompt() {
  const target = imagePromptTarget.value;
  if (!target || !imagePromptPreview.value) return;
  const prompt = imagePromptText.value.trim();
  if (!prompt) {
    MessagePlugin.warning('请先填写图片生成提示词');
    return;
  }
  imagePromptSubmitting.value = true;
  try {
    const referenceAssetIds = imagePromptReferences.value.map((asset) => asset.id);
    if (target.type === 'SCENE') {
      await generateDramaSceneImage(target.id, prompt, referenceAssetIds, imagePromptParameters());
      MessagePlugin.success('已提交场景参考图任务');
    } else {
      await generateDramaShotImage(target.id, prompt, referenceAssetIds, imagePromptParameters());
      MessagePlugin.success('已提交镜头参考图任务');
    }
    imagePromptDialogVisible.value = false;
    imagePromptPreview.value = undefined;
    imagePromptTarget.value = undefined;
    imagePromptReferences.value = [];
    await loadDetail(true);
    startImageAutoRefresh();
  } catch (error) {
    MessagePlugin.error(
      getErrorMessage(error, target.type === 'SCENE' ? '场景参考图任务提交失败' : '镜头参考图任务提交失败'),
    );
  } finally {
    imagePromptSubmitting.value = false;
  }
}

function imagePromptParameters(): DramaImageGenerateParameters {
  return {
    imageSize: imageSize.value,
    imageQuality: imageQuality.value,
    imageFormat: imageFormat.value,
  };
}

function handleImagePromptInput(value: string) {
  const text = String(value ?? imagePromptText.value);
  if (!text.endsWith('@')) return;
  imagePromptReferenceInsertPending.value = true;
  openImageAssetPicker('IMAGE', 'SELECTED');
}

async function handleGenerateImagePrompt() {
  const target = imagePromptTarget.value;
  if (!target || !imagePromptPreview.value) return;
  const referenceCount = imagePromptReferences.value.length;
  const sizeLabel = imageSizeOptions.find((item) => item.value === imageSize.value)?.label || imageSize.value;
  const qualityLabel =
    imageQualityOptions.find((item) => item.value === imageQuality.value)?.label || imageQuality.value;
  const formatLabel = imageFormatOptions.find((item) => item.value === imageFormat.value)?.label || imageFormat.value;
  const dialog = DialogPlugin.confirm({
    header: '生成图片提示词',
    body: `请确认当前参考图 ${referenceCount} 张，图片尺寸 ${sizeLabel}，质量 ${qualityLabel}，格式 ${formatLabel}。如果参考素材或参数有问题，请先调整；确认后将调用大模型生成中文提示词。`,
    confirmBtn: '确认生成',
    cancelBtn: '取消',
    onConfirm: async () => {
      dialog.hide();
      imagePromptLoading.value = true;
      imagePromptLoadError.value = '';
      try {
        const referenceAssetIds = imagePromptReferences.value.map((asset) => asset.id);
        const preview =
          target.type === 'SCENE'
            ? await previewDramaSceneImage(target.id, referenceAssetIds, imagePromptParameters())
            : await previewDramaShotImage(target.id, referenceAssetIds, imagePromptParameters());
        openImagePromptDialog(target.type, target.id, preview);
      } catch (error) {
        imagePromptLoadError.value = getErrorMessage(error, '图片提示词生成失败');
        MessagePlugin.error(imagePromptLoadError.value);
      } finally {
        imagePromptLoading.value = false;
      }
    },
  });
}

async function openImageAssetPicker(mode: 'IMAGE' | 'VIDEO' = 'IMAGE', category = 'ALL') {
  imageAssetPickerMode.value = mode;
  activeImageAssetCategory.value = category;
  imageAssetPickerVisible.value = true;
  if (projectImageAssets.value.length) return;
  loadingProjectImageAssets.value = true;
  try {
    projectImageAssets.value = await listDramaSeriesImageAssets(projectId.value);
    activeImageAssetCategory.value = category;
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '项目素材加载失败'));
  } finally {
    loadingProjectImageAssets.value = false;
  }
}

function addProjectImageReference(asset: DramaAsset) {
  if (imageAssetPickerMode.value === 'VIDEO') {
    addProjectVideoReference(asset);
    return;
  }
  let nextReferences = imagePromptReferences.value;
  if (imagePromptReferences.value.some((item) => item.id === asset.id)) {
    MessagePlugin.warning('该素材已在参考图中');
  } else {
    nextReferences = [...imagePromptReferences.value, asset];
    imagePromptReferences.value = nextReferences;
  }
  if (imagePromptReferenceInsertPending.value) {
    insertImageReferenceToken(asset, nextReferences);
    imagePromptReferenceInsertPending.value = false;
  }
  imageAssetPickerVisible.value = false;
}

function removeImagePromptReference(assetId: number) {
  imagePromptReferences.value = imagePromptReferences.value.filter((asset) => asset.id !== assetId);
}

function insertImageReferenceToken(asset: DramaAsset, references = imagePromptReferences.value) {
  const index = Math.max(
    0,
    references.findIndex((item) => item.id === asset.id),
  );
  const token = `@图片${index + 1}`;
  const text = imagePromptText.value;
  const atIndex = text.lastIndexOf('@');
  if (atIndex >= 0) {
    imagePromptText.value = `${text.slice(0, atIndex)}${token} ${text.slice(atIndex + 1)}`;
    return;
  }
  imagePromptText.value = `${text.trimEnd()} ${token} `.trimStart();
}

function openVideoPromptDialog(id: number, preview: DramaVideoPromptPreview) {
  videoPromptTarget.value = { id };
  videoPromptPreview.value = preview;
  videoPromptText.value = preview.prompt || '';
  videoPromptReferences.value = [...(preview.referenceImages || [])];
  videoPromptReferenceInsertPending.value = false;
  videoPromptLoading.value = false;
  videoPromptLoadError.value = '';
  videoDurationSeconds.value = normalizeVideoDuration(preview.parameters?.durationSeconds);
  videoResolution.value = normalizeVideoResolution(preview.parameters?.resolution);
  videoFps.value = normalizeVideoFps(preview.parameters?.fps);
  videoRatio.value = normalizeVideoRatio(preview.parameters?.ratio);
  videoPromptDialogVisible.value = true;
}

function openVideoPromptLoadingDialog(id: number) {
  const shot = detail.value?.shots.find((item) => item.id === id);
  const referenceImage = findShotImage(id);
  videoPromptTarget.value = { id };
  videoPromptPreview.value = {
    targetType: 'SHOT',
    targetId: id,
    assetType: 'SHOT_VIDEO',
    assetSubType: 'VIDEO_CLIP',
    title: `镜头 ${shot?.shotNo || ''} · 视频生成`,
    prompt: '',
    parameters: {
      durationSeconds: normalizeVideoDuration(shot?.durationSeconds),
      resolution: videoResolution.value,
      fps: videoFps.value,
      ratio: videoRatio.value,
    },
    referenceImages: referenceImage ? [referenceImage] : [],
  };
  videoPromptText.value = '';
  videoPromptReferences.value = referenceImage ? [referenceImage] : [];
  videoPromptReferenceInsertPending.value = false;
  videoPromptLoadError.value = '';
  videoPromptLoading.value = true;
  videoDurationSeconds.value = normalizeVideoDuration(shot?.durationSeconds);
  videoResolution.value = normalizeVideoResolution(videoResolution.value);
  videoFps.value = normalizeVideoFps(videoFps.value);
  videoRatio.value = normalizeVideoRatio(videoRatio.value);
  videoPromptDialogVisible.value = true;
}

function videoPromptParameters(): DramaVideoGenerateParameters {
  return {
    durationSeconds: videoDurationSeconds.value,
    resolution: videoResolution.value,
    fps: videoFps.value,
    ratio: videoRatio.value,
  };
}

function handleVideoPromptInput(value: string) {
  const text = String(value ?? videoPromptText.value);
  if (!text.endsWith('@')) return;
  videoPromptReferenceInsertPending.value = true;
  openImageAssetPicker('VIDEO', 'SELECTED');
}

async function handleGenerateVideoPrompt() {
  const target = videoPromptTarget.value;
  if (!target || !videoPromptPreview.value) return;
  const referenceCount = videoPromptReferences.value.length;
  const dialog = DialogPlugin.confirm({
    header: '生成视频提示词',
    body: `请确认当前参考图 ${referenceCount} 张，视频时长 ${videoDurationSeconds.value} 秒，质量 ${videoResolution.value}，帧数 ${videoFps.value}fps，画面比例 ${videoRatio.value}。确认后将调用多模态模型生成提示词。`,
    confirmBtn: '确认生成',
    cancelBtn: '取消',
    onConfirm: async () => {
      dialog.hide();
      videoPromptLoading.value = true;
      videoPromptLoadError.value = '';
      try {
        const referenceAssetIds = videoPromptReferences.value.map((asset) => asset.id);
        const preview = await previewDramaShotVideo(target.id, referenceAssetIds, videoPromptParameters());
        openVideoPromptDialog(target.id, preview);
      } catch (error) {
        videoPromptLoadError.value = getErrorMessage(error, '视频提示词生成失败');
        MessagePlugin.error(videoPromptLoadError.value);
      } finally {
        videoPromptLoading.value = false;
      }
    },
  });
}

async function handleSaveVideoPrompt() {
  const target = videoPromptTarget.value;
  if (!target || !videoPromptPreview.value) return;
  const prompt = withVideoDurationLock(videoPromptText.value.trim(), videoDurationSeconds.value);
  if (!prompt) {
    MessagePlugin.warning('请先填写视频生成提示词');
    return;
  }
  videoPromptSubmitting.value = true;
  try {
    const referenceAssetIds = videoPromptReferences.value.map((asset) => asset.id);
    await saveDramaShotVideoPrompt(target.id, prompt, referenceAssetIds, videoPromptParameters());
    MessagePlugin.success('已保存视频提示词');
    videoPromptDialogVisible.value = false;
    videoPromptPreview.value = undefined;
    videoPromptTarget.value = undefined;
    videoPromptReferences.value = [];
    await loadDetail(true);
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '视频提示词保存失败'));
  } finally {
    videoPromptSubmitting.value = false;
  }
}

function addProjectVideoReference(asset: DramaAsset) {
  let nextReferences = videoPromptReferences.value;
  if (!nextReferences.some((item) => item.id === asset.id)) {
    nextReferences = [...nextReferences, asset];
    videoPromptReferences.value = nextReferences;
  }
  if (videoPromptReferenceInsertPending.value) {
    insertVideoReferenceToken(asset, nextReferences);
    videoPromptReferenceInsertPending.value = false;
  }
  imageAssetPickerVisible.value = false;
}

function removeVideoPromptReference(assetId: number) {
  videoPromptReferences.value = videoPromptReferences.value.filter((asset) => asset.id !== assetId);
}

function insertVideoReferenceToken(asset: DramaAsset, references = videoPromptReferences.value) {
  const index = Math.max(
    0,
    references.findIndex((item) => item.id === asset.id),
  );
  const token = `@图片${index + 1}`;
  const text = videoPromptText.value;
  const atIndex = text.lastIndexOf('@');
  if (atIndex >= 0) {
    videoPromptText.value = `${text.slice(0, atIndex)}${token} ${text.slice(atIndex + 1)}`;
    return;
  }
  videoPromptText.value = `${text.trimEnd()} ${token} `.trimStart();
}

function normalizeVideoDuration(value: unknown) {
  const duration = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(duration) || duration <= 0) return 10;
  return Math.max(9, Math.min(Math.round(duration), 12));
}

function withVideoDurationLock(prompt: string, durationSeconds: number) {
  const seconds = normalizeVideoDuration(durationSeconds);
  const cleaned = prompt.replace(/\n*【视频时长硬性要求】[\s\S]*$/u, '').trim();
  if (!cleaned) return '';
  return `${cleaned}

【视频时长硬性要求】
总时长必须严格为 ${seconds} 秒；所有逐时间段镜头调度必须从 0.0 秒连续覆盖到 ${seconds}.0 秒。若上文存在任何 5 秒、9 秒或其他不等于 ${seconds} 秒的旧时间段，提交生成时必须全部改写为 ${seconds} 秒版本。`;
}

function normalizeVideoResolution(value: unknown) {
  const resolution = String(value || '').trim();
  return videoResolutionOptions.some((item) => item.value === resolution) ? resolution : '720p';
}

function normalizeVideoFps(value: unknown) {
  const fps = typeof value === 'number' ? value : Number(value);
  return videoFpsOptions.some((item) => item.value === fps) ? fps : 24;
}

function normalizeVideoRatio(value: unknown) {
  const ratio = String(value || '').trim();
  return videoRatioOptions.some((item) => item.value === ratio) ? ratio : '9:16';
}

function normalizeImageSize(value: unknown) {
  const size = String(value || '').trim();
  return imageSizeOptions.some((item) => item.value === size) ? size : '1024x1536';
}

function normalizeImageQuality(value: unknown) {
  const quality = String(value || '')
    .trim()
    .toLowerCase();
  return imageQualityOptions.some((item) => item.value === quality) ? quality : 'low';
}

function normalizeImageFormat(value: unknown) {
  const format = String(value || '')
    .trim()
    .toLowerCase();
  return imageFormatOptions.some((item) => item.value === format) ? format : 'jpeg';
}

async function handleGenerateShotVideos() {
  if (!detail.value?.shots.length) {
    MessagePlugin.warning('暂无镜头，请先完成镜头拆分');
    return;
  }
  if (shotVideoReadyCount.value >= (detail.value?.shots.length || 0)) {
    MessagePlugin.warning('镜头视频已全部存在，无需重复生成');
    return;
  }
  generatingShotVideos.value = true;
  try {
    const tasks = await generateDramaEpisodeShotVideos(episodeId.value);
    MessagePlugin.success(`已提交 ${tasks.length} 个镜头视频任务`);
    await loadDetail(true);
    startImageAutoRefresh();
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '镜头视频任务提交失败'));
  } finally {
    generatingShotVideos.value = false;
  }
}

async function handleGenerateJianyingDraft() {
  if (!isStepCompleted('VIDEO')) {
    MessagePlugin.warning('请先完成视频步骤');
    return;
  }
  if (activeJianyingDraftTask.value) {
    MessagePlugin.warning('剪映初稿正在生成中');
    return;
  }
  generatingJianyingDraft.value = true;
  try {
    await generateDramaEpisodeJianyingDraft(episodeId.value);
    MessagePlugin.success('已提交剪映初稿生成任务');
    activeStepKey.value = 'draft';
    await loadDetail(true);
    startImageAutoRefresh();
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '剪映初稿任务提交失败'));
  } finally {
    generatingJianyingDraft.value = false;
  }
}

function buildAuthenticatedFileUrl(url?: string | null) {
  if (!url) return '';
  const token = userStore.token;
  if (!token) return url;
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}token=${encodeURIComponent(token)}`;
}

function downloadJianyingPackage() {
  const packageId = latestJianyingDraft.value?.id;
  if (!packageId) return;
  const url = buildAuthenticatedFileUrl(latestJianyingDraft.value?.packageDownloadUrl);
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function handleGenerateSingleShotVideo(shotId: number) {
  if (!shotId) return;
  const shot = detail.value?.shots.find((item) => item.id === shotId);
  if (!findShotImage(shotId)) {
    MessagePlugin.warning('请先生成该镜头的首帧图');
    return;
  }
  if (findShotVideo(shotId)) {
    MessagePlugin.warning('镜头视频已存在，请删除后再生成');
    return;
  }
  if (isShotVideoGenerating(shotId)) {
    MessagePlugin.warning('该镜头视频正在生成中');
    return;
  }
  const prompt = shot?.videoPrompt?.trim();
  if (!prompt) {
    MessagePlugin.warning('请先点击“编辑提示词”，保存视频提示词后再生成视频');
    return;
  }
  const durationSeconds = normalizeVideoDuration(shot?.durationSeconds);
  generatingSingleShotVideos.value = { ...generatingSingleShotVideos.value, [shotId]: true };
  try {
    const referenceAssetId = findShotImage(shotId)?.id;
    await generateDramaShotVideo(
      shotId,
      withVideoDurationLock(prompt, durationSeconds),
      referenceAssetId ? [referenceAssetId] : undefined,
      {
        durationSeconds,
        resolution: videoResolution.value,
        fps: videoFps.value,
        ratio: videoRatio.value,
      },
    );
    MessagePlugin.success('已提交镜头视频任务');
    await loadDetail(true);
    startImageAutoRefresh();
  } catch (error) {
    MessagePlugin.error(getErrorMessage(error, '镜头视频任务提交失败'));
  } finally {
    generatingSingleShotVideos.value = { ...generatingSingleShotVideos.value, [shotId]: false };
  }
}

async function handleEditShotVideoPrompt(shotId: number) {
  if (!shotId) return;
  if (!findShotImage(shotId)) {
    MessagePlugin.warning('请先生成该镜头的首帧图');
    return;
  }
  openVideoPromptLoadingDialog(shotId);
  try {
    const preview = await getSavedDramaShotVideoPrompt(shotId);
    openVideoPromptDialog(shotId, preview);
  } catch (error) {
    const message = getErrorMessage(error, '视频提示词加载失败');
    videoPromptLoading.value = false;
    videoPromptLoadError.value = message;
    MessagePlugin.error(message);
  }
}
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}

async function handleCompleteStep(step: string) {
  completingStep.value = step;
  try {
    detail.value = await completeDramaEpisodeStep(episodeId.value, step);
    scriptForm.value = detail.value.episode.script || '';
    MessagePlugin.success('当前步骤已完成，已解锁下一步');
  } finally {
    completingStep.value = '';
  }
}

function openRollbackDialog() {
  rollbackStep.value = rollbackOptions.value.at(-1)?.value || '';
  rollbackVisible.value = true;
}

function confirmRollbackStep() {
  if (!rollbackStep.value) {
    MessagePlugin.warning('请选择要回退到的步骤');
    return;
  }
  const target = rollbackOptions.value.find((item) => item.value === rollbackStep.value);
  const targetLabel = target?.label || rollbackStep.value;
  const dialog = DialogPlugin.confirm({
    header: '确认回退进度',
    body: `确定回退到「${targetLabel}」吗？该步骤后面的内容会全部删除，相关图片和视频文件会移动到 D:\\AI视频\\回收站。`,
    confirmBtn: '确认回退',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      rollingBack.value = true;
      try {
        detail.value = await rollbackDramaEpisodeStep(episodeId.value, rollbackStep.value);
        scriptForm.value = detail.value.episode.script || '';
        activeStepKey.value = productionSteps.value[currentProductionStep.value]?.key || 'novel';
        rollbackVisible.value = false;
        MessagePlugin.success(`已回退到「${targetLabel}」`);
      } finally {
        rollingBack.value = false;
        dialog.hide();
      }
    },
  });
}

function renderMarkdown(markdown: string) {
  return markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

onMounted(async () => {
  await loadDetail();
  if (activeMediaTaskCount.value > 0) {
    startImageAutoRefresh();
  }
});
onUnmounted(() => {
  stopImageAutoRefresh();
});
</script>
<style scoped lang="less">
.episode-page {
  min-height: calc(100vh - 96px);
  padding: 28px;
  background:
    radial-gradient(circle at 8% 0%, rgb(0 82 217 / 9%) 0, transparent 32%),
    radial-gradient(circle at 96% 12%, rgb(20 184 166 / 10%) 0, transparent 30%),
    linear-gradient(180deg, #f5f8fc 0%, #eef3f9 100%);
}

.workspace-header,
.steps-card,
.stage-card {
  border: 1px solid rgb(139 158 184 / 16%);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgb(31 45 74 / 7%);
  backdrop-filter: blur(12px);
}

.workspace-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 20px;
  padding: 22px 24px;
  margin-bottom: 18px;
  background:
    radial-gradient(circle at 0% 0%, rgb(0 82 217 / 12%) 0, transparent 30%),
    linear-gradient(135deg, rgb(255 255 255 / 92%) 0%, rgb(239 248 255 / 84%) 100%);
}

.workspace-title {
  min-width: 0;

  h1 {
    margin: 10px 0 0;
    color: #20263a;
    font-size: 30px;
    line-height: 1.16;
  }
}

.back-button {
  display: block;
  padding: 0;
  margin-bottom: 14px;
  color: #667085;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.episode-badge,
.section-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  color: #0052d9;
  font-size: 12px;
  font-weight: 800;
  background: rgb(226 239 255 / 86%);
  border: 1px solid rgb(0 82 217 / 10%);
  border-radius: 999px;
}

.workspace-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  div {
    padding: 18px;
    background: rgb(255 255 255 / 62%);
    border: 1px solid rgb(255 255 255 / 78%);
    border-radius: 18px;
    box-shadow: 0 12px 26px rgb(31 45 74 / 5%);
  }

  span,
  strong {
    display: block;
  }

  span {
    margin-bottom: 8px;
    color: #7b8497;
    font-size: 12px;
    font-weight: 800;
  }

  strong {
    color: #0052d9;
    font-size: 22px;
  }
}

.steps-card {
  padding: 22px 24px 24px;
  margin-bottom: 22px;
  background: rgb(255 255 255 / 88%);
}

.steps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  strong {
    color: #20263a;
    font-size: 17px;
  }

  span {
    color: #7b8497;
    font-size: 12px;
  }
}

.clickable-steps {
  display: grid;
  grid-template-columns: repeat(8, minmax(122px, 1fr));
  overflow-x: auto;
}

.step-node {
  position: relative;
  display: grid;
  gap: 8px;
  min-width: 122px;
  padding: 8px 10px 4px;
  color: #8a90a2;
  text-align: center;
  background: transparent;
  border: 0;
  cursor: pointer;

  &::before {
    position: absolute;
    top: 15px;
    left: 0;
    width: 100%;
    height: 2px;
    content: '';
    background: #c9d1dc;
  }

  &:first-child::before {
    left: 50%;
    width: 50%;
  }

  &:last-child::before {
    width: 50%;
  }

  strong,
  small,
  .step-dot {
    position: relative;
    z-index: 1;
  }

  strong {
    margin-top: 2px;
    color: #24324b;
    font-size: 15px;
  }

  small {
    color: #8a90a2;
    font-size: 12px;
  }
}

.step-dot {
  justify-self: center;
  width: 9px;
  height: 9px;
  background: #fff;
  border: 2px solid #b8c3d2;
  border-radius: 999px;
}

.step-node.is-done {
  &::before {
    background: #0052d9;
  }

  .step-dot {
    border-color: #0052d9;
  }
}

.step-node.is-active {
  strong {
    color: #0052d9;
  }

  .step-dot {
    background: #0052d9;
    border-color: #0052d9;
    box-shadow: 0 0 0 5px rgb(0 82 217 / 10%);
  }
}

.stage-card {
  min-height: 430px;
  padding: 28px;
  background:
    radial-gradient(circle at 0% 0%, rgb(0 82 217 / 8%) 0, transparent 28%),
    linear-gradient(135deg, rgb(255 255 255 / 94%) 0%, rgb(250 252 255 / 92%) 48%, rgb(235 248 255 / 86%) 100%);
}

.section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;

  h2 {
    margin: 10px 0 0;
    color: #20263a;
    font-size: 22px;
  }

  p {
    margin: 8px 0 0;
    color: #7b8497;
    line-height: 1.7;
  }
}

.section-title.compact {
  align-items: center;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.outline-workbench {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 22px;
}

.outline-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 360px;
  padding: 26px;
  color: #fff;
  background:
    radial-gradient(circle at 18% 12%, rgb(255 255 255 / 22%) 0, transparent 28%),
    linear-gradient(145deg, #0b5bd3 0%, #123b78 58%, #102942 100%);
  border-radius: 24px;
  box-shadow: 0 22px 48px rgb(10 60 140 / 20%);

  .section-kicker {
    color: #dbeafe;
    background: rgb(255 255 255 / 14%);
    border-color: rgb(255 255 255 / 18%);
  }

  h2 {
    margin: 22px 0 12px;
    font-size: 30px;
    line-height: 1.15;
  }

  p {
    margin: 0;
    color: rgb(255 255 255 / 78%);
    line-height: 1.85;
  }
}

.outline-status {
  padding: 18px;
  margin-top: auto;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 18px;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 22px;
  }

  span {
    margin-top: 6px;
    color: rgb(255 255 255 / 70%);
  }
}

.outline-main {
  display: grid;
  gap: 16px;
}

.outline-main-header,
.outline-next,
.storyline-item {
  background: rgb(255 255 255 / 70%);
  border: 1px solid rgb(211 225 244 / 72%);
  border-radius: 20px;
  box-shadow: 0 14px 30px rgb(31 45 74 / 5%);
}

.outline-main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;

  strong,
  span {
    display: block;
  }

  strong {
    color: #20263a;
    font-size: 18px;
  }

  span {
    margin-top: 6px;
    color: #697084;
  }
}

.outline-storyline {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  gap: 14px;
}

.storyline-item {
  min-height: 126px;
  padding: 18px 20px;

  span {
    display: block;
    margin-bottom: 10px;
    color: #7b8497;
    font-size: 12px;
    font-weight: 800;
  }

  p {
    margin: 0;
    color: #41526b;
    line-height: 1.75;
  }
}

.storyline-item.primary {
  grid-row: span 2;

  p {
    font-size: 15px;
    line-height: 1.9;
  }
}

.outline-next {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  background: radial-gradient(circle at 92% 0%, rgb(0 82 217 / 9%) 0, transparent 28%), rgb(255 255 255 / 72%);

  span {
    display: block;
    margin-bottom: 6px;
    color: #0052d9;
    font-size: 12px;
    font-weight: 900;
  }

  p {
    margin: 0;
    color: #697084;
    line-height: 1.7;
  }
}

.novel-preview-card {
  position: relative;
  min-height: 260px;
  padding: 20px 22px 54px;
  overflow: hidden;
  cursor: pointer;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 64%) 0%, rgb(239 247 255 / 72%) 100%),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(184 205 253 / 18%) 32px);
  border: 1px solid rgb(255 255 255 / 88%);
  border-radius: 22px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 88%);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 36px rgb(0 82 217 / 9%);
  }

  p {
    display: -webkit-box;
    margin: 16px 0 0;
    overflow: hidden;
    color: #344054;
    font-size: 15px;
    line-height: 1.9;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 7;
  }
}

.novel-preview-toolbar {
  display: flex;
  justify-content: space-between;
  color: #7b8497;
  font-size: 12px;
  font-weight: 800;

  strong {
    color: #0052d9;
  }
}

.novel-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 28px 22px 18px;
  color: #0052d9;
  font-size: 13px;
  font-weight: 800;
  text-align: right;
  background: linear-gradient(180deg, transparent 0%, rgb(246 250 255 / 96%) 48%, rgb(246 250 255) 100%);
}

.novel-empty-card {
  display: grid;
  place-items: center;
  min-height: 260px;
  padding: 28px;
  text-align: center;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 64%) 0%, rgb(239 247 255 / 72%) 100%),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(184 205 253 / 16%) 32px);
  border: 1px dashed rgb(0 82 217 / 22%);
  border-radius: 22px;

  h3 {
    margin: 12px 0 8px;
    color: #20263a;
  }

  p {
    max-width: 520px;
    margin: 0 0 18px;
    color: #7b8497;
    line-height: 1.7;
  }
}

.empty-mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  color: #fff;
  font-weight: 900;
  background: linear-gradient(135deg, #0052d9 0%, #19a7ce 100%);
  border-radius: 18px;
  box-shadow: 0 14px 28px rgb(0 82 217 / 18%);
}

.script-title {
  margin-bottom: 16px;
}

.script-editor :deep(.t-textarea__inner) {
  color: #344054;
  line-height: 1.85;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 76%) 0%, rgb(239 247 255 / 74%) 100%),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(184 205 253 / 18%) 32px);
  border-radius: 18px;
}

.readonly-content {
  max-height: 560px;
  overflow: auto;
}

.scene-list {
  display: grid;
  gap: 12px;
}

.scene-block,
.shot-block {
  padding: 16px;
  background: #f8fbff;
  border: 1px solid #edf2f8;
  border-radius: 18px;

  h3 {
    margin: 0 0 8px;
    color: #2d3448;
  }

  p {
    margin: 6px 0;
    color: #697084;
    line-height: 1.6;
  }

  span {
    color: #0052d9;
    font-weight: 800;
  }
}

.shot-list {
  display: grid;
  gap: 12px;
  max-height: 520px;
  overflow: auto;
}

.dialogue-list-wrap {
  display: grid;
  gap: 12px;
}

.dialogue-shot-list {
  max-height: 500px;
  padding-right: 4px;
}

.dialogue-progress-card {
  display: flex;
  gap: 8px;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 8px 12px;
  color: #64748b;
  font-size: 13px;
  background: rgb(0 82 217 / 6%);
  border: 1px solid rgb(0 82 217 / 10%);
  border-radius: 999px;

  strong {
    color: #1f2a44;
    font-weight: 700;
  }
}

.dialogue-progress-dot {
  width: 7px;
  height: 7px;
  background: #0052d9;
  border-radius: 999px;

  &.is-complete {
    background: #0f9f6e;
  }
}

.shot-block {
  strong {
    display: block;
    color: #24324b;
  }

  p {
    display: -webkit-box;
    margin: 8px 0 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}

.shot-meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    padding: 4px 10px;
    color: #5f7290;
    font-size: 12px;
    background: rgb(255 255 255 / 82%);
    border: 1px solid rgb(139 158 184 / 18%);
    border-radius: 999px;
  }

  &.compact {
    margin-top: 8px;
  }
}

.shot-subline {
  color: #667792 !important;
  font-size: 13px;
  -webkit-line-clamp: 2 !important;
}

.dialogue-line {
  display: block;
  margin-top: 10px;
  padding: 10px 12px;
  color: #24324b;
  line-height: 1.7;
  background: rgb(255 255 255 / 76%);
  border: 1px solid rgb(139 158 184 / 18%);
  border-radius: 12px;
}

.image-workbench {
  display: grid;
  gap: 16px;
}

.image-progress-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.image-progress-pill {
  padding: 14px 16px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 72%) 0%, rgb(235 247 255 / 72%) 100%),
    radial-gradient(circle at 100% 0%, rgb(0 82 217 / 12%) 0, transparent 34%);
  border: 1px solid rgb(211 225 244 / 76%);
  border-radius: 18px;

  span,
  strong {
    display: block;
  }

  span {
    color: #7b8497;
    font-size: 12px;
    font-weight: 800;
  }

  strong {
    margin-top: 6px;
    color: #0052d9;
    font-size: 24px;
  }
}

.image-columns {
  display: grid;
  grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1.18fr);
  gap: 16px;
}

.image-panel {
  min-height: 360px;
  padding: 16px;
  background: rgb(255 255 255 / 62%);
  border: 1px solid rgb(211 225 244 / 70%);
  border-radius: 22px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 82%);
}

.image-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  strong,
  span {
    display: block;
  }

  strong {
    color: #24324b;
    font-size: 16px;
  }

  span {
    margin-top: 5px;
    color: #7b8497;
    font-size: 12px;
  }
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  max-height: 520px;
  padding-right: 4px;
  overflow: auto;
}

.scene-asset-grid {
  grid-template-columns: 1fr;
}

.asset-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgb(255 255 255 / 76%) 0%, rgb(246 250 255 / 72%) 100%);
  border: 1px solid rgb(222 232 246 / 82%);
  border-radius: 18px;
  box-shadow: 0 12px 26px rgb(31 45 74 / 5%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgb(0 82 217 / 9%);
  }

  &.has-image {
    cursor: pointer;
  }

  &.has-image:hover .image-preview-mask {
    opacity: 1;
  }

  &.has-image:hover .image-delete-button {
    opacity: 1;
    transform: translateY(0);
  }

  &.has-image:hover .video-prompt-button {
    opacity: 1;
    transform: translateY(0);
  }

  img,
  video,
  .asset-placeholder {
    width: 100%;
    height: 150px;
  }

  img,
  video {
    display: block;
    object-fit: cover;
    background: #eef4fb;
  }
}

.video-workbench {
  .image-panel {
    min-height: 420px;
  }
}

.video-asset-grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.video-asset-card {
  img,
  video,
  .asset-placeholder {
    height: 172px;
  }
}

.video-empty-card {
  position: relative;
  overflow: hidden;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    filter: saturate(0.9) brightness(0.76);
  }

  small,
  .single-generate-button,
  .generation-icon {
    position: relative;
    z-index: 1;
  }

  small {
    color: #fff;
    text-shadow: 0 2px 8px rgb(0 0 0 / 32%);
  }
}

.video-generating-placeholder {
  .video-task-progress {
    position: relative;
    z-index: 1;
    width: 68%;
    margin-top: 4px;
  }
}

.image-preview-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  background: linear-gradient(180deg, rgb(16 24 40 / 5%), rgb(16 24 40 / 54%));
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.image-delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  padding: 5px 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  background: rgb(217 45 32 / 90%);
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

.video-prompt-button {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  padding: 5px 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  background: rgb(0 82 217 / 92%);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 10px 22px rgb(0 82 217 / 22%);
  cursor: pointer;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;

  &:hover {
    background: #003cab;
  }

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
}

.asset-card.is-generating {
  border-color: rgb(0 82 217 / 22%);
  box-shadow: 0 18px 36px rgb(0 82 217 / 12%);

  &::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      115deg,
      transparent 0%,
      rgb(255 255 255 / 0%) 34%,
      rgb(255 255 255 / 62%) 48%,
      rgb(255 255 255 / 0%) 62%,
      transparent 100%
    );
    transform: translateX(-120%);
    animation: ai-card-scan 2.4s ease-in-out infinite;
  }
}

.asset-placeholder {
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  background:
    radial-gradient(circle at 50% 20%, rgb(0 82 217 / 14%) 0, transparent 30%),
    radial-gradient(circle at 18% 78%, rgb(20 184 166 / 12%) 0, transparent 28%),
    linear-gradient(135deg, #f4f8ff 0%, #fff 52%, #edf8ff 100%);

  span {
    padding: 8px 12px;
    background: rgb(255 255 255 / 72%);
    border: 1px solid rgb(211 225 244 / 82%);
    border-radius: 999px;
  }
}

.empty-generation-card {
  border-bottom: 1px solid rgb(0 82 217 / 10%);

  small {
    position: relative;
    z-index: 1;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
  }
}

.generation-icon {
  position: relative;
  z-index: 1;
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  color: #0052d9;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, rgb(255 255 255 / 92%) 0%, rgb(230 240 255 / 88%) 100%);
  border: 1px solid rgb(0 82 217 / 14%);
  border-radius: 16px;
  box-shadow: 0 14px 30px rgb(0 82 217 / 12%);
}

.single-generate-button {
  position: relative;
  z-index: 1;
  min-width: 92px;
  padding: 8px 16px;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(135deg, #0052d9 0%, #2f7cff 100%);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 10px 20px rgb(0 82 217 / 18%);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;

  &:hover:not(:disabled) {
    box-shadow: 0 14px 26px rgb(0 82 217 / 24%);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  &.secondary {
    color: #0052d9;
    background: rgb(255 255 255 / 92%);
    border: 1px solid rgb(0 82 217 / 24%);
    box-shadow: 0 8px 18px rgb(0 82 217 / 12%);
  }
}

.generating-placeholder {
  gap: 8px;
  align-content: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 36%, rgb(0 82 217 / 22%) 0, transparent 30%),
    radial-gradient(circle at 24% 72%, rgb(20 184 166 / 16%) 0, transparent 28%),
    linear-gradient(135deg, #eef6ff 0%, #f8fbff 46%, #eaf7ff 100%);

  &::before {
    position: absolute;
    inset: -40%;
    content: '';
    background: conic-gradient(
      from 90deg,
      transparent 0deg,
      rgb(0 82 217 / 18%) 70deg,
      transparent 150deg,
      rgb(20 184 166 / 16%) 230deg,
      transparent 330deg
    );
    animation: ai-render-rotate 4.8s linear infinite;
  }

  span,
  small,
  .ai-render-orb {
    position: relative;
    z-index: 1;
  }

  small {
    color: #6b7890;
    font-size: 12px;
    font-weight: 700;
  }
}

.ai-render-orb {
  width: 42px;
  height: 42px;
  background:
    radial-gradient(circle at 35% 30%, #fff 0 16%, transparent 18%), linear-gradient(135deg, #0052d9 0%, #19a7ce 100%);
  border-radius: 16px;
  box-shadow: 0 12px 26px rgb(0 82 217 / 24%);
  animation: ai-orb-pulse 1.8s ease-in-out infinite;
}

.asset-meta {
  padding: 12px 13px 14px;

  strong,
  span {
    display: block;
  }

  strong {
    overflow: hidden;
    color: #24324b;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: -webkit-box;
    margin-top: 6px;
    overflow: hidden;
    color: #697084;
    font-size: 12px;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

@keyframes ai-card-scan {
  0% {
    transform: translateX(-120%);
  }

  55%,
  100% {
    transform: translateX(120%);
  }
}

@keyframes ai-render-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ai-orb-pulse {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-3px) scale(1.06);
  }
}

.markdown-preview {
  max-height: 68vh;
  padding: 20px 22px;
  overflow: auto;
  color: #344054;
  line-height: 1.9;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 78%) 0%, rgb(239 247 255 / 72%) 100%),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(184 205 253 / 18%) 32px);
  border: 1px solid #edf2f8;
  border-radius: 16px;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 12px 0;
    color: #202235;
  }
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

.image-prompt-dialog-title {
  display: grid;
  gap: 3px;

  span {
    color: #6b7890;
    font-size: 12px;
    font-weight: 800;
  }

  strong {
    color: #1d2433;
    font-size: 18px;
    line-height: 1.35;
  }
}

.image-prompt-dialog {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 12px;
  height: min(78vh, 760px);
  overflow: hidden;
}

.image-prompt-reference-zone {
  display: block;
  position: relative;
  min-height: 88px;
  padding: 12px 14px;
  overflow: visible;
  background:
    radial-gradient(circle at 96% 8%, rgb(20 184 166 / 10%) 0, transparent 34%),
    linear-gradient(135deg, rgb(248 251 255 / 98%) 0%, rgb(236 245 255 / 94%) 100%);
  border: 1px solid #e4edf8;
  border-radius: 18px;
}

.image-prompt-reference-strip {
  display: flex;
  gap: 8px;
  min-width: 0;
  overflow: visible;
}

.image-prompt-reference-thumb {
  position: relative;
  width: 82px;
  height: 82px;
  padding: 6px;
  color: #526071;
  background: rgb(255 255 255 / 76%);
  border: 1px solid #e1eaf8;
  border-radius: 12px;

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 9px;
  }
}

.image-prompt-reference-remove {
  position: absolute;
  top: -7px;
  right: -7px;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  color: #fff;
  font-size: 15px;
  line-height: 1;
  background: rgb(17 24 39 / 86%);
  border: 1px solid rgb(255 255 255 / 88%);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  transform: scale(0.86);
}

.image-prompt-reference-thumb:hover .image-prompt-reference-remove {
  opacity: 1;
  transform: scale(1);
}

.video-reference-token {
  position: absolute;
  right: 7px;
  bottom: 7px;
  max-width: calc(100% - 14px);
  padding: 3px 6px;
  overflow: hidden;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgb(0 82 217 / 86%);
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 7px;
}

.image-prompt-reference-upload {
  display: grid;
  place-items: center;
  width: 82px;
  min-width: 82px;
  height: 82px;
  color: #0052d9;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  background: rgb(255 255 255 / 72%);
  border: 1px dashed rgb(0 82 217 / 35%);
  border-radius: 12px;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.62;
  }
}

.image-prompt-reference-popover {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  z-index: 20;
  display: none;
  width: 360px;
  padding: 10px;
  background: #fff;
  border: 1px solid #dce7f7;
  border-radius: 16px;
  box-shadow: 0 22px 56px rgb(31 45 74 / 24%);

  img {
    width: 100%;
    aspect-ratio: auto;
    max-height: 430px;
    object-fit: contain;
    background: #f8fbff;
    border-radius: 12px;
  }
}

.image-prompt-reference-thumb:hover {
  z-index: 21;
  border-color: rgb(0 82 217 / 42%);

  .image-prompt-reference-popover {
    display: block;
  }
}

.image-prompt-param-zone {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 86px;
  padding: 10px 12px;
  overflow: auto;
  background: #fff;
  border: 1px solid #e8eef8;
  border-radius: 16px;
}

.video-spec-panel,
.image-spec-panel {
  display: grid;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f8fc 100%);
  border: 1px solid #e4edf8;
  border-radius: 16px;
}

.video-spec-panel {
  grid-template-columns: minmax(148px, 0.8fr) repeat(3, minmax(190px, 1fr));
}

.image-spec-panel {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.video-spec-field {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  background: #fff;
  border: 1px solid #edf2fb;
  border-radius: 12px;

  > span {
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }
}

.video-duration-control,
.video-segmented-control {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 6px;
  align-items: center;
}

.video-duration-control {
  grid-template-columns: 34px minmax(58px, 1fr) 34px;

  strong {
    display: grid;
    place-items: center;
    min-height: 34px;
    color: #1f2a44;
    font-size: 14px;
    line-height: 1;
    background: #f7faff;
    border: 1px solid #e5edf8;
    border-radius: 9px;
  }
}

.video-duration-control button,
.video-segmented-control button {
  min-height: 34px;
  padding: 0 10px;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  background: #f8fbff;
  border: 1px solid #e1eaf8;
  border-radius: 9px;
  cursor: pointer;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover:not(:disabled) {
    color: #0052d9;
    border-color: rgb(0 82 217 / 28%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &.is-active {
    color: #fff;
    background: #0052d9;
    border-color: #0052d9;
    box-shadow: 0 8px 18px rgb(0 82 217 / 18%);
  }
}

.image-prompt-body {
  display: block;
  min-height: 0;
}

.image-prompt-editor {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8eef8;
  border-radius: 18px;
  box-shadow: 0 16px 34px rgb(31 45 74 / 6%);
}

.image-prompt-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  strong,
  span {
    display: block;
  }

  strong {
    color: #24324b;
    font-size: 15px;
  }

  span {
    margin-top: 5px;
    color: #7b8497;
    font-size: 12px;
    font-weight: 700;
  }
}

.image-prompt-section-head.compact {
  margin-top: 16px;
  margin-bottom: 10px;
}

.image-prompt-textarea {
  flex: 1;
  min-height: 0;
}

.image-prompt-textarea :deep(.t-textarea__inner) {
  height: 100% !important;
  color: #25324a;
  line-height: 1.8;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 92%) 0%, rgb(247 250 255 / 92%) 100%),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(184 205 253 / 16%) 32px);
  border-color: #dce7f7;
  border-radius: 14px;
}

.video-prompt-load-error {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #b3261e;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;
  text-align: center;
  background: #fff7f6;
  border: 1px solid #ffd8d3;
  border-radius: 14px;
}

.image-prompt-param-tag {
  display: inline-grid;
  grid-template-columns: 1fr;
  max-width: 100%;
  padding: 8px 10px;
  background: #f4f8ff;
  border: 1px solid #edf2fb;
  border-radius: 999px;

  span {
    color: #6b7890;
    font-size: 11px;
    font-weight: 800;
  }

  code {
    overflow-wrap: anywhere;
    color: #24324b;
    font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
    font-size: 11px;
    line-height: 1.55;
    white-space: pre-wrap;
  }
}

.image-prompt-reference-empty {
  display: grid;
  place-items: center;
  min-width: 150px;
  padding: 14px 18px;
  color: #7b8497;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  background: #f8fbff;
  border: 1px dashed #dce7f7;
  border-radius: 12px;
}

.image-prompt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 2px;
}

.image-asset-picker {
  min-height: 360px;
}

.image-asset-picker-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.image-asset-category {
  padding: 8px 13px;
  color: #526071;
  font-size: 13px;
  font-weight: 800;
  background: #f4f8ff;
  border: 1px solid #e1eaf8;
  border-radius: 999px;
  cursor: pointer;

  &.is-active {
    color: #0052d9;
    background: #eaf3ff;
    border-color: rgb(0 82 217 / 32%);
  }
}

.image-asset-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
  gap: 12px;
  max-height: 62vh;
  overflow: auto;
}

.image-asset-picker-item {
  padding: 8px;
  background: #f8fbff;
  border: 1px solid #e1eaf8;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    border-color: rgb(0 82 217 / 42%);
    box-shadow: 0 10px 26px rgb(31 45 74 / 10%);
  }

  img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
  }
}

.asset-preview-dialog {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  align-items: stretch;
}

.asset-preview-main {
  display: grid;
  gap: 14px;
}

.asset-preview-brief {
  padding: 18px 20px;
  background:
    radial-gradient(circle at 96% 10%, rgb(0 82 217 / 10%) 0, transparent 32%),
    linear-gradient(135deg, rgb(255 255 255 / 94%) 0%, rgb(243 247 255 / 92%) 100%);
  border: 1px solid #e8eef8;
  border-radius: 20px;

  h3 {
    margin: 8px 0;
    color: #1d2433;
    font-size: 20px;
    line-height: 1.35;
  }

  p {
    margin: 0;
    color: #526071;
    line-height: 1.7;
  }
}

.preview-prompt-box {
  display: grid;
  gap: 8px;
  max-height: 132px;
  margin-top: 14px;
  padding: 12px 14px;
  overflow: auto;
  color: #344054;
  font-size: 12px;
  line-height: 1.7;
  background: rgb(255 255 255 / 72%);
  border: 1px solid #e8eef8;
  border-radius: 14px;

  strong {
    color: #0052d9;
    font-size: 12px;
  }
}

.video-prompt-viewer {
  display: grid;
  gap: 14px;
}

.video-prompt-viewer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #667085;
  font-size: 13px;
  font-weight: 700;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    flex: 0 0 auto;
    color: #0052d9;
  }
}

.video-prompt-viewer pre {
  max-height: 68vh;
  margin: 0;
  padding: 18px 20px;
  overflow: auto;
  color: #25324a;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: #f8fbff;
  border: 1px solid #dce7f7;
  border-radius: 14px;
}

.asset-preview-large {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  line-height: 0;
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
    max-height: 66vh;
    object-fit: contain;
  }

  video {
    width: 100%;
    max-height: 66vh;
    object-fit: contain;
    border-radius: 14px;
  }
}

.asset-preview-meta {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background:
    radial-gradient(circle at 0% 0%, rgb(0 82 217 / 8%) 0, transparent 32%),
    linear-gradient(180deg, #f8faff 0%, #fff 100%);
  border: 1px solid #edf2fb;
  border-radius: 20px;

  h3 {
    margin: 16px 0 8px;
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
  gap: 9px;
  margin-top: 4px;

  span {
    padding: 9px 10px;
    overflow-wrap: anywhere;
    color: #4b5565;
    font-size: 12px;
    background: rgb(255 255 255 / 76%);
    border: 1px solid #edf2fb;
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

.draft-workbench {
  display: grid;
  gap: 18px;
}

.draft-status {
  display: grid;
  gap: 12px;
  padding: 18px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  strong {
    display: block;
    margin-bottom: 4px;
    color: #111827;
  }

  span {
    color: #667085;
  }
}

.draft-result {
  display: grid;
  grid-template-columns: minmax(320px, 1.1fr) minmax(280px, 0.9fr);
  gap: 18px;
  align-items: stretch;
}

.draft-preview {
  min-height: 320px;
  overflow: hidden;
  background: #0b1020;
  border-radius: 8px;

  video {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 320px;
    object-fit: contain;
  }
}

.draft-files {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  strong {
    color: #111827;
    font-size: 16px;
  }

  span,
  li {
    color: #667085;
    font-size: 12px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  ul {
    display: grid;
    gap: 6px;
    margin: 0;
    padding-left: 18px;
  }
}

@media (width <= 1180px) {
  .workspace-header,
  .outline-workbench,
  .outline-storyline,
  .image-columns {
    grid-template-columns: 1fr;
  }

  .image-prompt-body {
    grid-template-columns: 1fr;
  }

  .video-spec-panel,
  .image-spec-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .outline-sidebar {
    min-height: auto;
  }
}

@media (width <= 960px) {
  .episode-page {
    padding: 18px;
  }

  .workspace-metrics {
    grid-template-columns: 1fr;
  }

  .image-progress-row {
    grid-template-columns: 1fr;
  }

  .section-title,
  .steps-header,
  .outline-main-header,
  .outline-next {
    display: block;
  }

  .panel-actions {
    justify-content: flex-start;
    margin-top: 14px;
  }

  .outline-next .t-button {
    margin-top: 14px;
  }

  .asset-preview-dialog {
    grid-template-columns: 1fr;
  }

  .image-prompt-footer {
    display: grid;
  }

  .video-spec-panel,
  .image-spec-panel {
    grid-template-columns: 1fr;
  }

  .draft-result {
    grid-template-columns: 1fr;
  }

  .asset-preview-large {
    min-height: unset;
  }
}
</style>
