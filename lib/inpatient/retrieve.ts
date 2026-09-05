import inpatientGuideData from "../knowledge-base/inpatient-symptom-guides.json";
import type { InpatientSymptomCategory, InpatientSymptomGuide } from "./types";

const guides = inpatientGuideData as InpatientSymptomGuide[];

export function getAllInpatientSymptomGuides(): InpatientSymptomGuide[] {
  return guides;
}

export function getInpatientSymptomGuide(
  category: InpatientSymptomCategory
): InpatientSymptomGuide | undefined {
  return guides.find((guide) => guide.category === category);
}
