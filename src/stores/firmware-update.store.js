import { MCUManager, constants } from '@/assets/mcumgr'
import { useDevicesStore } from './devices-store'
import { defineStore } from 'pinia'
import { xbit } from '@bennybtl/xbit-lib'

let selectedFileData = null
const states = [
  {
    name: 'detectSmp',
    ready: true, // no initialization required. Can send the detect command
    busy: false, // this state is busy
    actionText: 'Detect SMP',
    infoText: 'Request GATT SMP service to determine if device is SMP capable.',
  },
  {
    name: 'readImageState',
    ready: false, // Can send the read image state command
    busy: false,
    actionText: 'Read Image State',
    progressText: 'Reading Image State...',
    infoText: 'Read Image State to determine firmware status.',
  },
  {
    name: 'uploadImageState',
    ready: false, // requires user to select an image
    busy: false,
    actionText: 'Upload Image',
    progressText: '',
    infoText: 'Select a firmware file to upload to slot 2.',
  },
  {
    name: 'readyImageState',
    ready: false,
    busy: false,
    actionText: 'Test Image',
    infoText: 'Slot 2 has a valid image. Click "Test Image" to test it or upload a different image.',
  },
  {
    name: 'resetState',
    ready: false,
    busy: false,
    actionText: 'Reset Device',
    infoText: 'The device will reset and swap firmware images. It will attempt to boot the new image, and if not successful, will revert to the previous image. This may take up to 2 minutes.',
    progressText: 'The device is resetting and swapping firmware images.',
  },
  {
    name: 'invalidImageState',
    ready: false,
    busy: false,
    actionText: 'Erase Image',
    infoText: 'Slot 2 has a invalid image. Click "Erase Image" to erase it or upload a different image',
  },
  {
    name: 'validImageState',
    ready: false,
    busy: false,
    actionText: 'Confirm Image',
    infoText: 'Slot 2 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.',
  },
  {
    name: 'finishedState',
    ready: true,
    busy: false,
    actionText: 'Disconnect',
    infoText: 'Firmware has been updated. Click "Disconnect" to disconnect from the device.',
  },
  {},
  {},
  {
    name: 'initState',
    ready: true,
    busy: false,
    actionText: '',
    infoText: '',
  }
]

