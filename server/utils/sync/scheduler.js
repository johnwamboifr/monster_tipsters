// server/utils/sync/scheduler.js

import cron from "node-cron";

import {
  FOOTBALL_COMPETITIONS,

  runFootballSync,

  runLeagueSync,

  runTeamSync,

  runFixtureSync,

  runStandingSync,

  runResultSync,
} from "./footballSyncService.js";

/**
 * ============================================================
 * LOGGING
 * ============================================================
 */

const logScheduler = (
  message,
  context = {}
) => {
  console.log(
    "[Football Scheduler]",
    {
      message,
      ...context,
    }
  );
};

/**
 * ============================================================
 * STATE
 * ============================================================
 */

let scheduledJobs = [];

let schedulerRunning =
  false;

let synchronizationRunning =
  false;

/**
 * ============================================================
 * SAFE SYNC EXECUTION
 * ============================================================
 *
 * Every scheduled synchronization passes through this lock.
 *
 * Therefore:
 *
 * fixture sync cannot run at the same time as
 * standings sync, team sync, result sync, etc.
 */

const runLockedTask = async (
  name,
  task
) => {
  if (
    synchronizationRunning
  ) {
    logScheduler(
      `Skipping ${name}; another synchronization is already running.`
    );

    return {
      success: false,
      skipped: true,
      reason:
        "another_sync_running",
    };
  }

  synchronizationRunning =
    true;

  const startedAt =
    Date.now();

  try {
    logScheduler(
      `Starting ${name}`
    );

    const result =
      await task();

    logScheduler(
      `Completed ${name}`,
      {
        durationMs:
          Date.now() -
          startedAt,

        result,
      }
    );

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error(
      `[Football Scheduler] ${name} failed`,
      {
        message:
          error?.message,

        stack:
          error?.stack,
      }
    );

    return {
      success: false,
      error:
        error?.message,
    };
  } finally {
    synchronizationRunning =
      false;
  }
};

/**
 * ============================================================
 * FULL SYNC
 * ============================================================
 */

export const runScheduledFullSync =
  async () =>
    runLockedTask(
      "full football synchronization",
      runFootballSync
    );

/**
 * ============================================================
 * START SCHEDULER
 * ============================================================
 */

export const startScheduler =
  () => {
    if (
      schedulerRunning
    ) {
      logScheduler(
        "Scheduler is already running."
      );

      return scheduledJobs;
    }

    schedulerRunning =
      true;

    logScheduler(
      "Starting football scheduler",
      {
        competitions:
          FOOTBALL_COMPETITIONS,
      }
    );

    /**
     * --------------------------------------------------------
     * LEAGUES
     * --------------------------------------------------------
     *
     * Every 12 hours.
     */

    const leagueJob =
      cron.schedule(
        "0 */12 * * *",
        async () => {
          await runLockedTask(
            "scheduled league synchronization",
            runLeagueSync
          );
        }
      );

    /**
     * --------------------------------------------------------
     * TEAMS
     * --------------------------------------------------------
     *
     * Every 12 hours.
     */

    const teamJob =
      cron.schedule(
        "15 */12 * * *",
        async () => {
          await runLockedTask(
            "scheduled team synchronization",
            runTeamSync
          );
        }
      );

    /**
     * --------------------------------------------------------
     * FIXTURES
     * --------------------------------------------------------
     *
     * Every 2 hours.
     */

    const fixtureJob =
      cron.schedule(
        "30 */2 * * *",
        async () => {
          await runLockedTask(
            "scheduled fixture synchronization",
            runFixtureSync
          );
        }
      );

    /**
     * --------------------------------------------------------
     * STANDINGS
     * --------------------------------------------------------
     *
     * Every 3 hours.
     */

    const standingJob =
      cron.schedule(
        "10 */3 * * *",
        async () => {
          await runLockedTask(
            "scheduled standing synchronization",
            runStandingSync
          );
        }
      );

    /**
     * --------------------------------------------------------
     * RESULTS
     * --------------------------------------------------------
     *
     * Every 15 minutes.
     */

    const resultJob =
      cron.schedule(
        "*/15 * * * *",
        async () => {
          await runLockedTask(
            "scheduled result synchronization",
            runResultSync
          );
        }
      );

    scheduledJobs = [
      leagueJob,
      teamJob,
      fixtureJob,
      standingJob,
      resultJob,
    ];

    logScheduler(
      "Football scheduler started",
      {
        jobs:
          scheduledJobs.length,
      }
    );

    return scheduledJobs;
  };

/**
 * ============================================================
 * STOP SCHEDULER
 * ============================================================
 */

export const stopScheduler =
  () => {
    if (
      !scheduledJobs.length
    ) {
      schedulerRunning =
        false;

      logScheduler(
        "No scheduled jobs are running."
      );

      return;
    }

    for (
      const job of
        scheduledJobs
    ) {
      try {
        job.stop();
      } catch (
        error
      ) {
        console.error(
          "[Football Scheduler] Failed to stop job",
          {
            message:
              error?.message,
          }
        );
      }
    }

    scheduledJobs = [];

    schedulerRunning =
      false;

    logScheduler(
      "Football scheduler stopped."
    );
  };

/**
 * ============================================================
 * INITIAL SYNC
 * ============================================================
 */

export const runInitialSync =
  async () => {
    return runLockedTask(
      "initial football synchronization",
      runFootballSync
    );
  };

/**
 * ============================================================
 * START SCHEDULED SYNC
 * ============================================================
 *
 * Starts cron immediately and performs the initial
 * synchronization in the background.
 */

export const startScheduledSync =
  () => {
    const jobs =
      startScheduler();

    /**
     * Do not block Express startup.
     */
    runInitialSync()
      .then(
        (result) => {
          logScheduler(
            "Background initial synchronization completed",
            {
              result,
            }
          );
        }
      )
      .catch(
        (error) => {
          console.error(
            "[Football Scheduler] Background initial synchronization failed",
            {
              message:
                error?.message,

              stack:
                error?.stack,
            }
          );
        }
      );

    return jobs;
  };

export default {
  startScheduler,

  stopScheduler,

  runScheduledFullSync,

  runInitialSync,

  startScheduledSync,
};
