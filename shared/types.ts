export type VideoLength = 30 | 45 | 60;

export type VoiceStyle = 'professional' | 'local';

export const VIDEO_LENGTH_COSTS: Record<VideoLength, number> = {
  30: 100,
  45: 150,
  60: 200,
};

export interface BusinessProfile {
  id?: string;
  name: string;
  category: string;
  description: string;
  products: string[];
  tone?: string;
  location?: string;
  sourceType: 'url' | 'manual';
  url?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  professionalVoiceId: string;
  localVoiceId: string;
  region?: string;
}

export interface CharacterOption {
  id: string;
  name: string;
  style: string;
  gender: string;
  description: string;
  avatarUrl: string;
  previewVideoUrl: string;
  supportsContinuousMotion: boolean;
  heygenAvatarId: string;
  didAvatarId: string;
}

export type VideoJobStatus = 'queued' | 'generating_voice' | 'rendering_video' | 'completed' | 'failed';

export interface VideoProjectData {
  id: string;
  businessId: string;
  promptText: string;
  language: string;
  characterId: string;
  voiceStyle?: VoiceStyle | string;
  videoLength?: VideoLength | number;
  creditsCost?: number;
  status: VideoJobStatus | string;
  errorMessage?: string | null;
  videoUrl?: string | null;
  version: number;
  createdAt: string | Date;
  business?: {
    id: string;
    name: string;
    category: string;
    location?: string | null;
  };
}
