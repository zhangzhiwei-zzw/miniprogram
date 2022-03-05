Page({
    data: {
      sex:[
        {name:'0',value:'男',checked:'true'},
        {name:'1',value:'女'}
      ],
      isSex:"0",
      information:[],
      userSex:'',
      openid:'',
      modalHidden:true
    },
    //单选按钮发生变化
    radioChange(e){
      console.log(e.detail.value);
      var sexName=this.data.isSex
      this.setData({
        isSex:e.detail.value
      })
    },
    //表单提交
    formSubmit(e){
      console.log(e.detail.value);
      var userSex=this.data.isSex==0?'男':'女';
      var information= e.detail.value;
      console.log(userSex);
      this.setData({
        information: e.detail.value,
        userSex,
        modalHidden:false
      });
      wx.setStorage({
        key:"information",
        data:information,

      })
      wx.setStorage({
        key:"userSex",
        data:userSex,
      })
    },
    //模态框取消
    modalCancel(){
      wx.showToast({
        title: '取消提交',
        icon:'none'
      })
      this.setData({
        modalHidden:true,
      })
    },
    //模态框确定
    modalConfirm:function(e) {
      wx.request({
        url: 'https://www.zzwwork.xyz:8081/addUserInfo',
        data: {
          openid:this.data.openid,
          name:this.data.information.name,
          age:this.data.information.nl,
          work:this.data.information.zy,
          height:this.data.information.sg,
          weight:this.data.information.tz,
          phone:this.data.information.sjh,
          email:this.data.information.yx,
          sex:this.data.userSex
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          console.log(res.data)
        }
      })
      wx.showToast({
        title: '提交成功',
        icon:'success'
      })
      this.setData({
        modalHidden: true,
      })
      wx.navigateBack({
        delta: 1
      })
      
    },
    onLoad: function (options) {
      var data=wx.getStorageSync('openid')
      this.setData({
        openid:data
      })
    }
  })
    