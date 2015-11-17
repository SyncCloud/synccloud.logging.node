import moment from 'moment';

export class Event {
    get logger() {
        return this._logger;
    }

    get environment() {
        return this.logger.environment;
    }

    get application() {
        return this.logger.application;
    }

    get version() {
        return this.logger.version;
    }

    get branch() {
        return this.logger.branch;
    }

    get timestamp() {
        return this._timestamp;
    }

    get level() {
        return this._level;
    }

    get message() {
        return this._message || (this._message = this._messageFn());
    }

    get repr() {
        return void 0;
    }

    get json() {
        return this._json || (this._json =
            this.logger.json.serializeAsync(this));
    }

    constructor(logger, level, messageFn, reprFn, inherit) {
        if (!inherit) {
            this._logger = logger;
            this._level = level;
            this._messageFn = messageFn;
            this._reprFn = reprFn;
            this._timestamp = moment.utc();
        }
    }

    toJSON() {
        return {
            environment: this.environment,
            application: this.application,
            version: this.version,
            branch: this.branch,
            timestamp: this.timestamp,
            level: this.level
        }
    }

    targeted(target) {
        return new TargetedEvent(this, target);
    }
}

export class TargetedEvent extends Event {
    get proto() {
        return this._proto;
    }

    get target() {
        return this._target;
    }

    get logger() {
        return this.proto.logger;
    }

    get environment() {
        return this.proto.environment;
    }

    get application() {
        return this.proto.application;
    }

    get version() {
        return this.proto.version;
    }

    get branch() {
        return this.proto.branch;
    }

    get timestamp() {
        return this.proto.timestamp;
    }

    get level() {
        return this.proto.level;
    }

    get message() {
        return this.proto.message;
    }

    get json() {
        return this.proto.json;
    }

    get repr() {
        if (this.proto._reprFn !== void 0 && this._repr === void 0) {
            const format = async (strings, ...values) => {
                if (!Array.isArray(strings) || !Array.isArray(strings.raw)) {
                    return await this.target.formatAsync(
                        await Promise.resolve(strings), null, this.logger);
                }
                values = await Promise.all(values);
                values = values.map((x) => this.target
                    .formatAsync(x, null, this.logger));
                values = await Promise.all(values);
                return String.raw(strings, ...values);
            };
            this._repr = format(this.proto._reprFn({
                e: this,
                m: this.message,
                f: format,
                event: this,
                message: this.message,
                format: format
            }));
        }
        return this._repr;
    }

    constructor(event, target) {
        super(null, null, null, null, true);
        this._proto = event;
        this._target = target;
    }
}
