# Eintr News Aggregator
Source Code for the a news aggregator I made a year ago. The rss reader might be buggy.

## Install
* First, You need to install redis, postgres.
* Run "npm install"
* Copy override-clone.json to override.json
* Import the eintr.sql file to your portgres server.
* Add sources in the "sources" postgres table and to the bot/sources.json file
* Add get google oath2 credentials and add them to override.json.
* Add get an api key from coinmarketcap.com and add it to override.json.
* Add Redis and Postgres config to override.json

## Run

### Bot
    mode=bot override="$(cat override.json)" node start.js
    
### Web
    mode=web override="$(cat override.json)" node start.js
