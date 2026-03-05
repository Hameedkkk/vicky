const crypto = require("crypto");

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || "0".repeat(64),
  "hex",
);

const encryptFile = (fileBuffer) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      ENCRYPTION_KEY,
      iv,
    );

    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted.toString("hex"),
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("File encryption failed");
  }
};

const decryptFile = (encryptedData, iv) => {
  try {
    const encryptedBuffer = Buffer.from(encryptedData, "hex");
    const ivBuffer = Buffer.from(iv, "hex");

    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      ENCRYPTION_KEY,
      ivBuffer,
    );

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("File decryption failed");
  }
};

module.exports = {
  encryptFile,
  decryptFile,
};
