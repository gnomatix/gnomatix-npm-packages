# AGENTS.md

<!-- push-mirror-notice:start (IT, checked 2026-11-17T04:04Z) -->
> **NB: READ THIS BEFORE YOU CLONE, COMMIT OR PUSH**
>
> **This repository has a push-mirror entry in Gitea that pushes it to GitHub. Push code to the authoritative repo. While that mirror is running, pushes go to the Gitea repo: a mirror sync makes GitHub match Gitea, so a commit pushed only to GitHub is overwritten.**
>
> | | |
> |---|---|
> | Gitea repo (the mirror pushes from here) | https://gitea.gnomatix.com/gnomatix/npm-packages |
> | GitHub repo (the mirror pushes to here) | https://github.com/brettwhitty/gnomatix-npm-packages |
> | Push mirror setting in Gitea | An entry from Gitea to GitHub exists: no timed sync, sync on commit is on, last ran 2026-11-17T03:12:58Z, no error recorded. |
> | Branch `main` on the two sides | Both sides are at `72519df2f2`. |
>
> These facts were read from the live repos at 2026-11-17T04:04Z. They may not be true now. A mirror can be switched off and this notice will still be here. Check them yourself before you clone or push:
>
> 1. Have the GNOMATIX OSS skills installed, including `staleness-guard` (`/plugin install staleness-guard@gnomatix-oss-skills`).
> 2. Run `staleness-guard` on the table above, against the live repos, not this file:
>    - `git ls-remote https://gitea.gnomatix.com/gnomatix/npm-packages.git refs/heads/main`
>    - `git ls-remote https://github.com/brettwhitty/gnomatix-npm-packages.git refs/heads/main`
>    - `GET https://gitea.gnomatix.com/api/v1/repos/gnomatix/npm-packages/push_mirrors`
> 3. If the mirror is running and the two sides match, clone from, commit to and push to the Gitea repo only. Never push to GitHub. Gitea does that.
> 4. If the two sides do not match, or the mirror is not running, stop. Do not push to either side until the repo's owner has said which one takes the work.
> 5. No Gitea access? Ask IT (it@gnomatix.com). Do not use the owner's GitHub credentials, and do not work from GitHub instead.
> 6. Already worked from a GitHub clone? Keep that work, delete nothing on either side, and tell IT the repo, branch and commit.
<!-- push-mirror-notice:end -->
