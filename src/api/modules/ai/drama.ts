import { useUserStore } from '@/store';
import type {
  DramaAsset,
  DramaCharacter,
  DramaCharacterCreateRequest,
  DramaEpisodeDetail,
  DramaEpisodeScriptSaveRequest,
  DramaSeriesCreateRequest,
  DramaSeriesDetail,
  DramaSeriesSummary,
  DramaStoryAssistantChatRequest,
  DramaStoryAssistantChatResponse,
  DramaStoryBrief,
  DramaStoryBriefRequest,
  DramaStoryGenerateRequest,
  DramaStorySaveRequest,
  DramaTask,
  DramaTaskCenter,
} from '@/types/modules/ai/drama';
import { request } from '@/utils/request';

export function createDramaSeries(data: DramaSeriesCreateRequest) {
  return request.post<DramaSeriesSummary>({
    url: '/ai/drama/series',
    data,
  });
}

export function listDramaSeries() {
  return request.get<DramaSeriesSummary[]>({
    url: '/ai/drama/series',
  });
}

export function getDramaSeriesDetail(id: number) {
  return request.get<DramaSeriesDetail>({
    url: `/ai/drama/series/${id}`,
  });
}

export function deleteDramaSeries(id: number) {
  return request.delete<void>({
    url: `/ai/drama/series/${id}`,
  });
}

export function saveDramaStory(seriesId: number, data: DramaStorySaveRequest) {
  return request.put<DramaSeriesDetail>({
    url: `/ai/drama/series/${seriesId}/story`,
    data,
  });
}

export function listDramaCharacters(seriesId: number) {
  return request.get<DramaCharacter[]>({
    url: `/ai/drama/series/${seriesId}/characters`,
  });
}

export function getDramaCharacterDetail(seriesId: number, characterId: number) {
  return request.get<DramaCharacter>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}`,
  });
}

export function createDramaCharacter(seriesId: number, data: DramaCharacterCreateRequest) {
  return request.post<DramaCharacter>({
    url: `/ai/drama/series/${seriesId}/characters`,
    data,
  });
}

export function updateDramaCharacter(seriesId: number, characterId: number, data: DramaCharacterCreateRequest) {
  return request.put<DramaCharacter>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}`,
    data,
  });
}

export function generateDramaCharacters(seriesId: number) {
  return request.post<DramaCharacter[]>({
    url: `/ai/drama/series/${seriesId}/characters/generate`,
    data: {},
    timeout: 180000,
  });
}

export function deleteDramaCharacter(seriesId: number, characterId: number) {
  return request.delete<void>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}`,
  });
}

export function listDramaCharacterAssets(seriesId: number, characterId: number) {
  return request.get<DramaAsset[]>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}/assets`,
  });
}

export function generateDramaCharacterImage(seriesId: number, characterId: number, imageType: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}/images/generate`,
    data: { imageType },
    timeout: 120000,
  });
}

export function generateDramaCharacterAuxiliaryImages(seriesId: number, characterId: number) {
  return request.post<DramaTask[]>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}/images/auxiliary/generate`,
    data: {},
    timeout: 180000,
  });
}

export function deleteDramaCharacterAsset(seriesId: number, characterId: number, assetId: number) {
  return request.delete<void>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}/assets/${assetId}`,
  });
}

export function deleteDramaAsset(assetId: number) {
  return request.delete<void>({
    url: `/ai/drama/assets/${assetId}`,
  });
}

export function generateDramaStory(seriesId: number, instruction?: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/series/${seriesId}/story/generate`,
    data: { instruction },
  });
}

export function prepareDramaStoryBrief(seriesId: number, data?: DramaStoryBriefRequest) {
  return request.post<DramaStoryBrief>({
    url: `/ai/drama/series/${seriesId}/story/brief`,
    data: data || {},
    timeout: 180000,
  });
}

export function generateDramaStoryContent(seriesId: number, data: DramaStoryGenerateRequest) {
  return request.post<DramaSeriesDetail>({
    url: `/ai/drama/series/${seriesId}/story/generate-content`,
    data,
    timeout: 300000,
  });
}

export function chatDramaStoryAssistant(seriesId: number, data: DramaStoryAssistantChatRequest) {
  return request.post<DramaStoryAssistantChatResponse>({
    url: `/ai/drama/series/${seriesId}/story/assistant/chat`,
    data,
    timeout: 300000,
  });
}

interface StreamDramaStoryAssistantOptions {
  onChunk?: (chunk: string) => void;
  onResult?: (result: DramaStoryAssistantChatResponse) => void;
  onError?: (message: string) => void;
}

