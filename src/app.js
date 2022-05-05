var url = require('url');
const xpath = require("xpath-html");
const JSEncrypt = require('node-jsencrypt')
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
const superagent = require('superagent');
const config = require('../config')
var client = superagent.agent();
const headers = {
    "User-Agent":`Mozilla/5.0 (Linux; U; Android 11; ${config.model} Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 Ecloud/${config.version} Android/30 clientId/${config.clientId} clientModel/${config.model} clientChannelId/qq proVersion/1.0.6`,
    "Referer":"https://m.cloud.189.cn/zhuanti/2016/sign/index.jsp?albumBackupOpened=1",
    "Accept-Encoding":"gzip, deflate",
    "Host":'cloud.189.cn'
}

const getEncrypt = () => new Promise((resolve, reject)=>{
    if(config.pubKey){
        resolve(config.pubKey)
        return
    }
    superagent.post('https://open.e.189.cn/api/logbox/config/encryptConf.do')
    .send('appId=cloud')
    .end((err,res)=>{
        if(err){
            reject(err)
            return
        }
        var json = JSON.parse(res.text)
        if(json.result==0){
            resolve(json.data.pubKey)
        }else{
            reject(json.data)
        } 
    })
})

const getLoginFormData = (username,password,encryptKey) => new Promise((resolve, reject)=>{
    superagent.get('https://cloud.189.cn/api/portal/loginUrl.action?redirectURL=https://cloud.189.cn/web/redirect.html?returnURL=/main.action')
    .end((err,res)=>{
        if(err){
            reject(err)
            return
        }
        var body = res.text;
        var script = xpath.fromPageSource(body).findElement("//script[contains(text(), '扫码登录客户端配置')]")
        var context = script.getText();
        var rsaKey = xpath.fromPageSource(body).findElement("//input[@id='j_rsaKey']")
        var captchaToken = xpath.fromPageSource(body).findElement("//input[@name='captchaToken']")
        var keyData = `-----BEGIN PUBLIC KEY-----\n${encryptKey}\n-----END PUBLIC KEY-----`;
        var jsencrypt = new JSEncrypt()
        jsencrypt.setPublicKey(keyData)
        var usernameEncrypt = Buffer.from(jsencrypt.encrypt(username),'base64').toString('hex')
        var passwordEncrypt = Buffer.from(jsencrypt.encrypt(password),'base64').toString('hex')
        var formData = {
            returnUrl:context.match(getParReg('returnUrl'))[0],
            paramId:context.match(getParReg('paramId','"'))[0],
            captchaToken:captchaToken.getAttribute('value'),
            lt:context.match(getParReg('lt','"'))[0],
            rsaKey:rsaKey.getAttribute('value'),
            REQID:context.match(getParReg('reqId','"'))[0],
            userName:`{NRP}${usernameEncrypt}`,
            password:`{NRP}${passwordEncrypt}`
        }
        resolve(formData)
    })
})

const getParReg = (name,s = '\'')=>{
    return `(?<=${name} = \\${s})(.+?)(?=\\${s})`
}

const login = (formData) => new Promise((resolve, reject)=>{
    var data = {
        appKey:"cloud",
        accountType: "01",
        mailSuffix: "@189.cn",
        validateCode: "",
        returnUrl:formData.returnUrl,
        paramId:formData.paramId,
        captchaToken:formData.captchaToken,
        dynamicCheck:'FALSE',
        clientType:'1',
        isOauth2:false,
        userName:formData.userName,
        password:formData.password
    }
    superagent.post('https://open.e.189.cn/api/logbox/oauth2/loginSubmit.do')
    .set({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/76.0",
        "Referer": "https://open.e.189.cn/",
        "lt":formData.lt,
        "REQID":formData.REQID
    })
    .type('form')
    .send(data)
    .end((err,res)=>{
        if(err){
            reject(err)
            return
        }
        var json = JSON.parse(res.text)
        if(json.result != 0){
            reject(json.msg)
            return
        }
        client.get(json.toUrl)
        .set(headers)
        .end((e,r)=>{
            if(e){
                reject(e)
                return;
            }
            resolve(r.statusCode)
        })
    })
})

const doGet = (taskUrl)=> new Promise((resolve, reject)=>{
    var q = url.parse(taskUrl,true)
    client.get(taskUrl)
    .set({
        ...headers,
        Host:q.host
    })
    .end((err,res) =>{
        if(err){
            console.error(err)
            reject(err)
            return
        }
        resolve(JSON.parse(res.text))
    })
})

//登录流程 1.获取公钥 -> 2.获取登录参数 -> 3.获取登录地址,跳转到登录页
const doLogin = async ()=>{
    var mask = (s,start,end)=>{
       return s.split('').fill('*',start,end).join('')
    }
    var userName = config.userName
    var password = config.password
    console.log(`开始登录账号:${mask(userName,3,7)}`)
    var encryptKey = await getEncrypt();
    var formData = await getLoginFormData(userName,password,encryptKey)
    var loginResult = await login(formData)
    return [encryptKey,formData,loginResult]
}

//任务 1.签到 2.天天抽红包 3.自动备份抽红包
const doTask = async ()=>{

    var tasks = [
        `https://cloud.189.cn/mkt/userSign.action?rand=${new Date().getTime()}&clientType=TELEANDROID&version=${config.version}&model=${config.model}`,
        'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN&activityId=ACT_SIGNIN',
        'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN_PHOTOS&activityId=ACT_SIGNIN'
    ]

    var result = []
    for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index];
        var res = await doGet(task)
        console.log(res)
        if(index == 0){
            //签到
            if(res.isSign){
                result.push(`签到获得${res.netdiskBonus}M空间`)
            }else{
                result.push('签到失败')
            }
        }else{
            if(res.errorCode === 'User_Not_Chance'){
                result.push(`第${index}次抽奖失败,次数不足`)
            }else{
                result.push(`第${index}次抽奖成功,抽奖获得${res.description}`)
            }
        }
    }
    return result
}

// 开始执行程序
doLogin().then(res=>{
    console.log('--登录成功开始执行任务--')
    doTask().then(result=>{
        console.log('任务执行完毕')
        result.forEach(r=>console.log(r))
    }).catch(e=>{
        console.error('任务执行失败:'+JSON.stringify(e))
    })
}).catch(e=>{
    console.error('登录失败:'+JSON.stringify(e))
})
