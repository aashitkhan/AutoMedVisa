/**
 * riskScore.js
 * ------------------------------------------------------------------
 * Core algorithmic engine for VisaGuard.
 *
 * 1. levenshteinDistance() - classic DP edit-distance algorithm (DSA),
 *    used to fuzzy-match a worker's submitted job title against the
 *    list of job roles a visa category legitimately allows/disallows.
 *    This lets the system catch near-matches / typos / phrasing
 *    differences (e.g. "Heavy Truck Driver" vs "Heavy Vehicle Driver")
 *    instead of relying on brittle exact-string checks.
 *
 * 2. similarityScore() - normalizes edit distance into a 0-1 similarity.
 *
 * 3. calculateRiskScore() - weighted scoring algorithm that combines:
 *      - job-role match/mismatch severity
 *      - visa category base risk weight
 *      - presence in explicit disallowed list (hard flag)
 *    to produce a final 0-100 risk score and a risk level bucket.
 * ------------------------------------------------------------------
 */

// Dynamic-programming edit distance (Levenshtein)
function levenshteinDistance(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // delete
          dp[i][j - 1],     // insert
          dp[i - 1][j - 1]  // substitute
        );
      }
    }
  }
  return dp[m][n];
}

function similarityScore(a, b) {
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return 1 - distance / maxLen; // 1 = identical, 0 = completely different
}

// Find best fuzzy match for submittedTitle within a list of role strings.
// Returns { bestMatch, score } where score is 0-1 similarity.
function findBestMatch(submittedTitle, roleList) {
  let bestMatch = null;
  let bestScore = 0;
  for (const role of roleList) {
    const score = similarityScore(submittedTitle, role);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = role;
    }
  }
  return { bestMatch, score: bestScore };
}

const SIMILARITY_MATCH_THRESHOLD = 0.75; // >=75% similar counts as a legitimate match

/**
 * calculateRiskScore
 * @param {String} submittedJobTitle - job title from the worker's job offer
 * @param {Object} visaCategory - VisaCategory mongoose doc (allowedJobRoles, disallowedJobRoles, riskWeight)
 * @returns {Object} { isMatch, matchedVisaCategory, mismatchReasons, riskScore, riskLevel }
 */
function calculateRiskScore(submittedJobTitle, visaCategory) {
  const reasons = [];
  let riskScore = 0;

  // 1. Hard check: explicit disallowed role match (highest severity)
  const disallowedMatch = findBestMatch(submittedJobTitle, visaCategory.disallowedJobRoles || []);
  if (disallowedMatch.bestMatch && disallowedMatch.score >= SIMILARITY_MATCH_THRESHOLD) {
    reasons.push(
      `Job title "${submittedJobTitle}" closely matches a role explicitly disallowed under this visa category: "${disallowedMatch.bestMatch}".`
    );
    riskScore += 60 * visaCategory.riskWeight / 5; // heavily weighted
  }

  // 2. Positive check: does it fuzzy-match an allowed role?
  const allowedMatch = findBestMatch(submittedJobTitle, visaCategory.allowedJobRoles || []);
  const isMatch = allowedMatch.score >= SIMILARITY_MATCH_THRESHOLD;

  if (!isMatch) {
    reasons.push(
      `No sufficiently close match found between "${submittedJobTitle}" and allowed roles for this visa category (best similarity: ${(allowedMatch.score * 100).toFixed(1)}%).`
    );
    // scaled penalty: the further from any allowed role, the higher the risk
    riskScore += (1 - allowedMatch.score) * 40 * (visaCategory.riskWeight / 5);
  }

  // Clamp 0-100
  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  let riskLevel = 'Low';
  if (riskScore >= 75) riskLevel = 'Critical';
  else if (riskScore >= 50) riskLevel = 'High';
  else if (riskScore >= 25) riskLevel = 'Medium'
  return {
    isMatch,
    matchedVisaCategory: visaCategory.visaCategoryName,
    mismatchReasons: reasons,
    riskScore,
    riskLevel
  };
}

module.exports = {
  levenshteinDistance,
  similarityScore,
  findBestMatch,
  calculateRiskScore
};
