export const hashAlgorithms = ["sha1", "sha256", "sha384", "sha512"] as const;
export type HashAlgorithm = (typeof hashAlgorithms)[number];

export const hashAlgorithmMeta: Record<
  HashAlgorithm,
  { pageTitle: string; metaDescription: string }
> = {
  sha1: {
    pageTitle: "SHA-1 Hash Generator — Free Online Tool | ToolNames",
    metaDescription:
      "Generate SHA-1 hashes instantly in your browser. Free, private, no data leaves your device. SHA-1 produces a 160-bit hash value.",
  },
  sha256: {
    pageTitle: "SHA-256 Hash Generator — Free Online Tool | ToolNames",
    metaDescription:
      "Generate SHA-256 hashes instantly in your browser. Free, private, no data leaves your device. SHA-256 is widely used and recommended.",
  },
  sha384: {
    pageTitle: "SHA-384 Hash Generator — Free Online Tool | ToolNames",
    metaDescription:
      "Generate SHA-384 hashes instantly in your browser. Free, private, no data leaves your device. SHA-384 offers stronger security than SHA-256.",
  },
  sha512: {
    pageTitle: "SHA-512 Hash Generator — Free Online Tool | ToolNames",
    metaDescription:
      "Generate SHA-512 hashes instantly in your browser. Free, private, no data leaves your device. SHA-512 provides maximum cryptographic strength.",
  },
};
