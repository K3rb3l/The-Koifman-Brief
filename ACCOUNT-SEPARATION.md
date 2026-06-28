# Account Separation — Do-On-Your-Mac Checklist

These steps live on your Mac (GitHub logins, SSH keys, local secret files), so they
can't be done from a cloud session — do them in Terminal / VS Code. Work top to bottom.

## The problem we're fixing

Two **independent** identity systems were both pointed at *work* even while you work
on *personal* repos:

| Layer | Was set to | Should be (personal repos) |
| --- | --- | --- |
| Claude AI (`/status` in the extension) | shahar@theconspectus.com (Conspectus) | koifsha (API key) |
| GitHub (active `gh` account) | shahar-cio | shahark79 |

Three GitHub accounts are logged in on this Mac: `shahar-cio` (work),
`shahark79` (personal, owns ExMas), and `shaharkoifman` (personal — your own name,
likely an old one you forgot).

> The repo-side guard is already done: `.gitignore` now blocks
> `.claude/settings.local.json` and `.vscode/settings.local.json`, so a personal API
> key can never be committed.

---

## 1. Sort out the `shaharkoifman` account

It's almost certainly yours (it's literally your name). Confirm, then keep or remove.

Confirm which accounts `gh` holds:

```
gh auth status
```

If you don't want `shaharkoifman` on this machine, remove just that one:

```
gh auth logout --user shaharkoifman
```

Leave `shahar-cio` (work) and `shahark79` (personal) logged in.

---

## 2. Re-home the Koifman Brief to your own account

Right now the repo lives under your friend's account (`k3rb3l`). Move it under
`shahark79` so it stops borrowing someone else's identity.

From inside the project folder:

```
gh auth switch --user shahark79
git remote rename origin k3rb3l-origin
gh repo create shahark79/the-koifman-brief --private --source=. --remote=origin --push
```

Push every branch (so this `claude/...` branch comes along too):

```
git push origin --all
```

After this, `git remote -v` should show `origin` pointing at
`github.com/shahark79/the-koifman-brief`.

---

## 3. Make Claude use koifsha (not work) in this repo

Get an API key from **console.anthropic.com** while signed in as **koifsha**
(API Keys → Create Key — it starts with `sk-ant-`).

Create the file `.claude/settings.local.json` in the project root. It is gitignored,
so the key is never committed:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-PASTE-YOUR-KOIFSHA-KEY-HERE"
  }
}
```

Restart VS Code, open the Claude panel, and run `/status`. It must show it's using an
**API key** — not the work email. (An API key overrides the work subscription for this
repo only; work repos with no such file stay on work.)

> Never paste the key into chat or any committed file. Only this gitignored file.

---

## 4. Stop GitHub identities from "changing hands" (durable fix)

`gh` only allows one *active* account at a time, so pushes can go out under whichever
account happens to be active. SSH host aliases remove that ambiguity — each repo's
remote URL names its own identity, so there's no active-account to get wrong.

### 4a. Create per-account SSH keys (skip a key you already have)

```
ssh-keygen -t ed25519 -C "shahark79"  -f ~/.ssh/id_ed25519_personal
ssh-keygen -t ed25519 -C "shahar-cio" -f ~/.ssh/id_ed25519_work
```

Load them into the macOS keychain:

```
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
```

### 4b. Add each public key to the matching GitHub account

Copy the personal public key:

```
pbcopy < ~/.ssh/id_ed25519_personal.pub
```

Paste it at **github.com/settings/keys** while signed in as **shahark79**.
Repeat with `id_ed25519_work.pub` while signed in as **shahar-cio**.

### 4c. Add SSH aliases

Open `~/.ssh/config` (create it if missing) and add:

```
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes

Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
  IdentitiesOnly yes
```

### 4d. Point each repo's remote at the right alias

Personal repo (e.g. the Brief):

```
git remote set-url origin git@github.com-personal:shahark79/the-koifman-brief.git
```

Work repo:

```
git remote set-url origin git@github.com-work:<work-org>/<repo>.git
```

Test the personal one:

```
ssh -T git@github.com-personal
```

It should greet you as **shahark79**.

---

## 5. Make commit author names correct automatically (optional but recommended)

Organize repos by folder, e.g. `~/dev/personal/` and `~/dev/work/`, then let git pick
the right name/email by location.

In `~/.gitconfig` add:

```
[includeIf "gitdir:~/dev/personal/"]
  path = ~/.gitconfig-personal
[includeIf "gitdir:~/dev/work/"]
  path = ~/.gitconfig-work
```

Create `~/.gitconfig-personal`:

```
[user]
  name = shahark79
  email = phqqnt4bsy@privaterelay.appleid.com
```

Create `~/.gitconfig-work`:

```
[user]
  name = shahar-cio
  email = <your-work-email>
```

(Keep the Apple private-relay email for personal if you want commits to hide your real
address.)

---

## Verify everything

Inside a personal repo:

```
git remote -v
git config user.email
ssh -T git@github.com-personal
```

- remote → `github.com-personal:shahark79/...`
- email → your personal email
- ssh greeting → `shahark79`

And in the VS Code Claude panel: `/status` → **API key** (koifsha), not the work email.

When all four read personal, you're fully separated: work and personal can't grab each
other's wheel.
