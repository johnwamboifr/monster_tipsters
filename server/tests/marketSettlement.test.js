import assert from 'node:assert/strict';
import test from 'node:test';

import {
  settlePrediction,
  normalizeMarketName,
  normalizeSelection,
  canonicalizeSeason,
} from '../utils/marketSettlement.js';

import { canAccessPlan, getPlanRank, normalizePlanName } from '../utils/planEntitlements.js';

test('canonicalizes season strings consistently', () => {
  assert.equal(canonicalizeSeason('2026'), '2026/27');
  assert.equal(canonicalizeSeason('2026/27'), '2026/27');
  assert.equal(canonicalizeSeason('2026/26'), '2026/27');
  assert.equal(canonicalizeSeason('2025/26'), '2025/26');
});

test('normalizes betting market and selection names', () => {
  assert.equal(normalizeMarketName('Match Winner'), 'MATCH_WINNER');
  assert.equal(normalizeMarketName('match_winner'), 'MATCH_WINNER');
  assert.equal(normalizeMarketName('Over 2.5'), 'TOTAL_GOALS');
  assert.equal(normalizeSelection('OV2.5'), 'OV2.5');
  assert.equal(normalizeSelection('OVER_2_5'), 'OV2.5');
  assert.equal(normalizeSelection('Draw'), 'DRAW');
});

test('settles match winner correctly', () => {
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'MATCH_WINNER', selection: 'HOME' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'MATCH_WINNER', selection: 'DRAW' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'MATCH_WINNER', selection: 'AWAY' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 0, awayScore: 2, market: 'MATCH_WINNER', selection: 'AWAY' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 1, awayScore: 1, market: 'MATCH_WINNER', selection: 'DRAW' }), 'WON');
});

test('settles double chance markets', () => {
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'DOUBLE_CHANCE', selection: 'DC1X' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'DOUBLE_CHANCE', selection: 'DC12' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'DOUBLE_CHANCE', selection: 'DCX2' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 1, awayScore: 1, market: 'DOUBLE_CHANCE', selection: 'DC1X' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 1, awayScore: 1, market: 'DOUBLE_CHANCE', selection: 'DC12' }), 'LOST');
});

test('settles total goals markets', () => {
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'TOTAL_GOALS', selection: 'OV2.5' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'TOTAL_GOALS', selection: 'UN2.5' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'TOTAL_GOALS', selection: 'OV3.5' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'TOTAL_GOALS', selection: 'UN3.5' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 0, awayScore: 0, market: 'TOTAL_GOALS', selection: 'UN0.5' }), 'WON');
});

test('settles both teams to score and team goals markets', () => {
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'BTTS', selection: 'GG' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'BTTS', selection: 'NG' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'BTTS', selection: 'GG' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'HOME_TEAM_TOTAL_GOALS', selection: 'HOME_OV1.5' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'HOME_TEAM_TOTAL_GOALS', selection: 'HOME_OV2.5' }), 'LOST');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'AWAY_TEAM_TOTAL_GOALS', selection: 'AWAY_OV0.5' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 1, market: 'AWAY_TEAM_TOTAL_GOALS', selection: 'AWAY_OV1.5' }), 'LOST');
});

test('settles draw no bet and correct score', () => {
  assert.equal(settlePrediction({ homeScore: 1, awayScore: 1, market: 'DRAW_NO_BET', selection: 'DNB_HOME' }), 'VOID');
  assert.equal(settlePrediction({ homeScore: 1, awayScore: 1, market: 'DRAW_NO_BET', selection: 'DNB_AWAY' }), 'VOID');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'CORRECT_SCORE', selection: '2-0' }), 'WON');
  assert.equal(settlePrediction({ homeScore: 2, awayScore: 0, market: 'CORRECT_SCORE', selection: '1-1' }), 'LOST');
});

test('plan entitlement checks follow the subscription ladder', () => {
  assert.equal(getPlanRank('FREE'), 0);
  assert.equal(getPlanRank('SILVER'), 1);
  assert.equal(getPlanRank('BRONZE'), 2);
  assert.equal(getPlanRank('GOLD'), 3);
  assert.equal(normalizePlanName('silver plan'), 'SILVER');
  assert.equal(canAccessPlan('FREE', 'SILVER'), false);
  assert.equal(canAccessPlan('SILVER', 'SILVER'), true);
  assert.equal(canAccessPlan('BRONZE', 'SILVER'), true);
  assert.equal(canAccessPlan('GOLD', 'BRONZE'), true);
  assert.equal(canAccessPlan('GOLD', 'GOLD'), true);
});
