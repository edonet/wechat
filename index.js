/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-11-01 10:00:45
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import defer from '@arted/node/defer';
import ajax from '@arted/web/ajax';
import script from '@arted/web/script';


/**
 *****************************************
 * 启动微信【sdk】
 *****************************************
 */
async function start({ api = '/api/wechat/config', jsApiList = [], debug = true } = {}) {
    let [options] = await Promise.all([
            ajax.post(api, { url: location.href.split('#')[0] }),
            script('//res.wx.qq.com/open/js/jweixin-1.4.0.js')
        ]),
        deferred = defer(),
        wx = window.wx;

    // 初始化配置
    if (wx) {

        // 启动配置
        wx.config({ debug, jsApiList, ...options });

        // 监听回调
        wx.ready(() => deferred.resolve(wx));
        wx.error(deferred.reject);
    }

    // 返回结果
    return await deferred.promise;
}


/**
 *****************************************
 * 判断是否为信息
 *****************************************
 */
export function isWeChat() {
    return navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1;
}


/**
 *****************************************
 * 创建微信进口
 *****************************************
 */
export default async function load(options) {

    // 判断是否在微信浏览器
    if (!isWeChat) {
        throw new Error('请在微信浏览器中使用些接口');
    }

    // 加载配置
    if (!load.result) {
        load.result = await start(options || {});
    }

    // 返回结果
    return load.result;
}
