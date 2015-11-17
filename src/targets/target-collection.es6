import {Collection} from '@synccloud/core';
import {ConsoleTarget} from './console-target';

export class TargetCollection extends Collection {
    get consoleTarget() {
        return this.firstOrDefault((x) => x instanceof ConsoleTarget);
    }
}
