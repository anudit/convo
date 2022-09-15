# Discord

Update Interactions URL for local testing on https://discord.com/developers/applications/874563415228702751/information

## Slash Commands
https://discord.com/developers/docs/interactions/application-commands

Add header,
```json
{
    "Authorization": "Bot <Bot-token>"
}
```
Bot Id: `874563415228702751`

- Get Commands [GET] https://discord.com/api/v10/applications/874563415228702751/commands
- Create Command [POST] https://discord.com/api/v10/applications/874563415228702751/commands
```json
{
    "name": "check-website",
    "type": 1,
    "description": "Check if a website is phishing/malicious",
    "options": [
        {
            "name": "website",
            "description": "The url address of the website.",
            "type": 3,
            "required": true
        }
    ]
}
```

## Managing Bot
https://discord.com/developers/applications

