# GURL
> The Grand Unified Read List

## Installation

Install the libs `npm install` or `yarn`.

### Setup the email client

```json
{
    "target": "target email",
    "auth": {
        "user": "email user",
        "pass": ""
    }
}
```

## Usage

```sh
node index.js "https://old.reddit.com/search/.rss?q=author%3Abigbear0083+Ahead+for+the+trading+week+beginning&restrict_sr=&sort=relevance&t=week" 1 --sendMail
```

