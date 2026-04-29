import type {
  DramaCharacter,
  DramaCharacterCreateRequest,
  DramaEpisodeDetail,
  DramaSeriesCreateRequest,
  DramaSeriesDetail,
  DramaSeriesSummary,
  DramaStorySaveRequest,
  DramaTask,
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

export function createDramaCharacter(seriesId: number, data: DramaCharacterCreateRequest) {
  return request.post<DramaCharacter>({
    url: `/ai/drama/series/${seriesId}/characters`,
    data,
  });
}

export function deleteDramaCharacter(seriesId: number, characterId: number) {
  return request.delete<void>({
    url: `/ai/drama/series/${seriesId}/characters/${characterId}`,
  });
}

export function generateDramaStory(seriesId: number, instruction?: string) {
  return request.post<DramaTask>({
    url: `/ai/drama/series/${seriesId}/story/generate`,
    data: { instruction },
  });
}

export function generateDramaEpisodes(seriesId: number, count?: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/series/${seriesId}/episodes/generate`,
    data: { count },
  });
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
  });
}

export function generateDramaEpisodeShots(episodeId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/episodes/${episodeId}/shots/generate`,
    data: {},
  });
}

export function generateDramaShotImage(shotId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/shots/${shotId}/image/generate`,
    data: {},
  });
}

export function generateDramaShotVideo(shotId: number) {
  return request.post<DramaTask>({
    url: `/ai/drama/shots/${shotId}/video/generate`,
    data: {},
  });
}

export function getDramaTask(taskId: number) {
  return request.get<DramaTask>({
    url: `/ai/drama/tasks/${taskId}`,
  });
}
