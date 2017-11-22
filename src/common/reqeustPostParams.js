/**
 * Created by 软件开发 on 2017/11/21.
 */
import md5 from 'md5';
import DeviceInfo from 'react-native-device-info';

const APPKEY = 'jkmaUOYBOprPyh';

export default {
    API_GATEWAY: 'https://api.xxxxxx.com/api/v4.app?',
    APPID : '12524658797978809',
    getSign: function(params: Object, type:string = 'sign') {
        if( params.sign != 'undefined' ) delete params.sign;
        if( params.appkey != 'undefined' ) delete params.appkey;

        let signStr = '';
        let newObj = Object.keys(params).sort();
        for( var key in newObj )
        {
            signStr += newObj[key] + "=" + params[newObj[key]] + "&";
        }
        signStr = signStr.substring(0,signStr.length-1);
        if( type != 'sign' ) {
            return APPKEY+signStr;
        }else{
            signStr = md5(APPKEY+signStr);
            return signStr;
        }
    },
    getRequestBody: function (params: Object, type:string = 'sign') {
        let newParams = {
            "appid": this.APPID,
            "device_id": DeviceInfo.getUniqueID()
        };
        params = Object.assign(newParams,params);
        if( type == 'sign' ){
            return Object.assign(params,{"sign":this.getSign(params)});
        }else{
            return params;
        }
    },
    getRequestFormData: function (params: Object) {
        let data = this.getRequestBody(params);
        formData = new FormData();
        for(var x in data)
        {
            formData.append(x, data[x]);
        }
        return formData;
    },

    catList: function catList() {
        return {
            "module": "goods",
            "act": "catlist",
            "cat_id": 0,
            "longitude": 128.01,
            "latitude": 21.56
        };
    },

    catGoodsList: function (id) {
        return {
            "module": "goods",
            "act": "catgoodslist",
            "cat_id": id,
            "longitude": 128.01,
            "latitude": 21.56
        };
    },

    goodsInfo: function goodsInfo(id) {
        return {
            "module": "goods",
            "act": "goodsinfo",
            "goods_id": id,
        };
    },
};