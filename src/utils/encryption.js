const crypto = require('crypto');

const encryptFile = async (file, password) => {
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(64);
  const key = crypto.pbkdf2Sync(password, salt, 3000, 32, 'sha512');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(file), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]);
};

const decryptFile = async (file, password) => {
  console.log(file);
  const salt = file.subarray(0, 64);
  const iv = file.subarray(64, 80);
  const tag = file.subarray(80, 96);
  const data = file.subarray(96);

  const key = crypto.pbkdf2Sync(password, salt, 3000, 32, 'sha512');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  try {
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = { encryptFile, decryptFile };
