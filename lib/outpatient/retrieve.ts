import outpatientGuideData from "../knowledge-base/outpatient-symptom-guides.json";
import type { OutpatientCategory, OutpatientSymptomGuide } from "./types";

const guides = outpatientGuideData as OutpatientSymptomGuide[];

export function getAllOutpatientSymptomGuides(): OutpatientSymptomGuide[] {
  return guides;
}

export function getOutpatientSymptomGuide(
  category: OutpatientCategory
): OutpatientSymptomGuide | undefined {
  return guides.find((guide) => guide.category === category);
}
