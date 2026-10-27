import { BloodGroup, Donor, DonorMatchCandidate } from '../types/bloodbank';

// Blood Compatibility Table for Red Blood Cell transfusions
export const COMPATIBLE_DONORS_MAP: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal Donor can only receive O-
};

export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const allowed = COMPATIBLE_DONORS_MAP[recipientGroup];
  return allowed ? allowed.includes(donorGroup) : false;
}

export function rankEmergencyDonors(
  donors: Donor[],
  targetBloodGroup: BloodGroup,
  targetCity: string
): DonorMatchCandidate[] {
  const candidates: DonorMatchCandidate[] = [];

  for (const donor of donors) {
    // Only evaluate donors with compatible blood
    const compatible = isBloodCompatible(donor.bloodGroup, targetBloodGroup);
    if (!compatible) continue;

    let score = 0;
    const reasons: string[] = [];
    const isDirectMatch = donor.bloodGroup === targetBloodGroup;
    const isUniversal = donor.bloodGroup === 'O-';

    // 1. Blood match points
    if (isDirectMatch) {
      score += 40;
      reasons.push(`Exact blood group match (${donor.bloodGroup})`);
    } else if (isUniversal) {
      score += 35;
      reasons.push(`Universal O- donor compatibility`);
    } else {
      score += 28;
      reasons.push(`Compatible blood type (${donor.bloodGroup} -> ${targetBloodGroup})`);
    }

    // 2. Availability score
    let availabilityScore = 0;
    if (donor.availabilityStatus === 'AVAILABLE') {
      availabilityScore = 30;
      reasons.push('Currently marked available for emergency callout');
    } else if (donor.availabilityStatus === 'ON_HOLD') {
      availabilityScore = 10;
      reasons.push('On temporary hold - requires check');
    } else {
      availabilityScore = 0;
      reasons.push('Marked unavailable');
    }
    score += availabilityScore;

    // 3. Eligibility verification
    let eligibilityScore = 0;
    if (donor.eligibilityStatus === 'ELIGIBLE') {
      eligibilityScore = 20;
      reasons.push('Medically verified and clearance active');
    } else if (donor.eligibilityStatus === 'PENDING_REVIEW') {
      eligibilityScore = 8;
      reasons.push('Medical check pending review');
    } else {
      eligibilityScore = 0;
      reasons.push('Currently medically ineligible');
    }
    score += eligibilityScore;

    // 4. City proximity
    const distanceCityMatch = donor.city.trim().toLowerCase() === targetCity.trim().toLowerCase();
    if (distanceCityMatch) {
      score += 10;
      reasons.push(`Same city / service area (${donor.city})`);
    } else {
      reasons.push(`Nearby region (${donor.city})`);
    }

    // 5. Days since last donation check
    if (!donor.lastDonationDate) {
      score += 5;
      reasons.push('First-time or unrecorded recent donation');
    } else {
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince >= 90) {
        score += 5;
        reasons.push(`Donation interval safe (${daysSince} days since last)`);
      } else {
        score -= 20;
        reasons.push(`Caution: Donated recently (${daysSince} days ago, < 90 days required)`);
      }
    }

    // Clamp score
    const finalScore = Math.max(5, Math.min(100, score));

    let recommendedPriority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (finalScore >= 80 && donor.availabilityStatus === 'AVAILABLE' && donor.eligibilityStatus === 'ELIGIBLE') {
      recommendedPriority = 'HIGH';
    } else if (finalScore >= 55) {
      recommendedPriority = 'MEDIUM';
    }

    candidates.push({
      donor,
      matchScore: finalScore,
      isDirectMatch,
      isUniversalDonor: isUniversal,
      distanceCityMatch,
      availabilityScore,
      eligibilityScore,
      matchReasons: reasons,
      recommendedPriority,
    });
  }

  // Sort descending by match score
  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}
