// XOR obfuscation — not cryptographically secure, just prevents plain-text keys in localStorage
const XOR_KEY = "toolnames-ai-key-obfuscation-salt";

export function obfuscate(text: string): string {
  const keyChars = XOR_KEY.split("").map((c) => c.charCodeAt(0));
  return btoa(
    text
      .split("")
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ keyChars[i % keyChars.length]))
      .join("")
  );
}

export function deobfuscate(encoded: string): string {
  try {
    const keyChars = XOR_KEY.split("").map((c) => c.charCodeAt(0));
    return atob(encoded)
      .split("")
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ keyChars[i % keyChars.length]))
      .join("");
  } catch {
    return "";
  }
}

export function saveKey(providerId: string, key: string): void {
  if (!key) {
    localStorage.removeItem(`apikey_${providerId}`);
    return;
  }
  localStorage.setItem(`apikey_${providerId}`, obfuscate(key));
}

export function loadKey(providerId: string): string {
  const stored = localStorage.getItem(`apikey_${providerId}`);
  return stored ? deobfuscate(stored) : "";
}

export function clearKey(providerId: string): void {
  localStorage.removeItem(`apikey_${providerId}`);
}
