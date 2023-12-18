import{_ as u,d as h,o,c as n,a as i,b as a,F as r,r as f,n as d,u as S,x as c,e as l,t as v}from"./index-aeb79f51.js";const p=h({name:"HomeView",setup(){return{devicesStore:S()}},async beforeRouteLeave(){return await this.devicesStore.stopScanning()===null},async mounted(){this.devicesStore.clear(),await this.devicesStore.disconnectDevice(),await this.devicesStore.startScanning()},methods:{formatAddress(e){const s=e.match(/.{1,2}/g);return s.reverse(),s.pop(),s.join("")},async selectDevice(e){this.devicesStore.selectDevice(e)},async connectDevice(e){c.sendToast({message:"Connecting...",options:{autoClose:!1}}),this.devicesStore.connected&&await this.devicesStore.disconnectDevice(),this.devicesStore.scanningTimeout&&await this.devicesStore.stopScanning(),this.$watch("devicesStore.connected",async s=>{s&&(c.sendClearToast(),this.$router.push({name:"update"}))});try{await this.devicesStore.connectDevice(e)}catch(s){console.log(s),c.sendToast({type:"error",message:"Unable to connect"})}}}}),m={key:0,class:"p-2 mb-2 text-white"},g=a("i",{class:"fa-solid fa-arrows-rotate"},null,-1),y={key:1,class:"p-2 mb-2 text-white"},w={class:"flex flex-col",style:{flex:"1 1 auto",height:"100%","overflow-y":"auto","overflow-x":"hidden"}},b=["onClick"],D={key:0},C={key:1,class:"fas fa-check"},k={class:"action-button btn-gradient-1",style:{"justify-self":"flex-end"}},_=["disabled"];function $(e,s,T,x,B,V){return o(),n(r,null,[e.devicesStore.sortedDevices.length===0&&!e.devicesStore.scanningTimeout?(o(),n("h3",m,[i("Scan for BLE Devices "),g])):(o(),n("h3",y,"Select Device")),a("div",w,[(o(!0),n(r,null,f(e.devicesStore.sortedDevices,t=>(o(),n("div",{key:t.address,class:d(["bg-canvas-slate-500 p-2 mb-2 rounded text-white text-center cursor-pointer hover:bg-canvas-slate-600 mx-auto",{"bg-canvas-sky-500":t.address===e.devicesStore.connected,"bg-canvas-slate-600":t.address===e.devicesStore.selected,"opacity-25":!t.isCanvas}]),onClick:L=>e.selectDevice(t)},[t.isCanvas?(o(),n("span",D,"Canvas ")):l("",!0),i("Device "+v(e.formatAddress(t.address))+", "+v(t.rssi)+" dBm ",1),t.address===e.devicesStore.selected?(o(),n("i",C)):l("",!0)],10,b))),128))]),a("div",k,[a("button",{onClick:s[0]||(s[0]=t=>e.connectDevice(e.devicesStore.selected)),class:d(["bg-canvas-slate-800 p-4 w-full h-full",{"text-white cursor-pointer":e.devicesStore.selected,"text-gray-600 cursor-not-allowed":!e.devicesStore.selected}]),disabled:!e.devicesStore.selected}," Continue ",10,_)])],64)}const j=u(p,[["render",$]]);export{j as default};