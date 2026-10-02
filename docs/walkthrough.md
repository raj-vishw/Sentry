# Walkthrough — How This Website Works

A plain-language tour of the whole site, for anyone who just wants to know
"what do I click and what happens." No technical background needed. If
you're looking for admin setup/config details instead, see
[`getting-started.md`](getting-started.md) or
[`administration/overview.md`](administration/overview.md).

## What this website is

It's a platform for playing CTFs ("Capture The Flag" — cybersecurity
puzzle competitions). You solve challenges, get points, and climb a
leaderboard. Instead of normal web pages, it's designed to feel like
logging into your own little computer — windows you can open, move around,
and close, a dock at the bottom, a clock, all inside your browser.

## The very first thing you'll see

- **If no one has set this site up yet**, you'll see a "System
  Initialization" screen asking you to create the admin account. This only
  happens once, the very first time the site is ever used. If you're just
  a regular visitor, you won't see this.
- **Otherwise**, you'll land on the homepage with a **Login** and
  **Create account** button.

## Creating an account

Click **Create account**, pick a username, enter your email and a
password, confirm the password, and submit. You're logged in right away —
no email confirmation step. If registration has been turned off by an
admin, you'll see a clear message saying so instead.

## Logging in

Click **Login**, enter your username or email and your password. If you
get it wrong, you'll just see "Invalid credentials" — it won't tell you
whether the username exists or the password was wrong, on purpose (that's
a security thing, not a bug).

## Your desktop

Once you're logged in, you're on your **desktop** — this is the main
screen you'll spend most of your time on. A few things on it:

- **Icons** — double-click one to open that app, same as any computer.
  You can drag them around to rearrange them; right-click the empty
  desktop to reset the layout or open the quick menu.
- **Windows** — when you open something, it shows up in its own window.
  You can drag it by its title bar, resize it from the edges, minimize it,
  maximize it, or close it with the three buttons in the top-right corner.
- **The dock** — the bar at the bottom shows your currently open
  windows, so you can jump between them.
- **The top bar** — shows the clock and quick access to notifications
  and your account.
- **Ctrl+K** (or Cmd+K on Mac) opens a quick search box — type a few
  letters of anything (a challenge name, "leaderboard", "settings") to
  jump straight to it without hunting through menus.

## Challenges — the main thing you're here for

Open the **Challenges** app (sometimes called "Explore" or "Laboratory").
You'll see a list of challenges, grouped by category (Web, Crypto,
Forensics, Reverse Engineering, Pwn, OSINT, Cloud, Mobile) and difficulty
(Easy, Medium, Hard, Insane).

Click one to open it. You'll see:

- A description of the puzzle.
- Any **files** attached — click to download them (zip files, binaries,
  images, whatever the challenge needs).
- **Hints** — some are free, some cost a few of your points to reveal.
  Unlocking a hint is permanent for you; it doesn't go away if you log out.
- A box to **type your flag and submit it**. If it's right, you get
  points immediately and the challenge shows as solved. If it's wrong,
  nothing bad happens — just try again (though submitting too fast too
  many times in a row will briefly slow you down, to stop guessing
  scripts).
- Sometimes you'll see **"First blood: someone's username"** — that just
  means that person was the very first to solve it. It's a bragging-rights
  thing, not extra points.

### Locked challenges

Some challenges show a little lock icon and can't be opened yet — this
means you need to solve a different, specific challenge first to unlock
it. The challenge will tell you exactly which one to solve first.

### Badges

As you solve challenges, hit milestones, or do certain things (like
publish a writeup or found a team), you'll automatically earn **badges**.
You'll get a small pop-up notification when this happens, and you can see
all your badges on your profile.

## Leaderboard

Open the **Leaderboard** app to see everyone's ranking by points. You can
switch between all-time, this week, and this month. If you're on a team,
there's a team ranking too. Your own row is always easy to spot, and even
if you're far down the list, the page will show you where you currently
stand.

## Teams

Open the **Teams** app. You can:

- **Create a team** — gives you an invite code to share with friends.
- **Join a team** — type in someone else's invite code.
- See your team's combined score and who's on it.

You don't have to be on a team to play — solo points and ranking work the
same either way.

## Writeups

A writeup is a short article explaining how you solved a challenge,
written after the fact to help others learn. You can write one from a
solved challenge's page. It goes to an admin for approval before anyone
else can read it — once approved, it's public, and other people (even
without an account) can read it.

## Your profile

Open **Profile** to see your own stats: points, rank, how many challenges
you've solved, your current streak (days in a row with at least one
solve), your badges, and your published writeups. Anyone can also see a
simplified, public version of your profile at a link like
`thissite.com/profile/yourusername` — it hides your email but shows the
rest.

## Settings

Open **Settings** to change:

- **Theme** — dark or light.
- **Wallpaper** — several background styles to choose from.
- **Accent color** — the highlight color used throughout the interface.
- **Reduce motion** — turns off animations, for accessibility or just
  personal taste.
- **Clock format** — 12-hour or 24-hour.

These are personal preferences — only you see them, saved to your own
browser.

## If you're an admin

If your account has admin rights, you'll also see a **Control Center**
icon. That's where you manage the whole competition: creating and
publishing challenges, managing users and teams, reviewing writeups,
checking submission activity, viewing statistics, and changing
platform-wide settings (like the site's name, or whether new people can
register). See [`administration/overview.md`](administration/overview.md)
for a full tour of that side, and
[`challenges/creating-a-challenge.md`](challenges/creating-a-challenge.md)
for exactly how to build a challenge step by step.

Regular players never see or need any of this — it's a separate, locked-down
area.
