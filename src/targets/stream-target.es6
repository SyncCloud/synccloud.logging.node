import _ from 'lodash';
import colors from 'colors';
import {indent} from '@synccloud/core/src/helpers';
import {TargetBase} from './target-base';

export class StreamTarget extends TargetBase {
    get stream() {
        return this._stream;
    }

    constructor(stream) {
        super();
        this._stream = stream;
        this.jsonSettings.indent = 2;
    }

    async supportsAsync(event) {
        return true;
    }

    async postAsync(event) {
        const text = (await event.repr) || event.message.msg;
        if (text) {
            const level = _.padRight(event.level.toUpperCase(), 10);
            const timestamp = event.timestamp.format('HH:mm:ss.SSSSSSSSS');

            this.stream.write(`${level} [${timestamp}]\n  ${indent(text, '  ')}\n\n`);
        }
    }
}
