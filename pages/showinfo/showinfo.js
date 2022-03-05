// pages/showinfo/showinfo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        information: {},
        openid:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var data=wx.getStorageSync('openid');
        this.setData({
            openid:data
        })
        wx.request({
            url: 'https://www.zzwwork.xyz:8081/getUserInfoByid', 
            data:{
                openid:this.data.openid,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success:(res)=> {
                this.setData({
                    information:res.data,
                })
            }
          })
        // var that=this;
        // wx.getStorage({
        //     key:"information",
        //     success: function(res){
        //         that.setData({
        //             information:res.data,
        //         })
        //     }
        // })
        // wx.getStorage({
        //     key:"userSex",
        //     success: function(res){
        //         that.setData({
        //             userSex:res.data,
        //         })
        //     }
        // })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})