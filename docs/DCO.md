# Developer Certificate of Origin (DCO) 1.1

Contributions to **Bloomway World Director** use the [Developer Certificate of Origin, version 1.1](https://developercertificate.org/), reproduced below **without modification**.

---

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

---

## How to sign off

Add a `Signed-off-by` trailer to **each commit** that contains your contribution. This is a statement that you agree to the DCO above. It is **not** a cryptographic signature and does not require paid e-sign services.

```bash
git commit -s -m "fix(studio): clarify home preset labels"
```

Example commit message body:

```
fix(studio): clarify home preset labels

Signed-off-by: Alex Example <alex@example.com>
```

Use the name and email you are comfortable publishing in the git history.

Maintainers may refuse commits that lack `Signed-off-by` on new contributions. **Do not** sign off on behalf of others, and **do not** rewrite shared history solely to add sign-offs to old commits.
