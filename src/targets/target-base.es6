import _ from 'lodash';
import {Collection, NotImplementedError} from '@synccloud/core';
import {FormatSettings} from '@synccloud/core/src/formatting';
import {JsonSettings} from '@synccloud/core/src/json';

export class TargetBase {
    get jsonSettings() {
        return this._jsonSettings;
    }

    get formatSettings() {
        return this._formatSettings;
    }

    constructor() {
        this._jsonSettings = new JsonSettings();
        this._formatSettings = new FormatSettings();
    }

    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    async supportsAsync(event) {
        return false;
    }

    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    async postAsync(event) {
        throw new NotImplementedError();
    }

    //noinspection JSUnusedGlobalSymbols
    async serializeAsync(obj, settings, logger) {
        settings = this.jsonSettings.mergeWith(settings);
        return await logger.serializeAsync(obj, settings);
    }

    //noinspection JSUnusedGlobalSymbols
    async formatAsync(obj, settings, logger) {
        settings = this.formatSettings.mergeWith(settings);
        return await logger.formatAsync(obj, settings);
    }
}
