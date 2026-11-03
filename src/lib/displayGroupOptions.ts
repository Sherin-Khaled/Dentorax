import type { ProductDisplayGroupMember } from "../types/product.ts";

export type DisplayGroupChoice = {
  productId: string;
  slug: string;
  label: string;
  isAvailable: boolean;
};

const compact = (value: string) => value.toLowerCase().replace(/\s+/g, "");
const UNIT_WORD = /^(mm|cm|m|ml|l|ltr|liter|litre|g|gr|gm|gram|grams|kg|mg|mic|micron|microns|pc|pcs|piece|pieces|pack|packs|box|boxes|n|%|inch|مم|سم|مل|جم|جرام|قطعة|قطع|عبوة|لتر)$/i;

function labelsFromAttributes(members: ProductDisplayGroupMember[], language: string): string[] | null {
  const valuesByType = new Map<string, Set<string>>();
  for (const member of members) {
    for (const attribute of member.displayAttributes) {
      const values = valuesByType.get(attribute.type) ?? new Set<string>();
      values.add(attribute.valueEn);
      valuesByType.set(attribute.type, values);
    }
  }
  const varyingTypes = [...valuesByType].filter(([, values]) => values.size > 1).map(([type]) => type);
  if (varyingTypes.length === 0) return null;
  const labels = members.map((member) =>
    varyingTypes
      .map((type) => {
        const attribute = member.displayAttributes.find((candidate) => candidate.type === type);
        return attribute ? (language === "ar" && attribute.valueAr ? attribute.valueAr : attribute.valueEn) : "";
      })
      .filter(Boolean)
      .join(" · ")
  );
  // Every member must carry every varying attribute, or the labels would not compare like with like.
  const complete = members.every((member) => varyingTypes.every((type) => member.displayAttributes.some((attribute) => attribute.type === type)));
  return complete ? labels : null;
}

// What differs between the names: the words shared by every member are removed from both ends.
function labelsFromNames(names: string[]): string[] | null {
  const words = names.map((name) => name.trim().split(/\s+/));
  const shortest = Math.min(...words.map((list) => list.length));
  let start = 0;
  while (start < shortest && words.every((list) => list[start].toLowerCase() === words[0][start].toLowerCase())) start += 1;
  let end = 0;
  while (end < shortest - start && words.every((list) => list[list.length - 1 - end].toLowerCase() === words[0][words[0].length - 1 - end].toLowerCase())) end += 1;
  // A shared unit stays with its number: "21 mm" and "25 mm", never "21" and "25".
  while (end > 0 && UNIT_WORD.test(words[0][words[0].length - end])) end -= 1;
  const labels = words.map((list) => list.slice(start, list.length - end).join(" ").replace(/^[-–·,\s]+|[-–·,\s]+$/g, ""));
  return labels.every(Boolean) ? labels : null;
}

function isUsable(labels: string[] | null): labels is string[] {
  return Boolean(labels) && labels!.every(Boolean) && new Set(labels!.map(compact)).size === labels!.length;
}

/**
 * One choice per real member, each labelled with what sets it apart. Returns
 * an empty list when the members cannot be told apart, so a customer never has
 * to choose between identical labels: the page then shows no selector.
 */
export function deriveDisplayGroupChoices(members: ProductDisplayGroupMember[], language: string): DisplayGroupChoice[] {
  if (members.length < 2) return [];
  const fromAttributes = labelsFromAttributes(members, language);
  const fromArabicNames = language === "ar" && members.every((member) => member.nameAr) ? labelsFromNames(members.map((member) => member.nameAr as string)) : null;
  const fromNames = labelsFromNames(members.map((member) => member.name));
  const labels = [fromAttributes, fromArabicNames, fromNames].find(isUsable);
  if (!labels) return [];
  return members
    .map((member, index) => ({ productId: member.productId, slug: member.slug, label: labels[index], isAvailable: member.isAvailable }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }));
}
