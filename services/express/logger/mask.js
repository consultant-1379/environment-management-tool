class Mask {
  constructor(log) {
    this.log = log;
  }

  info(...args) {
    return this.log.info(...args);
  }

  debug(...args) {
    return this.log.info(...args);
  }

  error(...args) {
    return this.log.info(...args);
  }
}

module.exports = Mask;
