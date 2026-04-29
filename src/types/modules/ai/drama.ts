export interface DramaSeriesCreateRequest {
  name: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface DramaStorySaveRequest {
  originalStory?: string;
  storySummary?: string;
  fullStory?: string;
}

export interface DramaShot {
  id: number;
  episodeId: number;
  sceneId?: number;
  shotNo: number;
  shotSize?: string;
  action?: string;
  dialogue?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  status: string;
}

export interface DramaAsset {
  id: number;
  assetType: string;
  fileName: string;
  contentType?: string;
  accessUrl: string;
  createdAt: string;
}

export interface DramaTask {
  id: number;
  taskType: string;
  providerTaskId?: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
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
