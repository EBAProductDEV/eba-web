export interface DramaSeriesCreateRequest {
  name: string;
  aspectRatio: string;
  type: string;
  intro?: string;
  theme?: string;
  style?: string;
  totalEpisodes: number;
  episodeDurationMinutes: number;
}

export interface DramaSeriesSummary {
  id: number;
  name: string;
  aspectRatio: string;
  type: string;
  intro?: string;
  style?: string;
  totalEpisodes: number;
  episodeDurationMinutes: number;
  status: string;
  createdAt: string;
}

export interface DramaEpisode {
  id: number;
  episodeNo: number;
  title: string;
  summary?: string;
  novelContent?: string;
  hook?: string;
  cliffhanger?: string;
  script?: string;
  status: string;
}

export interface DramaScene {
  id: number;
  name: string;
  location?: string;
  timeOfDay?: string;
  atmosphere?: string;
  plotPurpose?: string;
}

export interface DramaCharacterCreateRequest {
  name: string;
  profile?: string;
  appearance?: string;
  costume?: string;
  personality?: string;
  relationship?: string;
}

export interface DramaCharacter extends DramaCharacterCreateRequest {
  id: number;
  seriesId: number;
  visualProfile?: string;
  primaryReferenceAssetId?: number;
  avatarAssetId?: number;
  primaryReferenceAccessUrl?: string;
  avatarAccessUrl?: string;
  imageSeed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DramaStorySaveRequest {
  originalStory?: string;
  storySummary?: string;
}

export interface DramaEpisodeScriptSaveRequest {
  script: string;
}

export interface DramaStoryBriefRequest {
  requirement?: string;
}

export interface DramaStoryBrief {
  storyBrief: string;
  modelReady: boolean;
}

export interface DramaStoryGenerateRequest {
  storyBrief: string;
  requirement?: string;
}

export interface DramaStoryAssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DramaStoryAssistantChatRequest {
  question: string;
  storySummary?: string;
  originalStory?: string;
  history?: DramaStoryAssistantMessage[];
  mode?: 'chat' | 'plan';
  planConfirmed?: boolean;
  planContent?: string;
}

export interface DramaStoryAssistantChatResponse {
  answer: string;
  accepted: boolean;
  modelReady: boolean;
  originalStory?: string;
  operation?: 'answer' | 'rewrite' | 'plan' | 'reject';
}

export interface DramaShot {
  id: number;
  episodeId: number;
  sceneId?: number;
  shotNo: number;
  shotSize?: string;
  durationSeconds?: number;
  cameraMovement?: string;
  composition?: string;
  transitionType?: string;
  continuityType?: string;
  startState?: string;
  endState?: string;
  continuityNote?: string;
  soundEffect?: string;
  musicCue?: string;
  voiceOver?: string;
  action?: string;
  dialogue?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  status: string;
}

export interface DramaAsset {
  id: number;
  episodeId?: number;
  sceneId?: number;
  shotId?: number;
  assetType: string;
  assetSubType?: string;
  characterId?: number;
  fileName: string;
  contentType?: string;
  accessUrl: string;
  prompt?: string;
  status?: string;
  createdAt: string;
}

export interface DramaTask {
  id: number;
  seriesId?: number;
  episodeId?: number;
  shotId?: number;
  characterId?: number;
  assetId?: number;
  targetType?: string;
  targetId?: number;
  assetType?: string;
  assetSubType?: string;
  taskType: string;
  providerTaskId?: string;
  status: string;
  progress?: number;
  stage?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DramaTaskCenterItem {
  id: number;
  seriesId?: number;
  episodeId?: number;
  shotId?: number;
  characterId?: number;
  assetId?: number;
  seriesName?: string;
  characterName?: string;
  taskType: string;
  targetType?: string;
  targetId?: number;
  assetType?: string;
  assetSubType?: string;
  title: string;
  description: string;
  status: string;
  progress?: number;
  stage?: string;
  stageText?: string;
  currentStep?: number;
  steps: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DramaTaskCenter {
  activeCount: number;
  totalCount: number;
  tasks: DramaTaskCenterItem[];
}

export interface DramaSeriesDetail extends DramaSeriesSummary {
  theme?: string;
  originalStory?: string;
  storySummary?: string;
  fullStory?: string;
  storyStatus?: string;
  characters: DramaCharacter[];
  episodes: DramaEpisode[];
  recentAssets: DramaAsset[];
  recentTasks: DramaTask[];
}

export interface DramaEpisodeDetail {
  seriesId: number;
  episode: DramaEpisode;
  scenes: DramaScene[];
  shots: DramaShot[];
  assets: DramaAsset[];
  tasks: DramaTask[];
}
