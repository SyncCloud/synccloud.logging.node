export class Log {
    static setup(logger) {
        Log.logger = logger;
    }

    static formatAsync(obj) {
        return Log.logger.formatAsync(obj);
    }

    //noinspection JSUnusedGlobalSymbols
    static infoAsync(messageFn, reprFn) {
        return Log.logger.infoAsync(messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    static debugAsync(messageFn, reprFn) {
        return Log.logger.debugAsync(messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    static errorAsync(messageFn, reprFn) {
        return Log.logger.errorAsync(messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    static warningAsync(messageFn, reprFn) {
        return Log.logger.warningAsync(messageFn, reprFn);
    }
}