export async function streamDramaStoryAssistant(
  seriesId: number,
  data: DramaStoryAssistantChatRequest,
  options: StreamDramaStoryAssistantOptions = {},
) {
  const userStore = useUserStore();
  const prefix = import.meta.env.VITE_API_URL_PREFIX || '/api';
  const response = await fetch(`${prefix}/ai/drama/series/${seriesId}/story/assistant/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI 助手流式请求失败：${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    events.forEach((eventText) => handleAssistantSseEvent(eventText, options));
  }
  if (buffer.trim()) {
    handleAssistantSseEvent(buffer, options);
  }
}

function handleAssistantSseEvent(eventText: string, options: StreamDramaStoryAssistantOptions) {
  const lines = eventText.split(/\r?\n/);
  const eventName = lines
    .find((line) => line.startsWith('event:'))
    ?.replace(/^event:\s*/, '')
    .trim();
  const data = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, ''))
    .join('\n');

  if (!eventName || !data) return;
  if (eventName === 'chunk') {
    options.onChunk?.(data);
    return;
  }
  if (eventName === 'result') {
    options.onResult?.(JSON.parse(data) as DramaStoryAssistantChatResponse);
    return;
  }
  if (eventName === 'error') {
    try {
      options.onError?.((JSON.parse(data) as { message?: string }).message || 'AI 助手调用失败');
    } catch {
      options.onError?.(data);
    }
  }
}

export function generateDramaEpisodes(seriesId: number, count?: number, instruction?: string) {
  return request.post<DramaTask>(
    {
      url: `/ai/drama/series/${seriesId}/episodes/generate`,
      data: { count, instruction },
      timeout: 300000,
    },
    {
      retry: {
        count: 0,
        delay: 0,
      },
    },
  );
}

export function getDramaEpisodeDetail(episodeId: number) {
  return request.get<DramaEpisodeDetail>({
    url: `/ai/drama/episodes/${episodeId}`,
  });
}

export function generateDramaEpisodeScript(episodeId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/episodes/${episodeId}/script/generate`,
    data: {},
    timeout: 300000,
  });
}

export function generateDramaEpisodeNovel(episodeId: number, instruction?: string) {
  return request.post<DramaEpisodeDetail>({
    url: `/ai/drama/episodes/${episodeId}/novel/generate`,
    data: { instruction },
    timeout: 300000,
  });
}

export function regenerateDramaEpisodeScript(episodeId: number, instruction: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/episodes/${episodeId}/script/generate`,
    data: { instruction },
    timeout: 300000,
  });
}

export function saveDramaEpisodeScript(episodeId: number, data: DramaEpisodeScriptSaveRequest) {
  return request.put<DramaEpisodeDetail>({
    url: `/ai/drama/episodes/${episodeId}/script`,
    data,
  });
}

export function completeDramaEpisodeStep(episodeId: number, step: string) {
  return request.put<DramaEpisodeDetail>({
    url: `/ai/drama/episodes/${episodeId}/workflow/complete`,
    data: { step },
  });
}

export function rollbackDramaEpisodeStep(episodeId: number, step: string) {
  return request.put<DramaEpisodeDetail>({
    url: `/ai/drama/episodes/${episodeId}/workflow/rollback`,
    data: { step },
  });
}

export function generateDramaEpisodeScenes(episodeId: number, instruction?: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/episodes/${episodeId}/scenes/generate`,
    data: { instruction },
    timeout: 300000,
  });
}

export function generateDramaEpisodeShots(episodeId: number, instruction?: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/episodes/${episodeId}/shots/generate`,
    data: { instruction },
    timeout: 300000,
  });
}

export function generateDramaEpisodeDialogues(episodeId: number, instruction?: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/episodes/${episodeId}/dialogues/generate`,
    data: { instruction },
    timeout: 300000,
  });
}

export function generateDramaEpisodeSceneImages(episodeId: number) {
  return request.post<DramaTask[]>({
    url: `/ai/drama/episodes/${episodeId}/scene-images/generate`,
    data: {},
    timeout: 300000,
  });
}

export function generateDramaEpisodeShotImages(episodeId: number) {
  return request.post<DramaTask[]>({
    url: `/ai/drama/episodes/${episodeId}/shot-images/generate`,
    data: {},
    timeout: 300000,
  });
}

export function generateDramaEpisodeShotVideos(episodeId: number) {
  return request.post<DramaTask[]>({
    url: `/ai/drama/episodes/${episodeId}/shot-videos/generate`,
    data: {},
    timeout: 300000,
  });
}

export function generateDramaSceneImage(sceneId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/scenes/${sceneId}/image/generate`,
    data: {},
    timeout: 300000,
  });
}

export function generateDramaShotImage(shotId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/shots/${shotId}/image/generate`,
    data: {},
    timeout: 300000,
  });
}

export function generateDramaShotVideo(shotId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/shots/${shotId}/video/generate`,
    data: {},
    timeout: 300000,
  });
}

export function getDramaTask(taskId: number) {
  return request.get<DramaTask>({
    url: `/ai/drama/tasks/${taskId}`,
  });
}

export function listDramaTaskCenter(limit = 80) {
  return request.get<DramaTaskCenter>({
    url: '/ai/drama/tasks',
    params: { limit },
  });
}

export function cancelDramaTask(taskId: number) {
  return request.delete<DramaTaskCenter>({
    url: `/ai/drama/tasks/${taskId}`,
  });
}
