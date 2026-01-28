
export interface AvatarConfig {
  id: string;
  color: string;
  faceType: number; // 0-5
}

export const AVATAR_PRESETS: AvatarConfig[] = [
  { id: 'pink_smile', color: '#ff1755', faceType: 0 },
  { id: 'green_wink', color: '#00d1b2', faceType: 3 },
  { id: 'yellow_surprise', color: '#ffdd57', faceType: 1 },
  { id: 'purple_squiggly', color: '#b86bff', faceType: 2 },
  { id: 'blue_dead', color: '#3273dc', faceType: 4 },
  { id: 'orange_starry', color: '#ff3860', faceType: 5 },
];

export const getAvatarConfig = (photoURL: string | null): AvatarConfig => {
  if (photoURL && photoURL.startsWith('avatar:')) {
    const id = photoURL.split(':')[1];
    return AVATAR_PRESETS.find(p => p.id === id) || AVATAR_PRESETS[0];
  }
  // Default fallback if no valid avatar or external URL (handled externally)
  return AVATAR_PRESETS[0]; // Default Pink Smile
};
