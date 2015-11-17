import moment from 'moment';
import {indent} from '@synccloud/core/src/helpers';

export function trace(target, name, descriptor) {
    if (typeof (descriptor.value) === 'function') {
        const func = descriptor.value;
        descriptor.value = function traced(...args) {
            const instance = this;
            trace.onEnter(target, name, descriptor, func, instance, args);
            let result;
            try {
                result = func.apply(instance, args);
            }
            catch (exc) {
                trace.onError(target, name, descriptor, func, instance, args, exc);
                throw exc;
            }
            trace.onSuccess(target, name, descriptor, func, instance, args, result);
            return result;
        };
        return descriptor;
    }
    throw new Error(`descriptor.value should be function, got ${typeof (descriptor.value)}`);
}

trace.async = function traceAsync(target, name, descriptor) {
    if (typeof (descriptor.value) === 'function') {
        const func = descriptor.value;
        descriptor.value = function traced(...args) {
            const instance = this;
            trace.onEnter(target, name, descriptor, func, instance, args);
            let result;
            try {
                result = func.apply(instance, args);
            }
            catch (exc) {
                trace.onError(target, name, descriptor, func, instance, args, exc);
                throw exc;
            }
            Promise.resolve(result).then(
                (result) => {
                    trace.onSuccess(target, name, descriptor, func, instance, args, result);
                },
                (reason) => {
                    trace.onError(target, name, descriptor, func, instance, args, reason);
                });
            return result;
        };
        return descriptor;
    }
    throw new Error(`descriptor.value should be function, got ${typeof (descriptor.value)}`);
};

trace.setup = (logger) => {
    trace.logger = logger;
};

trace.format = (obj) => {
    return trace.logger.format(obj);
};

trace.onEnter = (target, name, descriptor, func, instance, args) => {
    //console.log('trace.onEnter()', name, moment.utc().format('HH:mm:ss.SSSSSSSSS'));
    trace.logger.traceAsync(
        () => ({
            event: 'call',
            msg: `Entered method`,
            method: {
                target: target && {
                    name: target.name,
                    constructor: target.constructor && {
                        name: target.constructor.name
                    }
                },
                name: name
            },
            instance: instance,
            arguments: args
        }),
        async ({m, f}) =>
            await f`=> ${trace.formatSignature(f, m.method)}`
                + await trace.formatArguments(f, m.arguments)
                + await trace.formatInstance(f, m.instance));
};

trace.onError = (target, name, descriptor, func, instance, args, error) => {
    trace.logger.traceAsync(
        () => ({
            event: 'error',
            msg: `Method failed`,
            method: {
                target: target && {
                    name: target.name,
                    constructor: target.constructor && {
                        name: target.constructor.name
                    }
                },
                name: name
            },
            instance: instance,
            arguments: args,
            exception: error
        }),
        async ({m, f}) =>
            await f`!! ${trace.formatSignature(f, m.method)}`
                + await trace.formatArguments(f, m.arguments)
                + await trace.formatInstance(f, m.instance)
                + await trace.formatException(f, m.exception));
};

trace.onSuccess = (target, name, descriptor, func, instance, args, result) => {
    //console.log('trace.onSuccess()', name, moment.utc().format('HH:mm:ss.SSSSSSSSS'));
    trace.logger.traceAsync(
        () => ({
            event: 'exit',
            msg: `Exited method`,
            method: {
                target: target && {
                    name: target.name,
                    constructor: target.constructor && {
                        name: target.constructor.name
                    }
                },
                name: name
            },
            instance: instance,
            arguments: args,
            returnValue: result
        }),
        async ({m, f}) =>
            await f`<= ${trace.formatSignature(f, m.method)}`
                + await trace.formatArguments(f, m.arguments)
                + await trace.formatInstance(f, m.instance)
                + await trace.formatReturnValue(f, m.returnValue));
};

trace.formatSignature = (format, method) => {
    if (method.target && method.target.constructor && method.target.constructor.name) {
        return `${method.target.constructor.name}.${method.name}()`;
    }
    return `${method.name}()`;
};

trace.formatArguments = async (format, args) => {
    return args.length > 0 ? '\n' + await Promise.all(args.map((x, i) => trace.formatArgument(format, x, i))).join('\n') : '';
};

trace.formatArgument = async (format, arg, index) => {
    return `    args[${index}] = ${indent(await format(arg), '    ')}`;
};

trace.formatInstance = async (format, instance) => {
    return instance ? `\n    THIS = ${indent(await format(instance), '        ')}` : '';
};

trace.formatReturnValue = async (format, returnValue) => {
    return `\n    RESULT = ${indent(await format(returnValue), '             ')}`;
};

trace.formatException = async (format, exception) => {
    return `\n    ${indent(await format(exception), '    ')}`;
};
