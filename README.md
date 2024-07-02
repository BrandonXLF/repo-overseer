# Repo Overseer

## View issues and pull requests in all your GitHub repositories.

<img width="100px" src="./public/logo-half.png" alt="Icon for Repo Overseer">

Repo Overseer allows you to view open issues and pull requests for all repositories owned by a user or organization. It can be accessed from https://www.brandonfowler.me/repo-overseer/.

## Development

### Requirements

node.js, npm, php

### Commands

Install dependencies using `npm install`. Once installed, the app can be launched in development mode by running `npm start`. It can be viewed by opening [http://localhost:3000](http://localhost:3000) in your browser. To build a production build, run `npm run build`.

### OAuth

To enable GitHub login, a OAuth app will need to be created. See [Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

### Configuration

Both `.config.php` and an local `.env` file should be populated with configuration values. See `.config.example.php` and `.env` for details. See [Adding Custom Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables) for details in creating local `.env` files.
