# 🚀 VTEX Easy Deploy

## 🛠 Overview

VTEX Easy Deploy is a Node.js application designed to simplify and expedite the deployment and installation of apps in VTEX environments. By automating the token generation, account and workspace switching, and app installation processes, this tool allows you to set up your VTEX environment with minimal effort.

## ✨ Features

- **Automated Token Management**: Generate and update VTEX tokens for multiple accounts automatically.
- **Workspace Switching**: Seamlessly switch between VTEX accounts and workspaces.
- **App Installation**: Automatically install specified apps with retry logic to handle intermittent failures.
- **Multi-Account Support**: Easily configure and manage deployments across multiple VTEX accounts.
- **Deployment Links**: Generates deployment links for each account and workspace combination.

---

## 📋 Requirements

- Node.js (v14 or higher)
- VTEX CLI installed and authenticated
- A valid `appKey` and `appToken` for each VTEX account
- File system access to manage tokens

---

## 📦 Installation

1. Clone this repository:
 
 ```bash
   git clone <repository-url>
   cd vtex-easy-deploy
  ```

## Install dependencies:

  ```bash  
    npm install
  ```

## Configure your settings in the CONFIGS object of the main script:

```bash  
const CONFIGS = {
    VtexTokenPath: "<path-to-your-tokens.json>",
    workspaceToInstall: "master",
    accountsToInstall: ["accounttest"],
    appsToInstall: ["vtex.store-components"],
    credentials: {
        accounttest: {
            appKey: "vtexappkey-accounttest-ABCD",
            appToken: "ABCD",
        },
    },
};
```

## 🚀 Usage

### Run the application:

```javascript
node index.js
```

### The script will:
- Generate tokens for specified accounts
- Update the token file at the configured path
- Switch to the specified account and workspace
- Install the listed apps

After completion, deployment links for each account will be saved to a link.txt file.

---

## ⚙️ Configuration

**VtexTokenPath:** Path to the tokens.json file where VTEX tokens are stored.

**workspaceToInstall:** The VTEX workspace where apps will be installed.

**accountsToInstall:** List of VTEX accounts to process.

**appsToInstall:** List of VTEX apps to install.

**credentials:** Object containing appKey and appToken for each account

---

## ❗ Error Handling

- The script retries failed app installations up to 3 times with a delay of 5 seconds between retries.

- If a token cannot be generated for an account, the script will skip to the next account.

---

## 📜 Logs

Detailed logs are printed to the console for each step of the process, including:

- Token generation
- Account and workspace switching
- App installation
- Error messages and retry attempts
