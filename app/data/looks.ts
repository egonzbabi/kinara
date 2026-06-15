import { img, PHOTO } from "./images";

export type Look = {
  id: string;
  num: string;
  name: string;
  image: string;
};

export const LOOKS: Look[] = [
  { id: "l1", num: "Look 01", name: "Amanecer suave", image: img(PHOTO.lookbookA, { w: 900, h: 1200 }) },
  { id: "l2", num: "Look 02", name: "Sendero largo", image: img(PHOTO.lookbookB, { w: 900, h: 1200 }) },
  { id: "l3", num: "Look 03", name: "Estudio en calma", image: img(PHOTO.lookbookC, { w: 900, h: 1200 }) },
  { id: "l4", num: "Look 04", name: "Ritmo propio", image: img(PHOTO.lookbookD, { w: 900, h: 1200 }) },
  { id: "l5", num: "Look 05", name: "Tarde de arcilla", image: img(PHOTO.editorial, { w: 900, h: 1200 }) },
  { id: "l6", num: "Look 06", name: "Después del entreno", image: img(PHOTO.heroSecondary, { w: 900, h: 1200 }) },
];
