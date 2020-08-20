const { webkit,chromium,firefox } = require('playwright');
// const proxyChain = require('proxy-chain');
const { writeCookies, restoreCookies, cookiesPath } = require('./utils/write_cookies');
const fs = require('fs')
class CaptchaHarvester {
    constructor(site_key, site_host) {
        this.captcha_bank = [];
        this.harvesters = [];
        this.site_key = site_key;
        this.site_host = site_host;
        this.captchaTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Captcha Harvester:test@gmail.com</title>
          <script src="https://www.google.com/recaptcha/api.js" async defer></script>
          
          <script>
            window.captcha = "";
            function sub(token){
              document.getElementById("submit").click();
              window.sendCaptcha(token);
            }
            function captchaCallback(token) {
                window.captcha = token;
              window.sendCaptcha(token);
              window.grecaptcha.reset();
            }
          </script>
          <style>
            .flex {
              display: flex;
            }
            .justify-center {
              justify-content: center;
            }
            .items-center {
              align-items: center;
            }
            .mt-6 {
              margin-top: 1.5rem;
            }
            .gmail{
                padding-bottom: 220px;
                font-weight: 700;
                font-family: inherit;
                color: orange;
              }
          </style>
        </head>
        <body>
            <!-- <div class="gmail"><p>goole account: test@gmail.com</P></div> -->
            <div class="flex justify-center items-center mt-6">
                <button id="submit" onClick="grecaptcha.execute();">Submit</button>
                <div class="g-recaptcha" data-sitekey=${this.site_key} data-callback="captchaCallback" data-size="invisible"></div>
                
            </div>
        </body>
        </html>
        `;
    }

    async login_to_google(gmail,password,proxy_obj) {
        try {
            // const oldProxyUrl = 'http://w1luckw2662:XqOLnFaYnQyVbe7U_country-UnitedStates_session-sQwz53Cu@spa-proxy.com:8080';
            // const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
            // console.log(newProxyUrl);
            let cookieName = gmail.split('@')[0];
            // console.log('cookieName:',cookieName);
            if( await restoreCookies(cookieName)) {
                // console.log(`${gmail.split('@')[0]} already have google cookies written.`);
                return true;
            }
            let browser = await firefox.launch({ 
                headless: false,
                proxy :proxy_obj
            
            });
            const context = await browser.newContext({
                // httpCredentials: {
                //     username: `w1luckw2662`,    
                //     password: `XqOLnFaYnQyVbe7U_country-UnitedStates_session-Hlg6k2LX`
                // }
            });
            let captcha_page = await browser.newPage({ viewport: { width: 400, height: 700 } });
            await captcha_page.goto('https://www.gmail.com');
            await captcha_page.waitForSelector('input[type=email]', { timeout: 0 });
            await captcha_page.type('input[type=email]',gmail);
            await captcha_page.click('button[jsname=LgbsSe]');
            await captcha_page.waitForSelector('input[type=password]', { timeout: 0 });
            await captcha_page.type('input[type=password]',password);
            await captcha_page.click('button[jsname=LgbsSe]');
            await captcha_page.waitForSelector('.aim', { timeout: 0 });
            let cookies = await captcha_page.context().cookies();
            await writeCookies(cookies,cookieName);
            await browser.close();
            return true;
        } catch(e) {
            throw(e);
        }
    }

    async start_captcha_harvester(gmail,password,proxy) {
        const task_harvester = { uuid: this.uuidv4(), browser: null, captcha_page: null };
        try {
            let  proxy_obj = this.formatProxy(proxy)
            await this.login_to_google(gmail,password,proxy_obj);
            let browser = await firefox.launch({ headless: false,proxy : proxy_obj });
            let captcha_page = await browser.newPage({ viewport: { width: 420, height: 700 } });
            let cookies = await restoreCookies(gmail.split('@')[0]);
            await captcha_page.context().addCookies(cookies);
            // Set up the route redirection to render a captcha.
            await captcha_page.route(`${this.site_host}`, route => {
                route.fulfill({
                    status: 200,
                    contentType: 'text/html',
                    body: this.captchaTemplate.replace('test@gmail.com',gmail),
                })
            });

            await captcha_page.goto(`${this.site_host}`);
            task_harvester.browser = browser;
            task_harvester.captcha_page = captcha_page;
            this.harvesters.push(task_harvester);
            return task_harvester.uuid;
        } catch(e) {
            throw(e);
        }
    }

    async harvest_captcha_token(uuid) {
        let task_harvester;
        const task_harvester_matches = this.harvesters.filter((task_harvester_object) => task_harvester_object.uuid === uuid);
        if(task_harvester_matches.length === 1) {
            task_harvester = task_harvester_matches[0];
        }
        try {
            // Set up the window function.
            await task_harvester.captcha_page.exposeFunction('sendCaptcha', token => {
                const captchaItem = {
                  uuid,
                  token,
                  timestamp: Date.now(),
                  host: `${this.site_host}`,
                  sitekey: `${this.site_key}`,
                };
                this.captcha_bank.push(captchaItem);
            });
            // await task_harvester.captcha_page.click('#submit');
        } catch(e) {
            throw(e);
        }
    }

    async retrieve_captcha_token(uuid) {
        let task_harvester;
        const task_harvester_matches = this.harvesters.filter((task_harvester_object) => task_harvester_object.uuid === uuid);
        if(task_harvester_matches.length === 1) {
            task_harvester = task_harvester_matches[0];
            await task_harvester.captcha_page.click('#submit');
        }
        // let captcha_token_for_task = this.captcha_bank.filter(captcha_object => captcha_object.uuid === uuid);
        // if(captcha_token_for_task.length === 0) {
        //     return false;
        // } else {
        //     const task_harvester_matches = this.harvesters.filter((task_harvester_object) => task_harvester_object.uuid === uuid);
        //     if(task_harvester_matches.length === 1) {
        //         let task_harvester = task_harvester_matches[0];
        //         // await task_harvester.browser.close();
        //         // return captcha_token_for_task[0];
        //         await task_harvester.captcha_page.click('#submit');
        //         let obj  = captcha_token_for_task[0];
        //         let index = this.captcha_bank.indexOf(obj)
        //         this.captcha_bank.splice(index,1);
        //         return obj ;
        //     } else {
        //         return false;
        //     }
        // }
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
    
    formatProxy(proxy){
        let proxy_obj = null;
        if(proxy.split(':').length>2){
            let p = proxy.split(':');
            proxy_obj = {
                server: p[0].indexOf('http')>-1 ? `${p[0]}:${p[1]}`:`http://${p[0]}:${p[1]}`,
                username: p[2],
                password: p[3]
            }
        }else{
            proxy_obj = {
                server:proxy.indexOf('http')>-1 ? proxy:`http://${proxy}`
            }
        }
        return proxy_obj;
    }

    async timeout(delay) {
        // console.log('browser waiting for: ', delay)
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    async checkExpire(){
        console.log('start check token isExpire....');
        setInterval(function(){
            console.log(this.captcha_bank);
            this.captcha_bank.map((obj,index) =>{
                if(!this.isExpire(obj,90)){
                    console.log(`index: ${index}`);
                    this.captcha_bank.splice(index,1);
                }
            });
        },100);
    }

    /**
     * compare time is more then 1min
     * @param {} obj 
     * @param {int} time : /s
     */
    isExpire(obj,time){
        let t2 = Date.now();
        let interval = (t2 - obj.timestamp)/1000;
        return interval<time ? true:false; 
    }
}

module.exports = {
    CaptchaHarvester
}