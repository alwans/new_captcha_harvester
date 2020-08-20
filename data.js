
const sitekey='6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz';
const captcha_url = 'https://www.supremenewyork.com/checkout';
    let infos = [
        {
            gmail:'',
            password:'',
            proxy:'127.0.0.1:1080' //default=''
        },
        {
            gmail:'',
            password:'',
            proxy:'127.0.0.1:1080'
        }
    ];

    // let infos =[];
	// let info = {
	// 	gmail:'',
	// 	password:'',
	// 	proxy:'127.0.0.1:1080' //default=''
	// };
	// let info2 = {
	// 	gmail:'',
	// 	password:'',
	// 	proxy:'127.0.0.1:1080'
	// };
	// infos.push(info2);
    // infos.push(info);
    
    module.exports={
        infos,
        sitekey,
        captcha_url

    }