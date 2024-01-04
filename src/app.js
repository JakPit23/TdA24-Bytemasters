const Logger = require("./lib/Logger");
const Core = require("./lib/Core");

/**
 * Handle unhandled Promise rejections by logging the error.
 * @param {any} reason - The reason for the unhandled rejection.
 * @param {Promise} promise - The unhandled Promise.
 */
process.on("unhandledRejection", (reason, promise) => {
    Core.getLogger().error(Logger.Type.Watchdog, "Unhandled rejection occured:", {
        reason,
        stack: reason?.stack,
        promise,
    });
});

/**
 * An asynchronous function to gracefully terminate the process.
 * @async
 */
async function shutdown() {
    try {
        process.exit(0);
    } catch (error) {
        Core.getLogger().error(Logger.Type.Watchdog, "An error occured during shutdown: ", {
            name: error.name,
            stack: error.stack,
        });

        process.exit(1);
    }
}

// Signal termination handler - used if the process is killed (e.g., SIGTERM signal).
process.on("SIGTERM", shutdown);

// Signal interrupt handler - used if the process is aborted by Ctrl + C (e.g., SIGINT signal, during development).
process.on("SIGINT", shutdown);

/**
 * Handle uncaught exceptions by logging the error and triggering the shutdown process.
 * @param {Error} error - The uncaught exception error.
 * @param {string} origin - The origin of the exception.
 */
process.on("uncaughtException", (error, origin) => {
    Core.getLogger().error(Logger.Type.Watchdog, "Uncaught exception occured:", {
        error,
        origin,
    });

    // Trigger the shutdown process and ignore any errors that may occur during shutdown.
    shutdown().catch(() => {});
});

/**
 * Handle the exit event of the process to log the stack trace if it exits with a non-zero status code.
 * @param {number} code - The exit status code.
 */
process.on("exit", (code) => {
    if (code !== 0) {
        Core.getLogger().error(Logger.Type.Watchdog, "Stack trace that led to the process exiting with code " + code + ":", new Error().stack);
        return;
    }
   
    Core.getLogger().info(Logger.Type.Watchdog, "Exiting with code " + code + "...");
});
