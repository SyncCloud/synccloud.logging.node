import _ from 'lodash';
import colors from 'colors';
import {indent} from '@synccloud/core/src/helpers';
import {TargetBase} from './target-base';

const writeToOut = console.log.bind(console);
const writeToErr = console.warn.bind(console);

export class ConsoleTarget extends TargetBase {
    constructor() {
        super();
        this.jsonSettings.indent = 2;
    }

    async supportsAsync(event) {
        // return event.level !== 'trace';
        return true;
    }

    async postAsync(event) {
        const text = (await event.repr) || event.message.msg;
        if (text) {
            const level = _.padRight(event.level.toUpperCase(), 10);
            const timestamp = event.timestamp.format('HH:mm:ss.SSSSSSSSS');

            //noinspection JSUnusedLocalSymbols
            let color = _.identity;
            let method = writeToOut;

            switch (event.level) {
                case 'info': {
                    color = colors.green.bind(colors);
                    break;
                }
                case 'trace': {
                    color = colors.gray.bind(colors);
                    break;
                }
                case 'debug': {
                    color = colors.magenta.bind(colors);
                    break;
                }
                case 'error': {
                    color = colors.red.bind(colors);
                    method = writeToErr;
                    break;
                }
                case 'warning': {
                    color = colors.yellow.bind(colors);
                    method = writeToErr;
                    break;
                }
            }

            method(`${color(`${level} [${timestamp}]`)}\n  ${indent(text, '  ')}\n`);
        }
    }
}
