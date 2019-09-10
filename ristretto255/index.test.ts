import * as fc from "fast-check";
import { createHash } from "crypto";
import { RistrettoPoint, BASE_POINT } from ".";

async function sha512(message: Uint8Array) {
  const hash = createHash("sha512");
  hash.update(message);
  return Uint8Array.from(hash.digest());
}

function arrayToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map(a => a.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArray(hash: string) {
  hash = hash.length & 1 ? `0${hash}` : hash;
  const len = hash.length;
  const result = new Uint8Array(len / 2);
  for (let i = 0, j = 0; i < len - 1; i += 2, j++) {
    result[j] = parseInt(hash[i] + hash[i + 1], 16);
  }
  return result;
}

const PRIVATE_KEY = 0xa665a45920422f9d417e4867efn;
// const MESSAGE = ripemd160(new Uint8Array([97, 98, 99, 100, 101, 102, 103]));
const MESSAGE = new Uint8Array([
  135,  79, 153,  96,
  197, 210, 183, 169,
  181, 250, 211, 131,
  225, 186,  68, 113,
  158, 187, 116,  58
]);
// const WRONG_MESSAGE = ripemd160(new Uint8Array([98, 99, 100, 101, 102, 103]));
const WRONG_MESSAGE = new Uint8Array([
  88, 157, 140, 127,
  29, 160, 162,  75,
 192, 123, 115, 129,
 173,  72, 177, 207,
 194,  17, 175,  28
]);

describe("ristretto25519", () => {
  // it("should verify just signed message", async () => {
  //   await fc.assert(fc.asyncProperty(
  //     fc.hexa(),
  //     fc.bigInt(2n, ristretto25519.PRIME_ORDER),
  //     async (message, privateKey) => {
  //       const publicKey = await ristretto25519.getPublicKey(privateKey);
  //       const signature = await ristretto25519.sign(message, privateKey);
  //       expect(publicKey.length).toBe(32);
  //       expect(signature.length).toBe(64);
  //       expect(await ristretto25519.verify(signature, message, publicKey)).toBe(true);
  //     }),
  //    { numRuns: 1 }
  //   );
  // });
  // it("should not verify sign with wrong message", async () => {
  //   await fc.assert(fc.asyncProperty(
  //     fc.array(fc.integer(0x00, 0xff)),
  //     fc.array(fc.integer(0x00, 0xff)),
  //     fc.bigInt(2n, ristretto25519.PRIME_ORDER),
  //     async (bytes, wrongBytes, privateKey) => {
  //       const message = new Uint8Array(bytes);
  //       const wrongMessage = new Uint8Array(wrongBytes);
  //       const publicKey = await ristretto25519.getPublicKey(privateKey);
  //       const signature = await ristretto25519.sign(message, privateKey);
  //       expect(await ristretto25519.verify(signature, wrongMessage, publicKey)).toBe(
  //         bytes.toString() === wrongBytes.toString()
  //       );
  //     }),
  //    { numRuns: 1 }
  //   );
  // });
  // it("should sign and verify", async () => {
  //   const publicKey = await ristretto25519.getPublicKey(PRIVATE_KEY);
  //   const signature = await ristretto25519.sign(MESSAGE, PRIVATE_KEY);
  //   expect(await ristretto25519.verify(signature, MESSAGE, publicKey)).toBe(true);
  // });
  // it("should not verify signature with wrong public key", async () => {
  //   const publicKey = await ristretto25519.getPublicKey(12);
  //   const signature = await ristretto25519.sign(MESSAGE, PRIVATE_KEY);
  //   expect(await ristretto25519.verify(signature, MESSAGE, publicKey)).toBe(false);
  // });
  // it("should not verify signature with wrong hash", async () => {
  //   const publicKey = await ristretto25519.getPublicKey(PRIVATE_KEY);
  //   const signature = await ristretto25519.sign(MESSAGE, PRIVATE_KEY);
  //   expect(await ristretto25519.verify(signature, WRONG_MESSAGE, publicKey)).toBe(false);
  // });
  it("should follow the byte encodings of small multiples", () => {
    const encodingsOfSmallMultiples = [
      // This is the identity point
      "0000000000000000000000000000000000000000000000000000000000000000",
      // This is the basepoint
      "e2f2ae0a6abc4e71a884a961c500515f58e30b6aa582dd8db6a65945e08d2d76",
      // These are small multiples of the basepoint
      "6a493210f7499cd17fecb510ae0cea23a110e8d5b901f8acadd3095c73a3b919",
      "94741f5d5d52755ece4f23f044ee27d5d1ea1e2bd196b462166b16152a9d0259",
      "da80862773358b466ffadfe0b3293ab3d9fd53c5ea6c955358f568322daf6a57",
      "e882b131016b52c1d3337080187cf768423efccbb517bb495ab812c4160ff44e",
      "f64746d3c92b13050ed8d80236a7f0007c3b3f962f5ba793d19a601ebb1df403",
      "44f53520926ec81fbd5a387845beb7df85a96a24ece18738bdcfa6a7822a176d",
      "903293d8f2287ebe10e2374dc1a53e0bc887e592699f02d077d5263cdd55601c",
      "02622ace8f7303a31cafc63f8fc48fdc16e1c8c8d234b2f0d6685282a9076031",
      "20706fd788b2720a1ed2a5dad4952b01f413bcf0e7564de8cdc816689e2db95f",
      "bce83f8ba5dd2fa572864c24ba1810f9522bc6004afe95877ac73241cafdab42",
      "e4549ee16b9aa03099ca208c67adafcafa4c3f3e4e5303de6026e3ca8ff84460",
      "aa52e000df2e16f55fb1032fc33bc42742dad6bd5a8fc0be0167436c5948501f",
      "46376b80f409b29dc2b5f6f0c52591990896e5716f41477cd30085ab7f10301e",
      "e0c418f7c8d9c4cdd7395b93ea124f3ad99021bb681dfc3302a9d99a2e53e64e",
    ];
    let B = BASE_POINT;
    let P = RistrettoPoint.one();
    for (const encoded of encodingsOfSmallMultiples) {
      expect(arrayToHex(P.toBytes())).toBe(encoded);
      expect(arrayToHex(RistrettoPoint.fromBytes(hexToArray(encoded)).toBytes())).toBe(encoded);
      P = P.add(B);
    }
  });
  it("should not convert bad bytes encoding", () => {
    const badEncodings = [
      // These are all bad because they're non-canonical field encodings.
    "00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    "f3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    "edffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    // These are all bad because they're negative field elements.
    "0100000000000000000000000000000000000000000000000000000000000000",
    "01ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    "ed57ffd8c914fb201471d1c3d245ce3c746fcbe63a3679d51b6a516ebebe0e20",
    "c34c4e1826e5d403b78e246e88aa051c36ccf0aafebffe137d148a2bf9104562",
    "c940e5a4404157cfb1628b108db051a8d439e1a421394ec4ebccb9ec92a8ac78",
    "47cfc5497c53dc8e61c91d17fd626ffb1c49e2bca94eed052281b510b1117a24",
    "f1c6165d33367351b0da8f6e4511010c68174a03b6581212c71c0e1d026c3c72",
    "87260f7a2f12495118360f02c26a470f450dadf34a413d21042b43b9d93e1309",
    // These are all bad because they give a nonsquare x^2.
    "26948d35ca62e643e26a83177332e6b6afeb9d08e4268b650f1f5bbd8d81d371",
    "4eac077a713c57b4f4397629a4145982c661f48044dd3f96427d40b147d9742f",
    "de6a7b00deadc788eb6b6c8d20c0ae96c2f2019078fa604fee5b87d6e989ad7b",
    "bcab477be20861e01e4a0e295284146a510150d9817763caf1a6f4b422d67042",
    "2a292df7e32cababbd9de088d1d1abec9fc0440f637ed2fba145094dc14bea08",
    "f4a9e534fc0d216c44b218fa0c42d99635a0127ee2e53c712f70609649fdff22",
    "8268436f8c4126196cf64b3c7ddbda90746a378625f9813dd9b8457077256731",
    "2810e5cbc2cc4d4eece54f61c6f69758e289aa7ab440b3cbeaa21995c2f4232b",
    // These are all bad because they give a negative xy value.
    "3eb858e78f5a7254d8c9731174a94f76755fd3941c0ac93735c07ba14579630e",
    "a45fdc55c76448c049a1ab33f17023edfb2be3581e9c7aade8a6125215e04220",
    "d483fe813c6ba647ebbfd3ec41adca1c6130c2beeee9d9bf065c8d151c5f396e",
    "8a2e1d30050198c65a54483123960ccc38aef6848e1ec8f5f780e8523769ba32",
    "32888462f8b486c68ad7dd9610be5192bbeaf3b443951ac1a8118419d9fa097b",
    "227142501b9d4355ccba290404bde41575b037693cef1f438c47f8fbf35d1165",
    "5c37cc491da847cfeb9281d407efc41e15144c876e0170b499a96a22ed31e01e",
    "445425117cb8c90edcbc7c1cc0e74f747f2c1efa5630a967c64f287792a48a4b",
    // This is s = -1, which causes y = 0.
    "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    ];
    for (const badBytes of badEncodings) {
      expect(() => RistrettoPoint.fromBytes(hexToArray(badBytes))).toThrow();
    }
  });
  it("should create right points from hash", async () => {
    const labels = [
      "Ristretto is traditionally a short shot of espresso coffee",
      "made with the normal amount of ground coffee but extracted with",
      "about half the amount of water in the same amount of time",
      "by using a finer grind.",
      "This produces a concentrated shot of coffee per volume.",
      "Just pulling a normal shot short will produce a weaker shot",
      "and is not a Ristretto as some believe.",
    ];
    const encodedHashToPoints = [
      "3066f82a1a747d45120d1740f14358531a8f04bbffe6a819f86dfe50f44a0a46",
      "f26e5b6f7d362d2d2a94c5d0e7602cb4773c95a2e5c31a64f133189fa76ed61b",
      "006ccd2a9e6867e6a2c5cea83d3302cc9de128dd2a9a57dd8ee7b9d7ffe02826",
      "f8f0c87cf237953c5890aec3998169005dae3eca1fbb04548c635953c817f92a",
      "ae81e7dedf20a497e10c304a765c1767a42d6e06029758d2d7e8ef7cc4c41179",
      "e2705652ff9f5e44d3e841bf1c251cf7dddb77d140870d1ab2ed64f1a9ce8628",
      "80bd07262511cdde4863f8a7434cef696750681cb9510eea557088f76d9e5065",
    ];

    for (let i = 0; i < labels.length; i++) {
      const hash = await sha512(Buffer.from(labels[i]));
      const point = RistrettoPoint.fromHash(hash);
      expect(arrayToHex(point.toBytes())).toBe(encodedHashToPoints[i]);
    }
  });
});
