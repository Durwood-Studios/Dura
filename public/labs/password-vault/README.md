# Password vault teaching lab 1.0.0

Use fictional credentials only. This is an executable lesson about authenticated encryption and transactional file updates, not an audited replacement for a password manager. No network requests or runtime dependencies are used. Requires Node.js 22 or later.

```sh
npm ci
npm test
npm start -- help
npm start -- init
npm start -- add Example student
npm start -- list Example
npm start -- generate 24
```

Run in a private disposable working directory. Each command opens that directory's `.teaching-vault/vault.enc`; master passphrases and entry passwords are requested through hidden terminal input. Do not put secrets in command arguments. Entry names/usernames are command arguments and are visible to shell history/process listings; only fictional examples belong here. Each command exits after completion; there is no cached unlocked session. Use the exact ID returned by `list` for `delete ID` or `copy ID`. `backup NEW_FILE` creates an encrypted snapshot and refuses to overwrite a file.

## What is exercised

- AES-256-GCM, a fresh random 12-byte nonce and 32-byte salt for each save, authenticated fixed-format metadata, PBKDF2-HMAC-SHA256 with a fixed 600,000-iteration format.
- Strict bounded envelope and plaintext validation before use, duplicate ID rejection, no automatic replacement of corrupt vaults.
- Cooperative exclusive lock, expected-file comparison, write/fsync temporary file, rename replacement. A failure before replacement leaves committed bytes unchanged. Stale app instances cannot overwrite a newer app save.
- Cryptographic password generation with finite integer length 16–128.
- Hidden TTY input handles pasted chunks, cancellation, errors, and EOF, restoring terminal mode. Piped passphrases are rejected.
- Clipboard cleanup compares the current value before requesting a clear. If it changed, the newer text is retained.

## Honest limits

File synchronization before rename is not a guarantee against every power-loss or filesystem failure; parent-directory fsync and platform-specific recovery are not implemented. Keep encrypted backups and test recovery with a disposable copy. In a separate disposable directory, create `.teaching-vault`, copy the encrypted backup to `.teaching-vault/vault.enc`, and run `node /absolute/path/to/extracted/password-vault/cli.mjs list` from that directory, using the actual CLI path and original passphrase. Do not run `npm start` in an empty recovery directory. A crashed process can leave a lock: investigate the stopped process before manually removing its lock. The lock is cooperative, not a defense against a malicious local process. Use a private trusted directory: filesystem symlink races, hostile same-user processes, malware, and offline rollback attacks are outside this lab.

Unix creation modes 0700/0600 are useful defaults, not a cross-platform ACL guarantee. Existing directories are not reconfigured. Clipboard adapters require macOS pbcopy/pbpaste, Windows PowerShell, or Linux Wayland wl-copy/wl-paste; Linux X11 is not implemented. Real OS clipboard integrations were not executed in automated tests. Clipboard history, interrupted processes, or the race between a clipboard read and write can retain/expose a value. There is no guaranteed secret erasure in JavaScript memory; clearing temporary Buffers cannot erase copies of strings.

The old tutorial format is incompatible: this lab never reads `~/.pwmanager` or imports an existing real vault. There is no password recovery, browser integration, audit certification, or claim that generated mixed-character strings satisfy every site's password policy. Missing optional URL/notes fields are intentional for the bounded schema, rather than silently discarded on import.

## Verification

`npm test` runs eight tests using public fictional fixtures and temporary directories. A separate Python PTY integration harness exercised initialize/add/search/backup/delete/reload and checked that hidden fixture input did not echo. The PTY result is macOS-specific; Windows/Linux terminal behavior remains manual validation. No real credentials or real system clipboard were accessed.

Primary references: [Node crypto](https://nodejs.org/docs/latest-v22.x/api/crypto.html), [Node filesystem](https://nodejs.org/docs/latest-v22.x/api/fs.html), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). OWASP's password-storage guidance is context for work-factor selection, not certification of this encrypted-vault design. The lab fixes its format parameters; benchmark your device instead of promising a fixed unlock latency.
