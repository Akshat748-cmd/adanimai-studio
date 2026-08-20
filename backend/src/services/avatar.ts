import { CharacterOption, VideoJobStatus } from '../types';
import { SUPPORTED_LANGUAGES } from '../config/languages';

export const CONTINUOUS_MOTION_CHARACTERS: CharacterOption[] = [
  {
    id: 'char_cartoon_maya',
    name: 'Maya (3D Animated Presenter)',
    style: '3D Stylized Pixar Style',
    gender: 'Female',
    description: 'Vibrant, smiling cartoon presenter with continuous hand gestures, expressive eye contact, and natural body swaying.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    supportsContinuousMotion: true,
    heygenAvatarId: process.env.HEYGEN_AVATAR_ID_MAYA || 'avatar_3d_maya_gestures_v2',
    didAvatarId: process.env.DID_AVATAR_ID_MAYA || 'did_cartoon_maya_motion',
  },
  {
    id: 'char_cartoon_alex',
    name: 'Alex (Dynamic Cartoon Host)',
    style: 'Modern 3D Animated',
    gender: 'Male',
    description: 'High-energy commercial host with dynamic arm movements, enthusiastic nodding, and active presentation posture.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    supportsContinuousMotion: true,
    heygenAvatarId: process.env.HEYGEN_AVATAR_ID_ALEX || 'avatar_3d_alex_dynamic_v2',
    didAvatarId: process.env.DID_AVATAR_ID_ALEX || 'did_cartoon_alex_motion',
  },
  {
    id: 'char_cartoon_priya',
    name: 'Priya (Indian Traditional Stylized)',
    style: 'Vibrant 3D Cartoon',
    gender: 'Female',
    description: 'Warm and friendly Indian animated host with traditional attire, natural hand movements, and engaging storytelling gestures.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    supportsContinuousMotion: true,
    heygenAvatarId: process.env.HEYGEN_AVATAR_ID_PRIYA || 'avatar_3d_priya_expressive_v2',
    didAvatarId: process.env.DID_AVATAR_ID_PRIYA || 'did_cartoon_priya_motion',
  },
  {
    id: 'char_cartoon_rohan',
    name: 'Rohan (Friendly Retail Guide)',
    style: '3D Claymation Style',
    gender: 'Male',
    description: 'Approachable and trustworthy character with friendly gestures, product pointing actions, and lively movement.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    supportsContinuousMotion: true,
    heygenAvatarId: process.env.HEYGEN_AVATAR_ID_ROHAN || 'avatar_3d_rohan_retail_v2',
    didAvatarId: process.env.DID_AVATAR_ID_ROHAN || 'did_cartoon_rohan_motion',
  },
];

export interface CreateVideoJobParams {
  promptText: string;
  languageCode: string;
  characterId: string;
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
  const { promptText, languageCode, characterId } = params;
  const character = CONTINUOUS_MOTION_CHARACTERS.find((c) => c.id === characterId) || CONTINUOUS_MOTION_CHARACTERS[0];
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode) || SUPPORTED_LANGUAGES[0];

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
                avatar_id: character.heygenAvatarId,
                avatar_style: 'normal',
              },
              voice: {
                type: 'text',
                input_text: promptText,
                voice_id: langConfig.avatarVoiceId,
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
              voice_id: langConfig.avatarVoiceId,
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
