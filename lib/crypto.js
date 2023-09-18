const EthCrypto = require('eth-crypto');
  function recoverPublicKey(signedHash, message) {
    const signer = EthCrypto.recoverPublicKey(
        signedHash, // signature
        EthCrypto.hash.keccak256(message) // message hash
    );
    return signer;
}

  function publicKeyToAddress(pubKey) {
    const address = EthCrypto.publicKey.toAddress(
        pubKey
  );
    return address;
  }
  async function encryptWithPublicKey(pubKey, stringifyInfo) {
    const encrypted = await EthCrypto.encryptWithPublicKey(
        pubKey, // publicKey
        stringifyInfo // message
    ); 
    const encryptedStr = EthCrypto.cipher.stringify(encrypted);
    return encryptedStr;
}
module.exports = {recoverPublicKey, publicKeyToAddress, encryptWithPublicKey}