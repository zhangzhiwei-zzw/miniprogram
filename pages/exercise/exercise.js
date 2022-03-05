const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}
// 十六进制转换为十进制
function hextodec(charac) {
  if(charac>='0' && charac<='9')
  return parseInt(charac);
  else if(charac==="a")
  return 10;
  else if(charac==="b")
  return 11;
  else if(charac==="c")
  return 12;
  else if(charac==="d")
  return 13;
  else if(charac==="e")
  return 14;
  else if(charac==="f")
  return 15;
}

// wx, wy大于2000输出-4000的绝对值
function dealdata(num){
    if(num>2000)
    return Math.abs(num-4000);
    else
    return num;
}

// 运动状态输出
function judgecon(num1,num2){
    dealdata(num1);
    dealdata(num2);
    // var sum=Math.pow(num1,2)+Math.pow(num2,2)+Math.pow(num2,2);
    // sum=Math.sqrt(sum,2);
    if(num1<=45)
    return "您当前运动速度合适，为有效运动";
    if(num1>45)
    return "您当前运动速度过快，不能有效舒缓颈椎";

    if(num2<=45)
    return "您当前运动速度合适，为有效运动";
    if(num2>45)
    return "您当前运动速度过快，不能起到舒缓颈椎的作用";
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    wxL: 0,
    wxH: 0,
    wyL: 0,
    wyH: 0,
    wx: 0,
    wy: 0,
    condition: ""
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            this.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value),
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value),
        }
      }
      this.setData(data)
      
      this.setData({
        // 计算角速度 wx: ((this.data.wxH<<8)|this.data.wxL)/32768*2000
        wxL: hextodec(this.data.chs[0].value[16])*16+hextodec(this.data.chs[0].value[17]),
        wxH: hextodec(this.data.chs[0].value[18])*16+hextodec(this.data.chs[0].value[19]),
        wx: ((this.data.wxH<<8)|this.data.wxL)/32768*2000,
        
        wyL: hextodec(this.data.chs[0].value[20])*16+hextodec(this.data.chs[0].value[21]),
        wyH: hextodec(this.data.chs[0].value[22])*16+hextodec(this.data.chs[0].value[23]),
        wy: ((this.data.wyH<<8)|this.data.wyL)/32768*2000,

        // wzL: hextodec(this.data.chs[0].value[24])*16+hextodec(this.data.chs[0].value[25]),
        // wzH: hextodec(this.data.chs[0].value[26])*16+hextodec(this.data.chs[0].value[27]),
        // wz: ((this.data.wzH<<8)|this.data.wzL)/32768*2000,

        condition: judgecon(this.data.wx,this.data.wy),
      })
    })
  },
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, Math.random() * 255 | 0)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._deviceId,
      characteristicId: this._characteristicId,
      value: buffer,
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
})
