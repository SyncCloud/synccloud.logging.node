import {Collection, Deferred} from '@synccloud/core';
import {Formatter, FormatSettings} from '@synccloud/core/src/formatting';
import {Json, JsonSettings} from '@synccloud/core/src/json';
import {Event} from './event';
import {TargetCollection} from './targets';

export class Logger {
    get environment() {
        return this._environment;
    }

    get application() {
        return this._application;
    }

    get version() {
        return this._version;
    }

    get branch() {
        return this._branch;
    }

    get targets() {
        return this._targets;
    }

    get jsonSettings() {
        return this._jsonSettings;
    }

    get formatSettings() {
        return this._formatSettings;
    }

    constructor({environment, application, version, branch}) {
        this._environment = environment;
        this._application = application;
        this._version = version;
        this._branch = branch;
        this._targets = new TargetCollection();
        this._jsonSettings = new JsonSettings();
        this._formatSettings = new FormatSettings();
        this._pending = [];
        this._scheduled = false;
    }

    //noinspection JSUnusedGlobalSymbols
    errorAsync(messageFn, reprFn) {
        return this._postAsync('error', messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    warnAsync(messageFn, reprFn) {
        return this._postAsync('warn', messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    infoAsync(messageFn, reprFn) {
        return this._postAsync('info', messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    debugAsync(messageFn, reprFn) {
        return this._postAsync('debug', messageFn, reprFn);
    }

    //noinspection JSUnusedGlobalSymbols
    traceAsync(messageFn, reprFn) {
        return this._postAsync('trace', messageFn, reprFn);
    }

    async serializeAsync(obj, settings) {
        return await Json.serializeAsync(
            obj, this.jsonSettings.mergeWith(settings));
    }

    async formatAsync(obj, settings) {
        return await Formatter.formatAsync(
            obj, this.formatSettings.mergeWith(settings));
    }

    _postAsync(level, messageFn, reprFn) {
        try {
            const event = new Event(this, level, messageFn, reprFn);
            const deferred = new Deferred();
            this._pending.push({deferred, event});
            if (!this._scheduled) {
                this._scheduled = true;
                (async () => {
                    try {
                        while (this._pending.length > 0) {
                            this._pending.sort(
                                ({event: {timestamp: a}}, {event: {timestamp: b}}) =>
                                    a.isBefore(b) ? -1 : (a.isAfter(b) ? 1 : 0));

                            const {deferred, event} = this._pending.shift();

                            await ((event) => {
                                return Promise.all(
                                    this.targets.map(async (target) => {
                                        try {
                                            if (await target.supportsAsync(event)) {
                                                const targeted = event.targeted(target);
                                                await target.postAsync(targeted);
                                            }
                                        }
                                        catch (exc) {
                                            console.warn('Failed to post event to target:');
                                            console.error(exc.stack || exc);
                                            console.warn('TARGET:', target);
                                            console.warn('EVENT:', event);
                                        }
                                    }));
                            })(event);

                            deferred.resolve();
                        }
                    }
                    finally {
                        this._scheduled = false;
                    }
                })();
            }
            deferred.promise;
        }
        catch (exc) {
            console.warn('Failed to log an event:');
            console.error(exc.stack || exc);
        }
    }
}
