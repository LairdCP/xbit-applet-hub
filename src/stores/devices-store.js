import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { xbit } from '@bennybtl/xbit-lib'

export const useDevicesStore = defineStore({
  id: 'devicesStore',
  state: () => {
    return {
      devices: [],
      connected: null,
      selected: null,
      scanSessionId: null,
      connectingState: null,
      disconnectingState: null
    }
  },
  getters: {
    connectedDevice: (state) => {
      return state.devices.find(device => device.address === state.connected)
    },
    selectedDevice: (state) => {
      return state.devices.find(device => device.address === state.selected)
    },
    selectedDeviceAddress: (state) => {
      return state.selectedDevice?.address
    },
  },
  actions: {
    clear () {
      this.devices.length = 0
    },
    async stopScanning () {
      if (this.scanningTimeout === null) return null
      // stop timeout
      clearTimeout(this.scanningTimeout)
      try {
        await xbit.sendStopBluetoothScanningCommand()
        this.scanningTimeout = null
        return this.scanningTimeout
      } catch (error) {
        xbit.sendToast({
          type: 'error',
          message: error.message
        })
        return true
      }
    },
    async startScanning (timeout = 5000) {
      if (this.scanningTimeout) {
        return this.stopScanning()
      }
      this.clear() 

      // start timeout
      this.scanningTimeout = setTimeout(async () => {
        // stop scan
        this.stopScanning()
      }, timeout)

      // send scan command
      try {
        const command = await xbit.sendStartBluetoothScanningCommand()
        this.scanSessionId = command.i || command.id || null
      } catch (error) {
        console.log('error', error)
        xbit.sendToast({
          type: 'error',
          message: error.message
        })
      }
    },
    processConnect (event) {
      if (this.connectingState?.deviceId === event.params.deviceId) {
        this.connected = event.params.deviceId
        clearTimeout(this.connectingState.timeout)
        this.connectingState.resolve(this.connected)
        this.connectingState = null
      }
    },
    processDisconnect (event) {
      if (this.disconnectingState?.deviceId === event.params.deviceId) {
        clearTimeout(this.disconnectingState.timeout)
        this.disconnectingState.resolve(this.connected)
        this.disconnectingState = null
        this.connected = null
      } else if (this.connected === event.params.deviceId) {
        this.connected = null
      } else {
        // ignore ?
      }
    },
    processAd (event) {
      if (event.id !== this.scanSessionId) return

      // const ad = event.params.data
      // check if device already exists
      const device = this.devices.find(device => device.address === event.params.deviceId)
      if (device) {
        // update device
        device.rssi = event.params.rssi
        device.ad = event.params.ad
        if (event.params.pduType) device.pduType = xbit.convertPduType(event.params.pduType)
      } else {
        // add device
        const newDevice = {
          address: event.params.deviceId,
          rssi: event.params.rssi,
          ad: event.params.ad,
        }
        if (event.params.pduType) newDevice.pduType = xbit.convertPduType(event.params.pduType)
        this.devices.push(newDevice)
      }
    },
    selectDevice (device) {
      if (device.address === this.selected) {
        this.selected = null
        return
      }
      this.selected = device.address
    },
    // pass a device or address or nothing
    // if nothing, use selected device
    //
    // returns the connected device if successful
    // returns null if unsuccessful
    async connectDevice (device = null) {
      if (this.connectingState) {
        return this.connectingState.promise
      }
      if (!device) {
        device = this.selectedDevice
      }

      if (typeof device === 'string') {
        device = this.devices.find(d => d.address === device)
      }

      try {
        // this command returns immediately if successful
        // but it's not yet actually connected
        await xbit.sendBluetoothConnectCommand({
          deviceId: device.address
        })
        // now in connecting state while waiting for the connection
        this.connectingState = {
          deviceId: this.selected
        }
        const aPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('connectDevice Timeout'))
          }, 7500)

          this.connectingState.resolve = resolve
          this.connectingState.reject = reject
          this.connectingState.timeout = timeout
        })
        this.connectingState.promise = aPromise
        return aPromise
      } catch (error) {
        return Promise.reject(error)
      }  
    },
    async disconnectDevice (device = null) {
      try {
        const result = await xbit.sendBluetoothDisconnectCommand()
        // if the device is not connected, return
        if (result.e === 'NOCONN') {
          return Promise.resolve()
        }
        this.disconnectingState = {
          deviceId: this.selected
        }
        const aPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'))
          }, 5000)

          this.disconnectingState.resolve = resolve
          this.disconnectingState.reject = reject
          this.disconnectingState.timeout = timeout
        })
        this.disconnectingState.promise = aPromise
        return aPromise
      } catch (error) {
        xbit.sendToast({
          message: error.message,
          type: 'error'
        })
        return this.connected
      }  
    }
  }
})