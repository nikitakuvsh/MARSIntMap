export const pick = (row, ...keys) => {
  for (const k of keys) {
    const v = row[k];

    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return v;
    }
  }

  return null;
};