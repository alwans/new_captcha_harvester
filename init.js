
const {CaptchaHarvester} = require('./harvester');
const express = require('express');
const app = express();
const port = 4399;
const start = async function(){

    let infos = [];
	let info = {
		gmail:'anthony6roberts65a@gmail.com',
		password:'yC59P9DRxC',
		proxy:'127.0.0.1:1080'
	};
	let info2 = {
		gmail:'john8martins5t@gmail.com',
		password:'6ajuRTLk6H',
		proxy:'127.0.0.1:1080'
	};
	// infos.push(info2);
	infos.push(info);
    // Initialize the harvester with the recaptcha site key and url that the recaptcha is located at.
	// let harvester = new CaptchaHarvester('6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz', 'https://www.supremenewyork.com/checkout');
	let harvester = new CaptchaHarvester('6LcMVaUZAAAAAO9aTjQSJCPp8l7NAWtH-LaLi59v', 'http://hzmfzl.com/v2invisable.html');
    // Starting the harvester will open a google login page and save cookies if it hasn't been done previously. 
    // Returns an ID to reference the harvester page when harvesting and trying to get the token.
    var id_list = [];
	for(info of infos){
        let harvester_id = await harvester.start_captcha_harvester(info.gmail,info.password,info.proxy);
        console.log(`add captcha harvester--->id: ${harvester_id}`);
        id_list.push(harvester_id);
        // await harvester.harvest_captcha_token(harvester_id);
    }
    serverStart(harvester,id_list);
    // let harvester_id = await harvester.start_captcha_harvester(info.gmail,info.password,info.proxy);
    // Start the harvesting process (where the user will solve the challenge).
    // await harvester.harvest_captcha_token(harvester_id);
    // // This while loop will keep checking until the captcha is solved, and set the resulting object
    // let captcha_object = false;
    // while(1==1) {
	// 	captcha_object = await harvester.retrieve_captcha_token(harvester_id);
	// 	if(captcha_object){
	// 		console.log(captcha_object.token);
	// 		captcha_object = false;
	// 	}
	// 	await harvester.timeout(1000);
    // }
    // Log the token that was harvested.
	// console.log(captcha_object.token);
}

var isFirstInt = [];
const serverStart = function(harvester,id_list){
    app.get('/fetch', async function (req, res) {
        if(harvester.captcha_bank.length>0){
            let captcha_object = harvester.captcha_bank.splice(0,1)[0];
            console.log(`return token,recycle captcha harvester--->id: ${captcha_object.uuid}`);
            id_list.push(captcha_object.uuid);
            console.log(`free captcha harvester： ${id_list}`);
            res.send(captcha_object.token);
        }else if(id_list.length>0){
            let id = id_list.splice(0,1)[0];
            console.log(`use captcha harvester--->id: ${id}`);
            if(!isFirstInt.includes(id)){
                isFirstInt.push(id);
                await harvester.harvest_captcha_token(id);
            }
            await harvester.retrieve_captcha_token(id);
            if(harvester.captcha_bank.length>0){
                let captcha_object = harvester.captcha_bank.splice(0,1)[0];
                console.log(`return token,recycle captcha harvester--->id: ${captcha_object.uuid}`);
                id_list.push(captcha_object.uuid);
                console.log(`free captcha harvester： ${id_list}`);
                res.send(captcha_object.token);
            }else{
                res.send('-1');
            }
        }else{
            console.log(`Not available token, Not available captcha harvester`);
            res.send('-1');
        }
     })
    app.listen(port,function(){
        console.log(`server is start,port: ${port}`);
    });
}
start();