const UNTITLED_PROJECT_PREFIX = "Projeto Sem Nome";

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function formatUntitledName(sequence: number) {
  return `${UNTITLED_PROJECT_PREFIX} ${String(sequence).padStart(3, "0")}`;
}

export function getUniqueProjectName(
  requestedName: string | undefined,
  existingNames: string[],
) {
  const usedNames = new Set(existingNames.map(normalizeName));
  const cleanedName = requestedName?.trim();

  if (cleanedName && !usedNames.has(normalizeName(cleanedName))) {
    return cleanedName;
  }

  if (cleanedName) {
    let copyIndex = 2;
    let nextName = `${cleanedName} ${String(copyIndex).padStart(3, "0")}`;

    while (usedNames.has(normalizeName(nextName))) {
      copyIndex += 1;
      nextName = `${cleanedName} ${String(copyIndex).padStart(3, "0")}`;
    }

    return nextName;
  }

  let sequence = 1;
  let generatedName = formatUntitledName(sequence);

  while (usedNames.has(normalizeName(generatedName))) {
    sequence += 1;
    generatedName = formatUntitledName(sequence);
  }

  return generatedName;
}
