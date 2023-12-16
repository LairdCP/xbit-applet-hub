import{_ as g,d as b,o as n,c as d,a as t,t as i,w as U,v,n as c,b as r,F as w,r as y,f as k,g as T,T as I,x as o,h as C,u as D,i as f,e as u}from"./index-ab81df0e.js";const F=b({name:"HomeView",setup(){const e="DA2E7828-FBCE-4E01-AE9E-261174997C48";return{xbit:o,firmwareUpdateStore:C(),GUID_SMP:e,devicesStore:D()}},data(){return{images:[],selectedFile:!1,pendingFile:!1,showAdvanced:!1,jsonDataListener:null,progressInfo:"",updateFirmwareAction:"Update Firmware",settingUpSmp:!1,readingImageState:!1,testingImageState:!1,confirmingImageState:!1,erasingImage:!1,resetting:!1,uploading:!1,testButtonDisabled:!0,confirmButtonDisabled:!0,eraseButtonDisabled:!1}},async mounted(){this.devicesStore.connected||this.$router.push({name:"home"}),this.firmwareUpdateStore.mcumgr.onMessage(async({op:e,group:s,id:m,data:l,length:p})=>{switch(s){case f.MGMT_GROUP_ID_OS:switch(m){case f.OS_MGMT_ID_ECHO:alert(l.r);break;case f.OS_MGMT_ID_TASKSTAT:console.table(l.tasks);break;case f.OS_MGMT_ID_MPSTAT:console.log(l);break}break;case f.MGMT_GROUP_ID_IMAGE:switch(m){case f.IMG_MGMT_ID_STATE:this.firmwareUpdateStore.processReadStateResponse(l)}}}),this.jsonDataListener=e=>{if(e.method==="filePickerSelected"){const s={target:{files:[{name:s.params.name,size:s.params.imageData.length,path:"",lastModified:Date.now()}]}};this.selectFile(s)}},o.addEventListener("bluetoothNotificationReceived",this.jsonDataListener),o.addEventListener("filePickerSelected",this.jsonDataListener),this.$watch("devicesStore.connected",async e=>{if(e)o.sendClearToast();else{if(this.firmwareUpdateStore.resetting)return;this.firmwareUpdateStore.uploading||this.firmwareUpdateStore.deselectFile(),o.sendToast({type:"error",message:"Disconnected"}),this.persistConnection?await this.devicesStore.connectDevice(this.devicesStore.selected):this.$router.push({name:"home"})}}),this.$watch("firmwareUpdateStore.state",async e=>{this.showAdvanced||(e===0?setTimeout(()=>{this.stateAction()},1e3):e===1&&setTimeout(()=>{this.stateAction()},1e3))}),this.firmwareUpdateStore.setState(0)},async beforeRouteLeave(){if(o.removeEventListener("jsonData",this.jsonDataListener),this.firmwareUpdateStore.uploading)return o.sendToast({type:"error",message:"Uploading in progress, please wait."}),!1;this.devicesStore.connected&&await this.devicesStore.disconnectDevice(),this.firmwareUpdateStore.resetStateMachine()},methods:{async stateAction(){if(this.firmwareUpdateStore.state===0)try{await this.firmwareUpdateStore.detectSmp(),this.nextState()}catch(e){console.log("error detecting  SMP",e)}else if(this.firmwareUpdateStore.state===1)try{await this.firmwareUpdateStore.readImageState()}catch(e){console.log("error reading image state",e)}else this.firmwareUpdateStore.state===2?this.firmwareUpdateStore.imageUpload():this.firmwareUpdateStore.state===3?this.firmwareUpdateStore.imageTest():this.firmwareUpdateStore.state===4?this.reset():this.firmwareUpdateStore.state===5?this.firmwareUpdateStore.eraseImage():this.firmwareUpdateStore.state===6?this.firmwareUpdateStore.imageConfirm():this.firmwareUpdateStore.state},nextState(){this.firmwareUpdateStore.setState(this.firmwareUpdateStore.state+1)},async reset(){if(this.firmwareUpdateStore.state===4)return o.sendToast({message:"Resetting... Please wait.",options:{autoClose:!1}}),this.firmwareUpdateStore.currentState.busy=!0,await o.sendBleWriteCommand({data:this.firmwareUpdateStore.mcumgr.cmdReset(),uuid:this.firmwareUpdateStore.smpCharId,deviceId:this.devicesStore.connected}),await this.devicesStore.startScanning(120*1e3),new Promise((e,s)=>{const m=setTimeout(async()=>{await this.devicesStore.stopScanning(device),this.firmwareUpdateStore.currentState.busy=!1,s()},12e4),l=setInterval(async()=>{for(const p of this.devicesStore.devices)if(p.address===this.devicesStore.selected){clearInterval(l),clearTimeout(m),this.firmwareUpdateStore.currentState.busy=!1;try{await this.devicesStore.stopScanning(p),await this.devicesStore.connectDevice(p),this.firmwareUpdateStore.setState(0)}catch(h){console.log("error resetting",h)}e();break}},1e3)})},filePicker(){o.sendFilePickerCommand({accept:".bin"})},deselectFile(){this.firmwareUpdateStore.deselectFile();try{this.$refs.fileInput.value=""}catch{}}}}),M={class:"grow"},E={class:"m-2 text-white"},A={class:"p-2"},P={class:"m-2"},B=["disabled"],G=["disabled"],L=["disabled"],$=["disabled"],R=["disabled"],O=["disabled"],V={class:"flex flex-row w-full"},_=t("i",{class:"fa-solid fa-microchip py-2 my-2"},null,-1),j=["disabled"],N=t("i",{class:"fa-solid fa-trash-can"},null,-1),z=[N],H={class:"whitespace-nowrap"},K={key:0},W={key:1,class:"mt-2"},q=t("i",{class:"fa-solid fa-file-code"},null,-1),J={key:0,class:"bg-canvas-slate-700 text-white p-2 m-2"},Q=t("i",{class:"fa-solid fa-microchip py-2 my-2"},null,-1),X=t("i",{class:"fas fa-times"},null,-1),Y=[X],Z={key:0,class:"text-white m-2 p-2 bg-canvas-sky-700"},x=t("i",{class:"fa-solid fa-spinner fa-spin"},null,-1),ee={key:1,class:"text-white m-2 p-2 bg-canvas-sky-700"},te={class:"action-button btn-gradient-1"},se=["disabled"];function ae(e,s,m,l,p,h){return n(),d(w,null,[t("div",M,[t("h3",E,[t("span",A," Connected to "+i(e.devicesStore.connected||"?"),1)]),U(t("div",P,[t("button",{class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25",disabled:e.firmwareUpdateStore.states[0].busy||!e.firmwareUpdateStore.states[0].ready,onClick:s[0]||(s[0]=(...a)=>e.firmwareUpdateStore.setupSmp&&e.firmwareUpdateStore.setupSmp(...a))},[t("i",{class:c(["fa-solid fa-arrows-rotate",{"fa-spin":e.firmwareUpdateStore.states[0].busy}])},null,2),r(" "+i(e.firmwareUpdateStore.states[0].actionText),1)],8,B),t("button",{class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25",disabled:e.firmwareUpdateStore.states[1].busy||!e.firmwareUpdateStore.states[1].ready,onClick:s[1]||(s[1]=(...a)=>e.firmwareUpdateStore.readImageState&&e.firmwareUpdateStore.readImageState(...a))},[t("i",{class:c(["fa-solid fa-arrows-rotate",{"fa-spin":e.firmwareUpdateStore.states[1].busy}])},null,2),r(" "+i(e.firmwareUpdateStore.states[1].actionText),1)],8,G),t("button",{class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25",disabled:e.firmwareUpdateStore.states[3].busy||!e.firmwareUpdateStore.states[3].ready,onClick:s[2]||(s[2]=(...a)=>e.firmwareUpdateStore.imageTest&&e.firmwareUpdateStore.imageTest(...a))},[t("i",{class:c(["fa-solid fa-arrows-rotate",{"fa-spin":e.firmwareUpdateStore.states[3].busy}])},null,2),r(" "+i(e.firmwareUpdateStore.states[3].actionText),1)],8,L),t("button",{class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25",onClick:s[3]||(s[3]=(...a)=>e.imageConfirm&&e.imageConfirm(...a)),disabled:e.confirmButtonDisabled||e.confirmingImageState}," Image Confirm ",8,$),t("button",{class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25",onClick:s[4]||(s[4]=(...a)=>e.imageErase&&e.imageErase(...a)),disabled:e.eraseButtonDisabled||e.erasingImage}," Image Erase ",8,R),t("button",{class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25",onClick:s[5]||(s[5]=(...a)=>e.reset&&e.reset(...a)),disabled:e.resetting},[t("i",{class:c(["fa-solid fa-arrows-rotate",{"fa-spin":e.resetting}])},null,2),r(" Reset ")],8,O)],512),[[v,e.showAdvanced]]),t("div",V,[(n(!0),d(w,null,y(e.firmwareUpdateStore.images,a=>(n(),d("div",{key:a.slot,class:"p-2 m-2 text-white bg-canvas-slate-700 grow"},[t("h3",null,[_,r(" Slot "+i(a.slot+1)+" ",1),a.slot===1&&!e.uploading&&!a.empty?(n(),d("button",{key:0,class:"bg-canvas-slate-600 text-white p-2 m-2 rounded disabled:opacity-25 float-right",onClick:s[6]||(s[6]=(...S)=>e.firmwareUpdateStore.imageErase&&e.firmwareUpdateStore.imageErase(...S)),disabled:e.firmwareUpdateStore.states[5].busy},z,8,j)):u("",!0)]),t("div",H,"Version: "+i(a.version),1),a.empty?u("",!0):(n(),d("div",K,[t("div",null,[r("Pending "),t("i",{class:c({"fa-solid fa-circle-check":a.pending,"fa-regular fa-circle":!a.pending})},null,2)]),t("div",null,[r("Confirmed "),t("i",{class:c({"fa-solid fa-circle-check":a.confirmed,"fa-regular fa-circle":!a.confirmed})},null,2)]),t("div",null,[r("Bootable "),t("i",{class:c({"fa-solid fa-circle-check":a.bootable,"fa-regular fa-circle":!a.bootable})},null,2)])])),a.slot===1?(n(),d("div",W,[t("label",{class:"bg-canvas-slate-600 text-white p-2 rounded cursor-pointer block text-center",for:"fileInput",onClick:s[7]||(s[7]=(...S)=>e.filePicker&&e.filePicker(...S))},[q,r(" Image")]),t("input",{type:"file",id:"fileInput",onChange:s[8]||(s[8]=(...S)=>e.firmwareUpdateStore.selectFile&&e.firmwareUpdateStore.selectFile(...S)),class:"hidden",accept:".bin"},null,32)])):u("",!0)]))),128))]),k(I,{name:"fade",mode:"out-in"},{default:T(()=>[e.firmwareUpdateStore.selectedFile?(n(),d("div",J,[t("h3",null,[Q,r(" Selected File "),t("button",{onClick:s[9]||(s[9]=a=>e.deselectFile()),class:"float-right text-canvas-slate-500 hover:text-white"},Y)]),t("div",null,"Version: "+i(e.firmwareUpdateStore.selectedFile.version),1),t("div",null,"File Name: "+i(e.firmwareUpdateStore.selectedFile.name),1),t("div",null,"File Last Modified: "+i(e.xbit.toDate(e.firmwareUpdateStore.selectedFile.lastModified)),1),t("div",null,"Image Size: "+i(e.firmwareUpdateStore.selectedFile.imageSize),1)])):u("",!0)]),_:1}),e.firmwareUpdateStore.currentState.progressText&&e.firmwareUpdateStore.currentState.busy?(n(),d("div",Z,[x,r(" "+i(e.firmwareUpdateStore.currentState.progressText),1)])):(n(),d("div",ee,i(e.firmwareUpdateStore.currentState.infoText),1))]),t("div",te,[t("button",{onClick:s[10]||(s[10]=a=>e.stateAction()),class:"bg-canvas-slate-800 text-white p-4 w-full h-full disabled:opacity-25 cursor-pointer",disabled:e.firmwareUpdateStore.currentState.busy||!e.firmwareUpdateStore.currentState.ready},i(e.firmwareUpdateStore.currentState.actionText),9,se)])],64)}const re=g(F,[["render",ae]]);export{re as default};
