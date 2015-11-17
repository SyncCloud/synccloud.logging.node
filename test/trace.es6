import fs from 'fs';
import path from 'path';
import {trace} from '../src/decorators';
import {Logger} from '../src/logger';
import {ConsoleTarget, StreamTarget} from '../src/targets';

class Class {
    constructor() {
        this.name = 'wtf';
    }

    toJSON() {
        return {$type: 'Class'};
    }

    //noinspection JSMethodCanBeStatic
    @trace
    sync() {
        console.log('synced!');
        return 'synced';
    }

    //noinspection JSMethodCanBeStatic
    @trace
    async ['async']() {
        console.log('asynced!');
        return 'asynced';
    }
}

(async () => {
    try {
        const logger = new Logger({
            environment: 'staging',
            application: 'synccloud.logging.node',
            version: '0.0.1',
            branch: 'master'
        });
        logger.targets.append(new ConsoleTarget());
        logger.targets.append(new StreamTarget(fs.createWriteStream(path.join(__dirname, '../trace.log'))));
        trace.logger = logger;

        const instance = new Class();
        console.log('sync:', instance.sync());
        console.log('async:', await instance['async']());
    }
    catch (exc) {
        console.error(exc.stack || exc);
    }
})();
