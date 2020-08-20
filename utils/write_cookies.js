const path = require('path');
const fsPromises = require('fs').promises;
const appDataPath =
  process.env.APPDATA ||
  (process.platform === 'darwin'
    ? `${process.env.HOME}/Library/Preferences`
    : `${process.env.HOME}/.local/share`);

const captchaPath = path.join(appDataPath, '/captcha/');
const cookiesPath = path.join(appDataPath, '/captcha/cookies.json');

const writeCookies = async (cookies,cookieName) => {
    try {
      let new_cookiesPath = cookiesPath.replace('cookies.json',`${cookieName}_cookies.json`);
      await fsPromises.writeFile(new_cookiesPath, JSON.stringify(cookies));
    } catch (err) {
      console.log(err);
    }
};

const restoreCookies = async(cookieName) => {
    try {
      let new_cookiesPath = cookiesPath.replace('cookies.json',`${cookieName}_cookies.json`);
      const cookies_buffer = await fsPromises.readFile(new_cookiesPath);
      const cookies = JSON.parse(cookies_buffer);
      return cookies;
    } catch(e) {
      console.log(e);
      return false;
    }
}


module.exports = { captchaPath, cookiesPath, writeCookies, restoreCookies };