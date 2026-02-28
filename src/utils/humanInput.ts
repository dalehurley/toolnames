/**
 * Module-level pub/sub for AI-initiated human input requests.
 * The ask_human tool calls requestHumanInput(), which returns a Promise
 * that resolves only when the user submits the HumanInputCard.
 */

export type HumanInputFieldType = "text" | "select" | "radio" | "checkbox";

export interface HumanInputField {
  key: string;
  type: HumanInputFieldType;
  label: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export type HumanInputAnswer = Record<string, string | string[]>;

export interface HumanInputRequest {
  id: string;
  /** Top-level question shown as card title */
  question: string;
  fields: HumanInputField[];
  resolve: (answer: HumanInputAnswer) => void;
  cancel: () => void;
}

type Listener = (req: HumanInputRequest | null) => void;
const listeners = new Set<Listener>();
let _active: HumanInputRequest | null = null;

/** Subscribe to human input requests. Fires immediately with current state.
 *  Returns an unsubscribe function. */
export function subscribeHumanInput(cb: Listener): () => void {
  listeners.add(cb);
  cb(_active);
  return () => {
    listeners.delete(cb);
  };
}

/** Called by the ask_human tool — creates a pending request and returns
 *  a Promise that resolves when the user submits the form. */
export function requestHumanInput(
  question: string,
  fields: HumanInputField[]
): Promise<HumanInputAnswer> {
  // Cancel any existing request first
  if (_active) {
    _active.cancel();
  }
  return new Promise((resolve, reject) => {
    _active = {
      id: Math.random().toString(36).slice(2),
      question,
      fields,
      resolve: (ans) => {
        _active = null;
        _notify(null);
        resolve(ans);
      },
      cancel: () => {
        _active = null;
        _notify(null);
        reject(new Error("Human input cancelled"));
      },
    };
    _notify(_active);
  });
}

export function getActiveHumanInput(): HumanInputRequest | null {
  return _active;
}

function _notify(req: HumanInputRequest | null) {
  for (const cb of listeners) cb(req);
}
