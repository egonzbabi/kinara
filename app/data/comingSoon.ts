export type ComingSoonItem = {
  slug: string;
  name: string;
  /** Base del archivo en /public/proximamente — se arma {base}-480.webp / {base}-800.webp. */
  imageBase: string;
};

// Prendas nuevas todavía sin dar de alta como producto real (sin precio, color
// ni stock definidos) — solo vista previa en el home (tarea 122). No confundir
// con el catálogo de Supabase: cuando una de estas prendas esté lista para
// vender, se da de alta ahí como cualquier producto y se quita de esta lista.
export const COMING_SOON_ITEMS: ComingSoonItem[] = [
  { slug: "enterizo-eclipse-fit", name: "Enterizo Eclipse Fit", imageBase: "enterizo-eclipse-fit" },
  { slug: "flexi-liston-tshirt", name: "Flexi Listón T-Shirt", imageBase: "flexi-liston-tshirt" },
  { slug: "motion-top", name: "Motion Top", imageBase: "motion-top" },
  { slug: "nova-wrap-top", name: "Nova Wrap Top", imageBase: "nova-wrap-top" },
  { slug: "move-enterizo", name: "Move Enterizo", imageBase: "move-enterizo" },
  { slug: "enterizo-sculpt-one", name: "Enterizo Sculpt One", imageBase: "enterizo-sculpt-one" },
  { slug: "enterizo-sprint-one", name: "Enterizo Sprint One", imageBase: "enterizo-sprint-one" },
  { slug: "aura-legging", name: "Eclipse Legging", imageBase: "aura-legging" },
  { slug: "aura-skirt-set", name: "Aura Skirt Set", imageBase: "aura-skirt-set" },
  { slug: "pulse-jacket", name: "Pulse Jacket", imageBase: "pulse-jacket" },
  { slug: "aura-flow-pants", name: "Aura Flow Pants", imageBase: "aura-flow-pants" },
];
