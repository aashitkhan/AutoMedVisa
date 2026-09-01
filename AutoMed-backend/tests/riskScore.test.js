const {
  levenshteinDistance,
  similarityScore,
  findBestMatch,
  calculateRiskScore
} = require('../utils/riskScore');

describe('levenshteinDistance', () => {
  test('identical strings have distance 0', () => {
    expect(levenshteinDistance('driver', 'driver')).toBe(0);
  });

  test('completely different strings have expected distance', () => {
    expect(levenshteinDistance('cat', 'dog')).toBe(3);
  });

  test('is case-insensitive', () => {
    expect(levenshteinDistance('Driver', 'driver')).toBe(0);
  });
});

describe('similarityScore', () => {
  test('identical strings score 1', () => {
    expect(similarityScore('mechanic', 'mechanic')).toBe(1);
  });

  test('near-identical strings score highly', () => {
    const score = similarityScore('Heavy Vehicle Driver', 'Heavy Vehicle  Driver');
    expect(score).toBeGreaterThan(0.9);
  });
});

describe('findBestMatch', () => {
  test('finds the closest role in a list', () => {
    const roles = ['Auto Mechanic', 'Taxi Driver', 'Fleet Supervisor'];
    const { bestMatch } = findBestMatch('Taxi Driverr', roles);
    expect(bestMatch).toBe('Taxi Driver');
  });
});

describe('calculateRiskScore', () => {
  const driverVisaCategory = {
    visaCategoryName: 'Light Motor Vehicle Driver',
    allowedJobRoles: ['Taxi Driver', 'Delivery Driver', 'LMV Driver'],
    disallowedJobRoles: ['Heavy Truck Operator', 'Auto Mechanic'],
    riskWeight: 5
  };

  test('legitimate matching job title produces low risk', () => {
    const result = calculateRiskScore('Taxi Driver', driverVisaCategory);
    expect(result.isMatch).toBe(true);
    expect(result.riskLevel).toBe('Low');
    expect(result.riskScore).toBeLessThan(25);
  });

  test('explicit disallowed role produces critical risk', () => {
    const result = calculateRiskScore('Auto Mechanic', driverVisaCategory);
    expect(result.isMatch).toBe(false);
    expect(result.riskScore).toBeGreaterThanOrEqual(50);
    expect(['High', 'Critical']).toContain(result.riskLevel);
    expect(result.mismatchReasons.length).toBeGreaterThan(0);
  });

  test('unrelated job title produces a mismatch', () => {
    const result = calculateRiskScore('Software Engineer', driverVisaCategory);
    expect(result.isMatch).toBe(false);
    expect(result.riskScore).toBeGreaterThan(0);
  });
});
