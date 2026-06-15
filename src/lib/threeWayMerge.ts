import { diffArrays } from "diff";

export interface MergeOutcome {
  content: string;
  hasConflict: boolean;
}

const splitLines = (text: string): string[] => text.split("\n");

const segmentsEqual = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * Map every base line index to its matching line index on `other`
 * (or -1 when the line was changed/removed). Built from the LCS that
 * `diffArrays` produces, so matches are monotonic — exactly what a
 * three-way merge needs to find stable anchors.
 */
const matchBaseToOther = (base: string[], other: string[]): number[] => {
  const map = new Array<number>(base.length).fill(-1);
  let baseIndex = 0;
  let otherIndex = 0;

  for (const part of diffArrays(base, other)) {
    if (part.added) {
      otherIndex += part.count ?? part.value.length;
    } else if (part.removed) {
      baseIndex += part.count ?? part.value.length;
    } else {
      const count = part.count ?? part.value.length;
      for (let k = 0; k < count; k++) {
        map[baseIndex + k] = otherIndex + k;
      }
      baseIndex += count;
      otherIndex += count;
    }
  }

  return map;
};

/**
 * Line-based three-way (diff3) merge — the same model Git uses.
 *
 * Non-overlapping edits from both sides are combined automatically;
 * only regions changed by BOTH sides relative to the common ancestor
 * produce a conflict (wrapped in standard `<<<<<<<`/`=======`/`>>>>>>>`
 * markers). `ours` corresponds to the branch you are on (HEAD/target),
 * `theirs` to the branch being merged in (source).
 */
export const threeWayMerge = (
  baseText: string,
  oursText: string,
  theirsText: string,
  ourLabel: string,
  theirLabel: string
): MergeOutcome => {
  const base = splitLines(baseText);
  const ours = splitLines(oursText);
  const theirs = splitLines(theirsText);

  const ourMatch = matchBaseToOther(base, ours);
  const theirMatch = matchBaseToOther(base, theirs);

  const out: string[] = [];
  let hasConflict = false;
  let baseIndex = 0;
  let ourIndex = 0;
  let theirIndex = 0;

  // Resolve the changed region between two stable anchors.
  const flush = (ourEnd: number, theirEnd: number, baseEnd: number) => {
    const ourSeg = ours.slice(ourIndex, ourEnd);
    const theirSeg = theirs.slice(theirIndex, theirEnd);
    const baseSeg = base.slice(baseIndex, baseEnd);

    if (segmentsEqual(ourSeg, theirSeg)) {
      out.push(...ourSeg); // both sides made the same edit
    } else if (segmentsEqual(theirSeg, baseSeg)) {
      out.push(...ourSeg); // only our side changed this region
    } else if (segmentsEqual(ourSeg, baseSeg)) {
      out.push(...theirSeg); // only their side changed this region
    } else {
      hasConflict = true;
      out.push(`<<<<<<< ${ourLabel}`);
      out.push(...ourSeg);
      out.push("=======");
      out.push(...theirSeg);
      out.push(`>>>>>>> ${theirLabel}`);
    }

    ourIndex = ourEnd;
    theirIndex = theirEnd;
    baseIndex = baseEnd;
  };

  while (baseIndex < base.length) {
    // Advance to the next base line that is unchanged on BOTH sides.
    let anchor = baseIndex;
    while (
      anchor < base.length &&
      !(ourMatch[anchor] !== -1 && theirMatch[anchor] !== -1)
    ) {
      anchor++;
    }
    if (anchor >= base.length) break;

    flush(ourMatch[anchor], theirMatch[anchor], anchor);
    out.push(base[anchor]);
    ourIndex = ourMatch[anchor] + 1;
    theirIndex = theirMatch[anchor] + 1;
    baseIndex = anchor + 1;
  }

  // Region trailing the last shared anchor.
  flush(ours.length, theirs.length, base.length);

  return { content: out.join("\n"), hasConflict };
};
