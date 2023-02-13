const { Transform } = require('stream');

class AppendInitVect extends Transform {
  constructor(initVect, authTag, opts) {
    super(opts);
    this.initVect = initVect;
    this.authTag = authTag;
    this.appended = false;
  }

  _transform(chunk, encoding, cb) {
    if (!this.appended) {
      this.push(this.initVect);
      this.push(this.authTag);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

module.exports = AppendInitVect;
