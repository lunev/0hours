const t={get:async e=>(await chrome.storage.local.get([e]))[e]??null,set:async(e,a)=>{await chrome.storage.local.set({[e]:a})},remove:async e=>{await chrome.storage.local.remove(e)}};export{t as s};
