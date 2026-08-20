import {
  CharacterOption,
  VideoJobStatus,
  SUPPORTED_LANGUAGES,
  CONTINUOUS_MOTION_CHARACTERS,
  VoiceStyle,
} from '@adanimai/shared';

export { CONTINUOUS_MOTION_CHARACTERS };

const HEYGEN_ENV_OVERRIDE_MAP: Record<string, string | undefined> = {
  char_cartoon_maya: process.env.HEYGEN_AVATAR_ID_MAYA,
  char_cartoon_alex: process.env.HEYGEN_AVATAR_ID_ALEX,
  char_cartoon_priya: process.env.HEYGEN_AVATAR_ID_PRIYA,
  char_cartoon_rohan: process.env.HEYGEN_AVATAR_ID_ROHAN,
};

const DID_ENV_OVERRIDE_MAP: Record<string, string | undefined> = {
  char_cartoon_maya: process.env.DID_AVATAR_ID_MAYA,
  char_cartoon_alex: process.env.DID_AVATAR_ID_ALEX,
  char_cartoon_priya: process.env.DID_AVATAR_ID_PRIYA,
  char_cartoon_rohan: process.env.DID_AVATAR_ID_ROHAN,
};

function getEffectiveHeygenAvatarId(character: CharacterOption): string {
  return HEYGEN_ENV_OVERRIDE_MAP[character.id] || character.heygenAvatarId;
}

function getEffectiveDidAvatarId(character: CharacterOption): string {
  return DID_ENV_OVERRIDE_MAP[character.id] || character.didAvatarId;
}

export interface CreateVideoJobParams {
  promptText: string;
  languageCode: string;
  characterId: string;
  voiceStyle?: VoiceStyle | string;
}

export interface VideoJobResponse {
  jobId: string;
  status: VideoJobStatus;
  videoUrl?: string;
  errorMessage?: string;
}

function getDIDAuthorizationHeader(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.startsWith('Basic ')) {
    return trimmed;
  }
  const credentials = trimmed.includes(':') ? trimmed : `${trimmed}:`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export async function createAvatarVideoJob(params: CreateVideoJobParams): Promise<VideoJobResponse> {
  const { promptText, languageCode, characterId, voiceStyle = 'professional' } = params;
  const character = CONTINUOUS_MOTION_CHARACTERS.find((c) => c.id === characterId) || CONTINUOUS_MOTION_CHARACTERS[0];
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode) || SUPPORTED_LANGUAGES[0];

  // Resolve voice ID based on selected voice style
  const selectedVoiceId =
    voiceStyle === 'local' ? langConfig.localVoiceId : langConfig.professionalVoiceId;

  const heygenKey = process.env.HEYGEN_API_KEY;
  const didKey = process.env.DID_API_KEY;

  if (heygenKey && heygenKey.trim() !== '') {
    try {
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': heygenKey.trim(),
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: getEffectiveHeygenAvatarId(character),
                avatar_style: 'normal',
              },
              voice: {
                type: 'text',
                input_text: promptText,
                voice_id: selectedVoiceId,
                speed: 1.0,
              },
              background: {
                type: 'color',
                value: '#0f172a',
              },
            },
          ],
          dimension: {
            width: 1280,
            height: 720,
          },
          test: false,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.data?.video_id) {
        return {
          jobId: data.data.video_id,
          status: 'queued',
        };
      }

      const errorMsg = data.message || data.error?.message || `HeyGen API error (${response.status})`;
      console.error('HeyGen generation failed:', errorMsg);
      return {
        jobId: `failed_heygen_${Date.now()}`,
        status: 'failed',
        errorMessage: `HeyGen provider error: ${errorMsg}`,
      };
    } catch (err: any) {
      console.error('HeyGen API call network error:', err);
      return {
        jobId: `failed_heygen_${Date.now()}`,
        status: 'failed',
        errorMessage: `HeyGen connection error: ${err.message || 'Network request failed'}`,
      };
    }
  }

  if (didKey && didKey.trim() !== '') {
    try {
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getDIDAuthorizationHeader(didKey),
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: promptText,
            provider: {
              type: 'microsoft',
              voice_id: selectedVoiceId,
            },
          },
          config: {
            fluent: true,
            pad_audio: 0,
            stitch: true,
          },
          source_url: character.avatarUrl,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.id) {
        return {
          jobId: data.id,
          status: 'queued',
        };
      }

      const errorMsg = data.message || data.description || `D-ID API error (${response.status})`;
      console.error('D-ID generation failed:', errorMsg);
      return {
        jobId: `failed_did_${Date.now()}`,
        status: 'failed',
        errorMessage: `D-ID provider error: ${errorMsg}`,
      };
    } catch (err: any) {
      console.error('D-ID API network error:', err);
      return {
        jobId: `failed_did_${Date.now()}`,
        status: 'failed',
        errorMessage: `D-ID connection error: ${err.message || 'Network request failed'}`,
      };
    }
  }

  const mockJobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    jobId: mockJobId,
    status: 'queued',
  };
}