export const useFirmwareUpdateStore = defineStore({
  id: 'firmwareUpdateStore',
  state: () => {
    return {
      mcumgr: new MCUManager(),
      state: 10,
      states: JSON.parse(JSON.stringify(states)),
      images: [],
      selectedFile: null,
      readingImageState: false,
      pendingVersion: null,
      smpCharId: 'DA2E7828-FBCE-4E01-AE9E-261174997C48',
      GUID_SMP: 'DA2E7828-FBCE-4E01-AE9E-261174997C48',
      GUID_SERVICE_SMP: '8D53DC1D-1DB7-4CD3-868B-8A527460AA84',
    }
  },
  getters: {
    currentState (state) {
      return state.states[state.state]
    },
    nextState (state) {
      return state.states[state.state + 1]
    }
  },
  actions: {
    setState (id) {
      this.state = id
    },
    resetStateMachine () {
      this.state = 10
      this.states = JSON.parse(JSON.stringify(states))
    },
    processNotification (event) {
      if (event.params.uuid.toLowerCase() === this.smpCharId.toLowerCase()) {
        this.mcumgr._notification(event.params.data)
      }
    },
    async processReadStateResponse (data) {
      if (data.images) {
        this.images = data.images
      } else {
        return
      }

      if (this.readingImageState) {
        clearTimeout(this.readingImageState.timeout)
        this.readingImageState.resolve()
        this.readingImageState = null
      }
      this.states[1].busy = false
      this.states[1].ready = true
      // this.states[1].done = true

      // if slot 2 is empty, set state to uploadImageState
      if (this.images.length === 1) {
        this.images.push({
          slot: 1,
          empty: true,
          version: 'Empty',
          pending: false,
          confirmed: false,
          bootable: false
        })
        // switch to upload state
        return this.setState(2)
      }

      if (this.images.length === 2) {
        if (!this.images[1].bootable) {
          // switch to invalid state
          return this.setState(5)
        } else if (this.images[0].version === this.pendingVersion || 
          !this.images[0].confirmed) {
          if (this.images[0].confirmed) {
            // switch to finished state
            return this.setState(7)
          } else {
            // running the new version, switch to confirm
            this.states[6].ready = true
            return this.setState(6)
          }
        }
        if (this.images[1].pending === false) {
          // switch to test state to mark as pending
          this.states[3].ready = true
          return this.setState(3)
        } else {
          // switch to reset state and indicate ready
          this.pendingVersion = this.images[1].version
          this.states[4].ready = true
          return this.setState(4)
        }
      }
    },
    async imageTest () {
      const devicesStore = useDevicesStore()
      if (
        this.images.length > 1 &&
        this.images[1].pending === false &&
        this.state === 3
      ) {
        this.currentState.busy = true
        try {
          await xbit.sendBleWriteCommand({
            data: this.mcumgr.cmdImageTest(this.images[1].hash),
            uuid: this.smpCharId,
            deviceId: devicesStore.connected
          })
          // this.currentState.done = true
          this.states[4].ready = true
          return this.setState(4)
        } catch (error) {
          console.log(error)
        } finally {
          this.currentState.busy = false
        }
      }
    },
    async detectSmp () {
      if (this.state !== 0) return
      const devicesStore = useDevicesStore()
      this.currentState.busy = true

      const dictionaryResponse = await xbit.sendBleGetGattDictionaryCommand({
        deviceId: devicesStore.connected
      })

      this.smpCharId = null
      for (const service in dictionaryResponse.j) {
        if (dictionaryResponse.j[service].UUID.toUpperCase() === this.GUID_SERVICE_SMP) {
          for (const characteristic in dictionaryResponse.j[service]) {
            if (/^Characteristic/.test(characteristic) &&
              dictionaryResponse.j[service][characteristic].UUID) {
              if (dictionaryResponse.j[service][characteristic].UUID.toUpperCase() === this.GUID_SMP) {
                this.smpCharId = this.GUID_SMP
                break;
              }
            }
          }
        }
      }

      if (!this.smpCharId) {
        return Promise.reject(new Error('SMP not found'))
      }

      await xbit.sendBleNotifyEnableCommand({
        uuid: this.smpCharId,
        deviceId: devicesStore.connected
      })

      this.currentState.busy = false
      // this.currentState.done = true
      this.nextState.ready = true
    },
    async readImageState () {
      if (this.state !== 1) return

      const devicesStore = useDevicesStore()
      // this.states[1].done = false
      const sent = await xbit.sendBleWriteCommand({
        data: this.mcumgr.cmdImageState(),
        uuid: this.smpCharId,
        deviceId: devicesStore.connected
      })

      if (!sent) {
        throw new Error('Failed to send command')
      }
      this.states[1].busy = true
      this.readingImageState = {}
      const aPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.states[1].busy = false
          reject(new Error('readImageState Timeout'))
        }, 5000)

        this.readingImageState.resolve = resolve
        this.readingImageState.reject = reject
        this.readingImageState.timeout = timeout
      })
      this.readingImageState.promise = aPromise
      return aPromise
    },
    imageUpload () {
      if (this.state !== 2) return
      const devicesStore = useDevicesStore()
      this.currentState.busy = true
      this.mcumgr.onImageUploadNext(async({ packet }) => {
        return await xbit.sendBleWriteCommand({
          data: packet,
          uuid: this.GUID_SMP,
          deviceId: devicesStore.connected
        })
      })
  
      this.mcumgr.onImageUploadProgress(({ percentage }) => {
        this.currentState.progressText = 'Uploading... ' + percentage + '%'
        // TODO update progress bar
      })
  
      this.mcumgr.onImageUploadFinished(async () => {
        this.currentState.busy = false 
        this.currentState.infoText = 'Upload complete.'
        // set to readState to update image list
        this.setState(1)
      })
  
      this.mcumgr.cmdUpload(selectedFileData, 1)
    },
    async imageErase () {
      const devicesStore = useDevicesStore()
      this.states[5].busy = true
      // after confirm, send this command to apply it
      await xbit.sendBleWriteCommand({
        data: this.mcumgr.cmdImageErase(),
        uuid: this.smpCharId,
        deviceId: devicesStore.connected
      })
      this.states[5].busy = false
      this.setState(1)
    },
    async imageConfirm () {
      const devicesStore = useDevicesStore()
      if (this.images.length > 0 && this.images[0].confirmed === false) {
        const data = this.mcumgr.cmdImageConfirm(this.images[0].hash)

        // after confirm, send this command to apply it
        await xbit.sendBleWriteCommand({
          data,
          uuid: this.smpCharId,
          deviceId: devicesStore.connected
        })
        this.setState(1)
      }
    },
    async selectFile (event) {
      if (this.state !== 2) return
      const onLoad = async (fileResult) => {
        try {
          const info = await this.mcumgr.imageInfo(fileResult)
          this.selectedFile.imageSize = info.imageSize
          this.selectedFile.version = info.version
          selectedFileData = fileResult
          this.currentState.infoText = 'Firmware selected. Click "Upload Image" to begin.'
          this.currentState.actionText = 'Upload Image'
          this.currentState.ready = true
        } catch (error) {
          // TODO invalid file?
        }
      }
      const file = await event.target.files[0]
      if (file) {
        this.selectedFile = {
          name: file.name,
          size: file.size,
          path: file.path,
          lastModified: file.lastModified
        }

        if (!file.imageData) {
          // read the file data
          const reader = new FileReader()
          reader.onload = async (e) => {
            const fileResult = new Uint8Array(e.target.result)
            onLoad(fileResult)
          }
          reader.readAsArrayBuffer(file)
        } else {
          onLoad(file.imageData)
        }
      }
    },
    deselectFile () {
      this.selectedFile = null
      selectedFileData = null
    }
  }
})