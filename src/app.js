const Logger = require("./lib/Logger");
const Core = require("./lib/Core");

process.on("unhandledRejection", (reason, promise) => {
    Logger.error(Logger.Type.Watchdog, "Unhandled rejection", {
        stack: reason?.stack,
    });
});

async function shutdown() {
    try {
        await Core.shutdown();

        // Need to exit here because otherwise the process would stay open
        process.exit(0);
    } catch (error) {
        Logger.error(Logger.Type.Watchdog, "An unknown error occured while shutting down:", error);
        process.exit(1);
    }
}

// Signal termination handler - used if the process is killed
process.on("SIGTERM", shutdown);

// Signal interrupt handler - if the process is aborted by Ctrl + C (during dev)
process.on("SIGINT", shutdown);

process.on("uncaughtException", (error, origin) => {
    Logger.error(Logger.Type.Watchdog, "Uncaught exception", { error, origin });

    shutdown().catch(() => { /* intentional */ });
});

process.on("exit", (code) => {
    if (code !== 0) {
        Logger.error(Logger.Type.Watchdog, `Stacktrace that lead to the process exiting with code ${code}:`, new Error().stack);
        return;
    }
   
    Logger.info(Logger.Type.Watchdog, `Exiting with code ${code}...`);
});