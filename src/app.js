const Logger = require("./lib/Logger");
const Core = require("./lib/Core");

/**
 * Create a new instance of the Core class.
 * @type {Core}
 */
const core = new Core();

/**
 * Handle unhandled Promise rejections by logging the error.
 * @event
 * @param {any} reason - The reason for the unhandled rejection.
 * @param {Promise} promise - The unhandled Promise.
 */
process.on("unhandledRejection", (reason, promise) => {
    core.getLogger().error(Logger.Type.Watchdog, "unhandledRejection", {
        reason: reason,
        stack: reason?.stack,
        promise: promise
    });
});

/**
 * An asynchronous function to gracefully terminate the process.
 * @function
 * @async
 */
async function shutdown() {
    try {
        /**
         * Shutdown the application gracefully.
         * @method
         * @async
         */
        await core.shutdown();

        // Exit the process with a status code of 0 (success) after a successful shutdown.
        process.exit(0);
    } catch (err) {
        // Handle errors that occur during shutdown.
        core.getLogger().error(Logger.Type.Watchdog, "Error occurred: ", err.name, " - ", err.message);
        core.getLogger().error(Logger.Type.Watchdog, err.stack);

        // Exit the process with a status code of 1 (error) if an error occurred during shutdown.
        process.exit(1);
    }
}

/**
 * Signal termination handler - used if the process is killed (e.g., SIGTERM signal).
 * @event
 */
process.on("SIGTERM", shutdown);

/**
 * Signal interrupt handler - used if the process is aborted by Ctrl + C (e.g., SIGINT signal, during development).
 * @event
 */
process.on("SIGINT", shutdown);

/**
 * Handle uncaught exceptions by logging the error and triggering the shutdown process.
 * @event
 * @param {Error} err - The uncaught exception error.
 * @param {string} origin - The origin of the exception.
 */
process.on("uncaughtException", (err, origin) => {
    core.getLogger().error(Logger.Type.Watchdog, "Uncaught Exception", {
        err: err,
        origin: origin
    });

    // Trigger the shutdown process and ignore any errors that may occur during shutdown.
    shutdown().catch(() => {
        /* intentional */
    });
});

/**
 * Handle the exit event of the process to log the stack trace if it exits with a non-zero status code.
 * @event
 * @param {number} code - The exit status code.
 */
process.on("exit", function(code) {
    if (code !== 0) {
        core.getLogger().error(Logger.Type.Watchdog, "Stack trace that led to the process exiting with code " + code + ":", new Error().stack);
    } else {
        core.getLogger().info(Logger.Type.Watchdog, "Exiting with code " + code + "...");
    }
});
