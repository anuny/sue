import type from './type'
export default function filter(base,data,dataKey,key) {
  if(type(key).isArray){
    key.forEach(k=> filter(base,data,dataKey,k))
  }else{
    let defData = base[key]||base.options[key]
    let keys = Object.keys(data)
    keys.forEach(k=>{
      if(defData && defData.hasOwnProperty(k)){
        delete data[k];
        Fui.log('warn',`${dataKey}["${k}"] has already been defined as a "${key}" property`)
      }
    })
  }
  return data
}