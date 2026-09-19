# Upload the project to your GitHub account

Target repository: https://github.com/vanshnahata667/kaal-darshnam (public).
The existing local and remote Git histories must be preserved.
Do not upload `.env.local`, passwords, service-role keys, personal uploads,
`node_modules`, build output or `.sites-runtime`.

## Recommended: GitHub Desktop

1. Sign into your own account in GitHub Desktop.
2. Choose File > Add local repository and select `D:\INTEMPLE`.
3. Review changed files. Keep local credentials and generated files out of the commit.
4. Commit the reviewed project changes.
5. Use the existing `vanshnahata667/kaal-darshnam` repository and push your commit.
6. Confirm the repository contains `app`, `lib`, `supabase`, `scripts`, `public`,
   package files, `.env.example`, and setup documentation.

## Command-line alternative

Create an empty repository in your GitHub account without a generated README.
Authenticate through Git Credential Manager when Git prompts; do not paste tokens
into chat or embed credentials in the remote URL. Review the staged diff before committing.

```powershell
cd D:\INTEMPLE
git status
git add app lib supabase scripts README.md SUPABASE-SETUP.md GITHUB-SETUP.md .gitignore
git diff --cached --stat
git commit -m "Expand heritage catalogue and prepare Supabase setup"
git remote add origin https://github.com/YOUR-USERNAME/kaal-darshan.git
git push -u origin HEAD
```

If a remote already exists, inspect `git remote -v` instead of replacing it blindly.
This uploads source code, not your Supabase database or dashboard permissions.
Publishing a repository does not automatically deploy this server-based application;
GitHub Pages alone does not run its API routes.

Official guide: https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
