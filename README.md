# October 10: RSVP site

Plain HTML, CSS and JS. Hosted on GitHub Pages at https://october-10.aagamsheth.com

Files: `index.html`, `style.css`, `app.js`, `CNAME`, `.nojekyll`, and `mail/Code.gs` (the mailer, which is NOT uploaded to GitHub).

## Why there is no iCloud password in app.js
Everything in `app.js` is public once it is on GitHub, and browsers cannot send email themselves.
A password in that file would let anyone read it. So the email is sent by a tiny free script that runs
on Google's servers (`mail/Code.gs`). The website only knows that script's URL, which is not a secret.

Each RSVP sends two emails:
1. To you (at your iCloud address): the guest's name, email, phone, plus 1 and notes. Replying goes to the guest.
2. To the guest: the invite card, "your RSVP is confirmed", and the calendar file (.ics) attached.

## 1. Set up the mailer (about 5 minutes, free)
1. Go to https://script.google.com and create a New project. Use any Google account. Emails are sent from it, with "Aagam Sheth" as the sender name.
2. Delete the sample code and paste in everything from `mail/Code.gs`.
3. At the top, set `OWNER_EMAIL` to your iCloud address. Check the other settings too.
4. Click Deploy -> New deployment -> type "Web app".
   - Execute as: Me
   - Who has access: Anyone
5. Click Deploy and approve the permissions (it asks to send email on your behalf). If Google warns the app is unverified, choose Advanced -> Go to project. It's your own script.
6. Copy the Web app URL.

## 2. Connect the website
Open `app.js` and set the URL at the top:

```js
const MAIL = {
  scriptUrl: 'https://script.google.com/macros/s/XXXX/exec'
};
```

Until you do this, the form runs in preview mode: everything animates, but no email is sent.
If you change `Code.gs` later, use Deploy -> Manage deployments -> Edit -> New version.

## 3. Put it on GitHub Pages
1. Create a repository named `october-10`. Upload `index.html`, `style.css`, `app.js`, `CNAME`, `.nojekyll`. (`mail/` can stay out.)
2. Settings -> Pages -> Deploy from a branch -> `main` / root.
3. Custom domain: `october-10.aagamsheth.com`. Turn on Enforce HTTPS when offered.

## 4. Point your domain at GitHub
At your DNS provider for `aagamsheth.com`:

| Type  | Host / Name | Value                              |
|-------|-------------|------------------------------------|
| CNAME | october-10  | `<your-github-username>.github.io` |

## Test before sending the invite
Submit a test RSVP with your own email, once with "Just me" and once with a plus 1. Check your iCloud inbox
and the test guest inbox (and spam) for both emails, and open the calendar file.

## Good to know
- The calendar times assume India Standard Time (7:30 pm to 10:30 pm).
- Google allows about 100 emails a day on a free account. Each RSVP uses 2, and the script caps itself at 40 RSVPs a day.
- The script rejects bad input, ignores bots (hidden field), and allows one RSVP per email per minute.
