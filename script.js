const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { spawn } = require("child_process");

const CONFIGS = {
  VtexTokenPath: path.join(
    "C:",
    "Users",
    "f.aquistapac",
    ".vtex",
    "session",
    "tokens.json"
  ),
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
async function generateToken(appKey, appToken, account) {
  try {
    console.log(`Gerando token para a conta: ${account}...`);
    const response = await axios.post(
      `https://vtexid.vtex.com.br/api/vtexid/apptoken/login?an=${account}`,
      {
        appkey: appKey,
        apptoken: appToken,
      }
    );
    console.log(`Token gerado com sucesso para a conta: ${account}.`);
    return response.data.token;
  } catch (error) {
    console.error(`Erro ao gerar token para a conta ${account}:`, error);
  }
}
const updateToken = (account, newToken) => {
  // Ler o arquivo atual de tokens
  const filePath = CONFIGS.VtexTokenPath;
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo:", err);
      return;
    }
    try {
      // Converter o conteúdo do arquivo em um objeto JSON
      const tokens = JSON.parse(data);
      // Atualizar o token da account especificada
      tokens[account] = newToken;
      // Escrever o novo conteúdo no arquivo
      fs.writeFile(filePath, JSON.stringify(tokens, null, 4), "utf8", (err) => {
        if (err) {
          console.error("Erro ao atualizar o arquivo:", err);
          return;
        }
        console.log(`Token atualizado para a account: ${account}`);
      });
    } catch (parseError) {
      console.error("Erro ao parsear o arquivo JSON:", parseError);
    }
  });
};
async function switchAccountWorkspace(account, workspace) {
  console.log(`Trocando para a conta ${account} e workspace ${workspace}...`);
  return new Promise((resolve, reject) => {
    const switchCommand = spawn("vtex", ["switch", `${account}/${workspace}`], {
      stdio: "inherit",
      shell: true,
    });
    switchCommand.on("error", (err) => {
      console.error(
        `Erro ao executar o comando vtex switch para a conta ${account}:`,
        err
      );
      reject(err);
    });
    switchCommand.on("close", (code) => {
      if (code !== 0) {
        console.error(
          `Erro ao trocar para a conta ${account} e workspace ${workspace}. Código de saída: ${code}`
        );
        reject(new Error(`Código de saída: ${code}`));
      } else {
        console.log(
          `Conta ${account} e workspace ${workspace} configurados com sucesso.`
        );
        resolve();
      }
    });
  });
}
async function installApp(appName, retries = 3, delay = 5000) {
  console.log(`Instalando a app ${appName}...`);
  return new Promise((resolve, reject) => {
    const installCommand = spawn("vtex", ["install", appName], {
      stdio: "inherit",
      shell: true,
    });
    installCommand.on("error", (err) => {
      console.error("Erro ao executar o comando vtex install:", err);
      reject(err);
    });
    installCommand.on("close", async (code) => {
      if (code !== 0) {
        console.error(
          `Erro ao instalar a app ${appName}. Código de saída: ${code}`
        );
        if (code === 1 && retries > 0) {
          console.log(
            `Tentando novamente em ${
              delay / 1000
            } segundos... Tentativas restantes: ${retries}`
          );
          setTimeout(async () => {
            await installApp(appName, retries - 1, delay);
            resolve();
          }, delay);
        } else {
          reject(new Error(`Código de saída: ${code}`));
        }
      } else {
        console.log(`App ${appName} instalada com sucesso.`);
        resolve();
      }
    });
  });
}
function getCredentials(account) {
  const credentials = CONFIGS.credentials;
  const prefix = Object.keys(credentials).find((key) =>
    account.startsWith(key)
  );
  return credentials[prefix];
}
(async function () {
  const accounts = CONFIGS.accountsToInstall;
  const workspace = CONFIGS.workspaceToInstall;
  const appsToInstall = CONFIGS.appsToInstall;

  let link = [];

  for (const account of accounts) {
    console.log(`\n----- Iniciando processo para a conta ${account} -----`);
    const { appKey, appToken } = getCredentials(account);
    const token = await generateToken(appKey, appToken, account);
    if (token) {
      updateToken(account, token);
      await switchAccountWorkspace(account, workspace);
      for (const app of appsToInstall) {
        await installApp(app);
      }
      console.log(`----- Processo concluído para a conta ${account} -----\n`);
    } else {
      console.error(
        `Token não gerado para a conta ${account}. Pulando para a próxima.`
      );
    }

    link.push(`https://${workspace}--${account}.myvtex.com`);
  }

  fs.writeFile("link.txt", JSON.stringify(link, null, 2), (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
})();
