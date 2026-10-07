# The first design — kept on purpose

This is the white, minimal BVANTRIX site as it stood on 7 Oct 2026, before
the editorial redesign. Kept as plain files so it can be looked at without
digging through git.

The same point in history is also at:

```
git tag    design-v1
git branch design-v1-backup
```

## Putting it back

```bash
git checkout design-v1-backup -- index.html css/style.css js/main.js
```

Or go all the way back:

```bash
git reset --hard design-v1
```
