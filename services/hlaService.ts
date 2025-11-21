import type { HLATyping, HLACompatibility, HLAMismatchResult } from '../types';

/**
 * Normalizes an HLA allele string for comparison.
 * Strips common prefixes and suffixes, converts to uppercase, and keeps the core allele designation.
 * Example: "A*02:01" -> "A02:01", "DRB1*04:05" -> "DR04:05"
 * @param allele The raw allele string from input.
 * @returns A normalized string.
 */
const normalizeAllele = (allele: string): string => {
  if (!allele) return '';
  return allele
    .toUpperCase()
    .replace(/^HLA-/, '')
    .replace('DRB1*', 'DR')
    .replace('DQB1*', 'DQ')
    .replace('DPB1*', 'DP')
    .replace('*', '')
    .trim();
};

/**
 * Calculates the HLA compatibility between a donor and a recipient.
 * @param donorHla The donor's HLA typing.
 * @param recipientHla The recipient's HLA typing.
 * @returns A comprehensive HLACompatibility object with mismatch details and risk level.
 */
export const calculateHlaCompatibility = (donorHla: HLATyping, recipientHla: HLATyping): HLACompatibility => {
  const mismatchResult: HLAMismatchResult = {
    total: 0,
    class1: 0,
    class2: 0,
    details: { A: 0, B: 0, C: 0, DR: 0, DQ: 0, DP: 0 },
  };

  const loci: (keyof HLATyping)[] = ['A', 'B', 'C', 'DR', 'DQ', 'DP'];
  let allAllelesEntered = true;

  loci.forEach(locus => {
    const donorAlleles = (donorHla[locus] || ['', '']).map(normalizeAllele).filter(Boolean);
    const recipientAlleles = (recipientHla[locus] || ['', '']).map(normalizeAllele).filter(Boolean);

    if (donorAlleles.length < 2 || recipientAlleles.length < 2) {
        allAllelesEntered = false;
    }

    let locusMismatches = 0;
    // Check each donor allele against the recipient's alleles
    donorAlleles.forEach(donorAllele => {
      if (!recipientAlleles.includes(donorAllele)) {
        locusMismatches++;
      }
    });

    mismatchResult.details[locus] = locusMismatches;
    mismatchResult.total += locusMismatches;

    if (['A', 'B', 'C'].includes(locus)) {
      mismatchResult.class1 += locusMismatches;
    } else {
      mismatchResult.class2 += locusMismatches;
    }
  });
  
  if (!allAllelesEntered) {
    return {
        mismatchResult,
        matchRatio: `${12 - mismatchResult.total}/12`,
        riskLevel: 'Pending',
    };
  }

  let riskLevel: HLACompatibility['riskLevel'];
  if (mismatchResult.total === 0) {
    riskLevel = 'Identical';
  } else if (mismatchResult.total <= 2) {
    riskLevel = 'Low';
  } else if (mismatchResult.total <= 4) {
    riskLevel = 'Moderate';
  } else {
    riskLevel = 'High';
  }

  return {
    mismatchResult,
    matchRatio: `${12 - mismatchResult.total}/12`,
    riskLevel,
  };
};