export async function checkAvatarVideoJobStatus(
  jobId: string,
  characterId?: string
): Promise<{ status: VideoJobStatus; videoUrl?: string; errorMessage?: string }> {
  const heygenKey = process.env.HEYGEN_API_KEY;
  const didKey = process.env.DID_API_KEY;
  const character = CONTINUOUS_MOTION_CHARACTERS.find((c) => c.id === characterId) || CONTINUOUS_MOTION_CHARACTERS[0];

  if (heygenKey && !jobId.startsWith('job_') && !jobId.startsWith('tlk_') && !jobId.startsWith('failed_')) {
    try {
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${jobId}`, {
        headers: { 'X-Api-Key': heygenKey.trim() },
      });
      if (response.ok) {
        const data = await response.json();
        const rawState = (data.data?.status || '').toLowerCase();

        if (rawState === 'completed' || rawState === 'success') {
          return { status: 'completed', videoUrl: data.data.video_url };
        } else if (rawState === 'failed' || rawState === 'error') {
          return { status: 'failed', errorMessage: data.data.error || 'Video rendering failed on HeyGen provider.' };
        } else if (rawState === 'processing' || rawState === 'rendering') {
          return { status: 'rendering_video' };
        } else if (rawState === 'pending' || rawState === 'waiting' || rawState === 'queued') {
          return { status: 'queued' };
        }
        return { status: 'rendering_video' };
      }
    } catch (err: any) {
      console.warn('HeyGen status poll failed:', err);
    }
  }

  if (didKey && (jobId.startsWith('tlk_') || (!jobId.startsWith('job_') && !heygenKey && !jobId.startsWith('failed_')))) {
    try {
      const response = await fetch(`https://api.d-id.com/talks/${jobId}`, {
        headers: {
          'Authorization': getDIDAuthorizationHeader(didKey),
        },
      });
      if (response.ok) {
        const data = await response.json();
        const rawState = (data.status || '').toLowerCase();

        if (rawState === 'done' || rawState === 'completed') {
          return { status: 'completed', videoUrl: data.result_url };
        } else if (rawState === 'error' || rawState === 'failed') {
          return { status: 'failed', errorMessage: data.error?.message || 'Rendering failed on D-ID provider.' };
        } else if (rawState === 'started' || rawState === 'processing') {
          return { status: 'rendering_video' };
        } else if (rawState === 'created' || rawState === 'queued') {
          return { status: 'queued' };
        }
        return { status: 'rendering_video' };
      }
    } catch (err: any) {
      console.warn('D-ID status poll failed:', err);
    }
  }

  if (jobId.startsWith('failed_')) {
    return {
      status: 'failed',
      errorMessage: 'Provider job initialization failed.',
    };
  }

  const elapsed = Date.now() - (parseInt(jobId.split('_')[1], 10) || Date.now());
  if (elapsed > 7000) {
    return {
      status: 'completed',
      videoUrl: character.previewVideoUrl,
    };
  } else if (elapsed > 3500) {
    return { status: 'rendering_video' };
  } else if (elapsed > 1000) {
    return { status: 'generating_voice' };
  }

  return { status: 'queued' };
}
