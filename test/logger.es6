import fs from 'fs';
import path from 'path';
import {Logger} from '../src/logger';
import {ConsoleTarget, StreamTarget} from '../src/targets';

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
        await logger.infoAsync(
            () => ({
                msg: 'Hello',
                name: Promise.resolve('World!')
            }),
            ({m, f}) => f`${m.msg}, ${m.name}`);
    }
    catch (exc) {
        console.error(exc.stack || exc);
    }
})();
