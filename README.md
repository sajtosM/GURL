[![Build Status](https://travis-ci.com/sajtosM/GURL.svg?branch=master)](https://travis-ci.com/sajtosM/GURL) 

# G.U.R.L.
> The Grand Unified Read List

## What is the G.U.R.L.?
G.U.R.L. is a tool to parse RSS feeds into emails.

## Installation

Install the libs

```sh
npm install
```

Or if you prefer using Yarn:
```sh
yarn install
```
### Setup the email client

Run with `--init` to set up the configuration.

```sh
node index.js --init
```

The `config.json` should look like this:
```json
{
    "target": "email_where_you_want_to_send_the@newsletter.com",
    "auth": {
        "user": "emailadress_that_you_want_to_use_to_send_the@newsletter.com",
        "pass": "password"
    }
}
```

## Usage

# <img src="media/usage.gif" title="G.U.R.L." alt="G.U.R.L. usage" width="530">

```sh
node index.js "https://reddit.com/r/news/.rss"
```

If you don't want to send a mail `--noMail`:

```sh
node index.js "https://reddit.com/r/funny/.rss" --noMail
```

If you want to limit the number of the Rss entries:

```sh
node index.js "https://reddit.com/r/wallstreetbets/.rss" 5
```
Disable the limitation on read time. The text will not concatenate at 2 Minutes.

```sh
node index.js "https://reddit.com/r/wallstreetbets/.rss" --noLimit
```

### Cron

Open the `crontab`
```sh
crontab -e
```

Add an entry. This for example sends a newsletter at 6:00 with 25 entries from the hackernews daily top.

```sh
0 6 * * * cd /home/ubuntu/Project/GURL && node index.js "https://hnrss.org/newest?points=100" 25
```

```sh
# Edit this file to introduce tasks to be run by cron.
# 
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run
# and what command to run for the task
# 
# To define the time you can provide concrete values for
# minute (m), hour (h), day of month (dom), month (mon),
# and day of week (dow) or use '*' in these fields (for 'any').
# 
# Notice that tasks will be started based on the cron's system
# daemon's notion of time and timezones.
# 
# Output of the crontab jobs (including errors) is sent through
# email to the user the crontab file belongs to (unless redirected).
# 
# For example, you can run a backup of all your user accounts
# at 5 a.m every week with:
# 0 5 * * 1 tar -zcf /var/backups/home.tgz /home/
# 
# For more information see the manual pages of crontab(5) and cron(8)
# 
# m h  dom mon dow   command

0 6 * * * cd /home/ubuntu/Project/GURL && node index.js "https://hnrss.org/newest?points=100" 
1 6 * * * cd /home/ubuntu/Project/GURL && node index.js "https://hang.hu/feed/" 5
2 6 * * Fri  /home/ubuntu/Project/GURL && node index.js "https://www.atlasobscura.com/feeds/latest" 16
2 6 * * Fri  /home/ubuntu/Project/GURL && node index.js "https://old.reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day" 7
```
