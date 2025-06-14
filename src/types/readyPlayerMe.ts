
export interface RPMEventData {
  source: string;
  eventName: string;
  data: any;
}

export interface RPMAvatarData {
  url: string;
  id: string;
}

export interface RPMUserData {
  id: string;
  name?: string;
  email?: string;
}

export interface RPMFrameConfig {
  clearCache?: boolean;
  bodyType?: 'halfbody' | 'fullbody';
  quickStart?: boolean;
  language?: string;
}

export type RPMEventType = 
  | 'v1.frame.ready'
  | 'v1.avatar.exported'
  | 'v1.user.set'
  | 'v1.user.updated'
  | 'v1.asset.unlock'
  | 'v1.subscription.updated';

export interface RPMMessageHandler {
  onFrameReady?: () => void;
  onAvatarExported?: (avatarData: RPMAvatarData) => void;
  onUserSet?: (userData: RPMUserData) => void;
  onError?: (error: string) => void;
}
