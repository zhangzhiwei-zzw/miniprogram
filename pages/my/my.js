Page({
    data: {
      userInfo: null,
      isUser: false
    },
    getUserProfile() {
      wx.login({
        success: (res)=>{
          if (res.code) {
            //发起网络请求
            wx.request({
              url: 'https://www.zzwwork.xyz:8081/wxUserInfo',
              //获取session_key用于获取unionid
              data: {
                code: res.code
              },
              success: function (data) {
                // console.log(data);
                // wx.setStorageSync('session_key', data.data.session_key)
                wx.setStorageSync('openid', data.data.openid)
              }
            })
           
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
      wx.getUserProfile({
        desc: '使用户得到更好的体验',
        success: (res) => {
          // console.log("获取用户信息成功", res)
          let user = res.userInfo
          wx.setStorageSync('user', user)
          this.setData({
            isUser: true,
            userInfo: user
          })
        },
        fail: res => {
          // console.log("获取用户信息失败", res)
        }
      })
    },
    onShow() {
      this.getUserProfile()
      var user = wx.getStorageSync('user')
      if (user && user.nickName) {
        this.setData({
          isUser: true,
          userInfo: user
        })
      }
    },
    handlepertap(){
      if(!this.data.isUser){
        wx.showToast({
          title: '用户未登录',
          icon:'error'
        })
        }else{
          wx.navigateTo({
            url: '/pages/showinfo/showinfo',
          })
      }
    }
  })
  