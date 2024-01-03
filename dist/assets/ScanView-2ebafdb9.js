import{_ as h,d as u,o as t,c as n,a as i,b as c,F as r,r as S,n as d,u as f,x as a,e as l,t as v}from"./index-6185684d.js";const m=u({name:"ScanView",setup(){return{devicesStore:f(),xbit:a}},async beforeRouteLeave(){return await this.devicesStore.stopScanning()===null},async mounted(){this.devicesStore.clear(),await this.devicesStore.disconnectDevice(),await this.devicesStore.startScanning()},methods:{async selectDevice(e){this.devicesStore.selectDevice(e)},async connectDevice(e){a.sendToast({message:"Connecting...",options:{autoClose:!1}}),this.devicesStore.connected&&await this.devicesStore.disconnectDevice(),this.devicesStore.scanningTimeout&&await this.devicesStore.stopScanning(),this.$watch("devicesStore.connected",async o=>{o&&(a.sendClearToast(),this.$router.push({name:"home"}))});try{await this.devicesStore.connectDevice(e)}catch(o){console.log(o),a.sendToast({type:"error",message:"Unable to connect"})}}}}),p={key:0,class:"pl-4 p-2 mb-2 text-white btn-gradient-1"},g=c("i",{class:"fa-solid fa-arrows-rotate"},null,-1),b={key:1,class:"pl-4 p-2 mb-2 text-white btn-gradient-1"},y={class:"flex flex-col",style:{flex:"1 1 auto","overflow-y":"auto","overflow-x":"hidden"}},w=["onClick"],D={key:0},C={key:1,class:"fas fa-check"},k={class:"action-button btn-gradient-1",style:{"justify-self":"flex-end"}},_=["disabled"];function $(e,o,x,T,B,V){return t(),n(r,null,[e.devicesStore.sortedDevices.length===0&&!e.devicesStore.scanningTimeout?(t(),n("h3",p,[i("Scan for BLE Devices "),g])):(t(),n("h3",b,"Select Device")),c("div",y,[(t(!0),n(r,null,S(e.devicesStore.sortedDevices,s=>(t(),n("div",{key:s.address,class:d(["bg-canvas-slate-500 ml-4 p-2 mb-2 rounded text-white text-center cursor-pointer hover:bg-canvas-slate-600 max-w-sm",{"bg-canvas-sky-500":s.address===e.devicesStore.connected,"bg-canvas-slate-600":s.address===e.devicesStore.selected,"opacity-25":!s.isCanvas}]),onClick:L=>e.selectDevice(s)},[s.isCanvas?(t(),n("span",D,"Canvas ")):l("",!0),i("Device "+v(e.xbit.formatAddress(s.address))+", "+v(s.rssi)+" dBm ",1),s.address===e.devicesStore.selected?(t(),n("i",C)):l("",!0)],10,w))),128))]),c("div",k,[c("button",{onClick:o[0]||(o[0]=s=>e.connectDevice(e.devicesStore.selected)),class:d(["bg-canvas-slate-800 p-4 w-full h-full",{"text-white cursor-pointer":e.devicesStore.selected,"text-gray-600 cursor-not-allowed":!e.devicesStore.selected}]),disabled:!e.devicesStore.selected}," Continue ",10,_)])],64)}const E=h(m,[["render",$]]);export{E as default};
