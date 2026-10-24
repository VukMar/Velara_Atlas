/** Creator-approved 4.2G universal welcome copy; independent of world history and audio. */
export function validateOpeningData(value) {
  const keys=['title','subtitle','message'];
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype||
    Reflect.ownKeys(value).length!==keys.length||keys.some(key=>{
      const field=Object.getOwnPropertyDescriptor(value,key);
      return !field||!Object.hasOwn(field,'value')||typeof field.value!=='string'||!field.value.trim();
    }))throw new TypeError('Invalid NEXUS opening configuration: expected exactly title, subtitle and message as nonempty strings.');
  return Object.freeze({...value});
}
