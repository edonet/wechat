/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-11-01 10:02:22
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
const
    ajax = require('@arted/node/ajax'),
    encrypt = require('@arted/node/encrypt');


/**
 *****************************************
 * 微信服务
 *****************************************
 */
class WeChart {

    /* 初始化模块 */
    constructor({ appId, appSecret, token = 'edonet' }) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.token = token;
        this.accessToken = null;
        this.apiTicket = null;
    }

    /* 校验【signature】 */
    checkSignature({ echostr, signature, nonce, timestamp }) {

        // 判断令牌是否一致
        if (encrypt.sha1([this.token, nonce, timestamp].sort().join('')) === signature) {
            return echostr;
        }

        // 检验失败
        return 'mismatch';
    }

    /* 获取【accessToken】 */
    async getAccessToken() {

        // 生成缓存
        if (!this.accessToken || this.accessToken.expires < this.createTimestamp()) {
            let { result } = await this.request({
                    method: 'GET',
                    url: 'token',
                    qs: {
                        grant_type: 'client_credential',
                        appid: this.appId,
                        secret: this.appSecret
                    }
                });

            // 缓存结果
            this.accessToken = {
                token: result.access_token,
                expires: result.expires_in + this.createTimestamp()
            };
        }

        // 返回结果
        return this.accessToken;
    }

    /* 获取【jsapiTicket】 */
    async getApiTicket() {

        // 生成缓存
        if (!this.apiTicket || this.apiTicket.expires < this.createTimestamp()) {
            let { token } = await this.getAccessToken(),
                { result } = await this.request({
                    method: 'GET',
                    url: '/ticket/getticket',
                    qs: { type: 'jsapi', access_token: token }
                });


            // 缓存结果
            this.apiTicket = {
                ticket: result.ticket,
                expires: result.expires_in + this.createTimestamp()
            };
        }

        // 返回结果
        return this.apiTicket;
    }

    /* 生成【signature】*/
    async jsApi({ url }) {
        let { ticket: jsapi_ticket } = await this.getApiTicket(),
            timestamp = this.createTimestamp(),
            noncestr = this.createNonce();


        // 返回结果
        return {
            appId: this.appId,
            timestamp,
            nonceStr: noncestr,
            signature: encrypt.sha1(
                this.raw({ url, noncestr, timestamp, jsapi_ticket })
            )
        };
    }

    /* 发送请求 */
    request(options) {
        return ajax({
            baseUrl: 'https://api.weixin.qq.com/cgi-bin/',
            ...options
        });
    }

    /* 生成随机码 */
    createNonce() {
        return Math.random().toString(36).substr(2, 15);
    }

    /* 生成时间戳 */
    createTimestamp() {
        return parseInt(new Date().getTime() / 1000);
    }

    /* 拼接字符串 */
    raw(data) {
        let keys = Object.keys(data).sort(),
            str = keys.reduce(
                (res, key) => res += `&${ key.toLowerCase() }=${ data[key] || '' }`, ''
            );

        // 返回结果
        return str.slice(1);
    }
}


/**
 *****************************************
 * 抛出接口
 *****************************************
 */
module.exports = options => new WeChart(options);
