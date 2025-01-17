export type ImageType = {
  id: string;
  src: string;
  tier: string | null;
};

export interface Tier {
  id: string;
  name: string;
  color: string;
  images: ImageType[];
}
