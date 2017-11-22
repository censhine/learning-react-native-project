/**
 * Copyright (c) 2017-present
 * All rights reserved.
 * @flow
 */
//import libraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ListView, Image,
    StatusBar, FlatList,Alert } from 'react-native'

import { Heading1, Heading2, Paragraph } from '../../widget/Text'
import { color, Button, NavigationItem, SearchBar, SpacingView } from '../../widget'
import DeviceInfo from 'react-native-device-info';

import { screen, system, reqeustPostParams } from '../../common'
import api from '../../api'

import HomeMenuView from './HomeMenuView'
import HomeGridView from './HomeGridView'
import GroupPurchaseCell from '../GroupPurchase/GroupPurchaseCell'

// create a component
// let ds = new ListView.DataSource({'rowHasChanged':(r1,r2)=>r1!==r2});

class HomeScene extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        headerTitle: (
            <TouchableOpacity style={styles.searchBar}>
                <Image source={require('../../img/Home/search_icon.png')} style={styles.searchIcon} />
                <Paragraph>双十二大促销</Paragraph>
            </TouchableOpacity>
        ),
        headerRight: (
            <NavigationItem
                icon={require('../../img/Home/icon_navigationItem_message_white.png')}
                onPress={() => {

                    let params = reqeustPostParams.catList();
                    let outputInfo = "Brand:\n" +
                        DeviceInfo.getBrand() + "\nSystemName:"+
                        DeviceInfo.getSystemName()+"\nManufacturer:"+
                        DeviceInfo.getManufacturer()+ "\nSerialNumber:"+
                        DeviceInfo.getSerialNumber()+"\nBundleId"+
                        DeviceInfo.getBundleId() + "\nDeviceId"+
                        DeviceInfo.getDeviceId() + "\nUniqueID"+
                        DeviceInfo.getUniqueID() + "\nreqeustPostParams:";

                    outputInfo += JSON.stringify(reqeustPostParams.getRequestBody(params))+"\n";

                    Alert.alert('获取到你的设备信息了:', outputInfo);

                }}
            />
        ),
        headerLeft: (
            <NavigationItem
                title='深圳'
                titleStyle={{ color: 'white' }}
                onPress={() => {
                    Alert.alert('你好','你选择的是深圳!');
                }}
            />
        ),
        headerStyle: { backgroundColor: color.theme },
    });

    state: {
        discounts: Array<Object>,
        dataList: Array<Object>,
        refreshing: boolean,
    };

    constructor(props: Object) {
        super(props);

        this.state = {
            discounts: [],
            dataList: [],
            refreshing: false,
            catIds: [],
        };

        { (this: any).requestData = this.requestData.bind(this) }
        { (this: any).renderCell = this.renderCell.bind(this) }
        { (this: any).onCellSelected = this.onCellSelected.bind(this) }
        { (this: any).keyExtractor = this.keyExtractor.bind(this) }
        { (this: any).renderHeader = this.renderHeader.bind(this) }
        { (this: any).onGridSelected = this.onGridSelected.bind(this) }
        { (this: any).onMenuSelected = this.onMenuSelected.bind(this) }
    }

    componentDidMount() {
        this.requestData();
    }

    requestData() {
        this.setState({ refreshing: true });

        this.requestDiscount();
        //this.requestRecommend();
        this.requestPostData();
    }

    async requestPostData(){
        let catIds = [14,15,17,23,24];
        let num = Math.random()*(catIds.length-1);
        num = Math.ceil(num);

        let params = reqeustPostParams.catGoodsList(catIds[num]);
        let formData = reqeustPostParams.getRequestFormData(params);
        try{
            let jsonResponse = await fetch(reqeustPostParams.API_GATEWAY,{
                method: 'POST',
                body: formData
            });
            let jsonData = await jsonResponse.json();
            if( jsonData.errcode == 200 )
            {
                let data = jsonData.data.goods_list.map((data)=>{
                    return {
                        id: data.goods_id,
                        imageUrl: data.goods_thumb,
                        title: data.goods_name,
                        subtitle: `[${data.store_id > 0 ? '合伙人':'用户'}]${data.short_desc}`,
                        price: data.special_price
                    }
                });
                this.setState({
                    dataList: data,
                    refreshing: false,
                });
                //Alert.alert('信息提示', JSON.stringify(this.state.dataList));
            }
            else{
                Alert.alert('信息提示', jsonData.msg);
            }
        }catch(e){
            Alert.alert('错误提示', e);
        }
    }

    async requestRecommend() {

        try {
            let response = await fetch(api.recommend);
            let json = await response.json();

            let dataList = json.data.map(
                (info) => {
                    return {
                        id: info.id,
                        imageUrl: info.squareimgurl,
                        title: info.mname,
                        subtitle: `[${info.range}]${info.title}`,
                        price: info.price
                    }
                }
            );

            this.setState({
                dataList: dataList,
                refreshing: false,
            });

        } catch (error) {
            this.setState({ refreshing: false })
        }
    }

    async requestDiscount() {
        try {
            let response = await fetch(api.discount);
            let json = await response.json();
            this.setState({ discounts: json.data });
        } catch (e) {
            Alert.alert('错误提示', e);
        }
    }

    renderCell(info: Object) {
        return (
            <GroupPurchaseCell
                info={info.item}
                onPress={this.onCellSelected}
            />
        );
    }

    onCellSelected(info: Object) {
        StatusBar.setBarStyle('default', false);
        this.props.navigation.navigate('GroupPurchase', { info: info })
    }

    keyExtractor(item: Object, index: number) {
        return item.id
    }

    renderHeader() {
            return (
                <View>
                    <HomeMenuView menuInfos={api.menuInfo} onMenuSelected={this.onMenuSelected} />

                    <SpacingView />

                    <HomeGridView infos={this.state.discounts} onGridSelected={(this.onGridSelected)} />

                    <SpacingView />

                    <View style={styles.recommendHeader}>
                        <Heading2>猜你喜欢</Heading2>
                    </View>
                </View>
            );
    }

    onGridSelected(index: number) {
        let discount = this.state.discounts[index];

        if ( discount.type == 1 ) {
            StatusBar.setBarStyle('default', false);

            let location = discount.tplurl.indexOf('http');
            let url = discount.tplurl.slice(location);
            this.props.navigation.navigate('Web', { url: url });
        }
    }

    onMenuSelected(index: number) {
        alert(index);
    }

    render() {
        if( this.state.dataList.length > 0 )
        {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={this.state.dataList}
                        keyExtractor={this.keyExtractor}
                        onRefresh={this.requestData}
                        refreshing={this.state.refreshing}
                        ListHeaderComponent={this.renderHeader}
                        renderItem={this.renderCell}
                    />
                </View>
            );
        }
        else
        {
            return (
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={color.border}>Loading...</Text>
                </View>
            );
        }
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.background
    },
    recommendHeader: {
        height: 35,
        justifyContent: 'center',
        borderWidth: screen.onePixel,
        borderColor: color.border,
        paddingVertical: 8,
        paddingLeft: 20,
        backgroundColor: 'white'
    },
    searchBar: {
        width: screen.width * 0.7,
        height: 30,
        borderRadius: 19,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        alignSelf: 'center',
    },
    searchIcon: {
        width: 20,
        height: 20,
        margin: 5,
    }
});

//make this component available to the app
export default HomeScene;
