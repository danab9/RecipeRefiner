# Generate your own SECRET_KEY

You need your own `SECRET_KEY` in your local `.env` file. Don't use the one that's
in there now — that's the production key and it shouldn't be sitting on our laptops.

It's just a random string Django uses to sign login cookies. Yours is yours alone.
It doesn't need to match mine, or the server's, or anyone's.

---

## 1. Open Terminal

Cmd+Space → type `Terminal` → Enter.

You don't need Docker running for this part.

## 2. Generate the key

Paste this in and hit Enter:

```bash
python3 -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits+'!@#\$%^&*(-_=+)') for _ in range(50)))"
```

It prints one long line of random characters, something like:

```
V4Kud#mv3%%$N_6NGu-h5%KxR-K-KSbbYEld#zMnkXOLVwVi@J
```

Copy the whole line.

## 3. Put it in `.env`

Open the `.env` file in the **project root** (not in `onboarding/`) and change the
`SECRET_KEY` line to:

```
SECRET_KEY=<the line you just copied>
```

No quotes. No spaces around the `=`.

## 4. Restart the backend

Only needed if you actually run the backend locally. In Terminal, from the project
folder:

```bash
docker compose up -d --force-recreate
```

`--force-recreate` matters. `.env` is only read when the container is **created**, so
a normal restart would keep using the old key.

If you're not running the backend right now, skip this — the new key applies the next
time you start it.

---

## That's it

You'll be logged out of your local app once. That's expected: the old session cookie
was signed with the old key, so Django no longer recognises it. Just log in again.

**Two rules:** don't commit `.env`, and don't paste its contents into chat.
