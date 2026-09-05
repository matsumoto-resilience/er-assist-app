import kampoGuideData from "../knowledge-base/kampo-guides.json";
import type { KampoCategory, KampoGuide } from "./types";

const guides = kampoGuideData as KampoGuide[];

export function getAllKampoGuides(): KampoGuide[] {
  return guides;
}

export function getKampoGuide(category: KampoCategory): KampoGuide | undefined {
  return guides.find((guide) => guide.category === category);
}
