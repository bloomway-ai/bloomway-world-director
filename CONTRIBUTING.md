# Contributing

Thank you for helping improve [Bloomway World Director](https://github.com/bloomway-ai/bloomway-world-director) (org **Bloomway AI Inc.**).

## License of contributions

Unless a file or pull request **explicitly** states another license, contributions you submit and maintainers accept are licensed under the project’s [MIT License](LICENSE), consistent with the rest of this repository.

- You must have the right to submit what you send (your own work, employer/client permission where required, or appropriately licensed third-party material).
- Do **not** submit employer, customer, or third-party **confidential** or **proprietary** material you are not allowed to publish.
- You **retain** copyright in your contributions. This project does **not** require assignment of copyright to Bloomway AI Inc.
- See [TRADEMARKS.md](TRADEMARKS.md) for brand use. Code under MIT does not grant trademark rights.

## Developer Certificate of Origin (DCO 1.1)

We use the unmodified [DCO 1.1](docs/DCO.md) (also at [developercertificate.org](https://developercertificate.org/)). By contributing, you certify the statements in the DCO.

**Sign every commit** with:

```bash
git commit -s -m "docs: update example README"
```

Your commit must include a line such as:

```text
Signed-off-by: Given Name <email@example.com>
```

`git commit -s` adds this automatically from `user.name` and `user.email`. It is **not** a cryptographic signature.

Pull requests are expected to contain DCO sign-offs on **new** commits. Maintainers will not rewrite published shared history just to add missing sign-offs, and will not sign off for other authors.

## What we welcome

- New example scenes and camera-move descriptions (screenshots or screen recordings from **this** OSS Studio blockout)
- Documentation translations: maintain the seven README locales listed in [README.md](README.md) (`README.en.md`, `README.zh-CN.md`, `README.ms.md`, `README.id.md`, `README.ja.md`, `README.ko.md`, `README.es.md`). App UI stays English in v0.1.
- Bug reports with repro steps
- Integrations that respect MIT, DCO, and [TRADEMARKS.md](TRADEMARKS.md)

## Pull request checks

CI runs install, `verify:example`, build, and `verify:studio-e2e` when triggered. PRs are also checked for **DCO sign-off** on commits introduced in the PR.

Do not add license terms in comments or docs that conflict with MIT for code in this repo.

## Optional contact

**info@bloomway.ai** — alignment on larger changes or co-development (**voluntary**, not a condition of contributing).
