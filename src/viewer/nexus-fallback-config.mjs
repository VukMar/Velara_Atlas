/** Universal UI copy, independent of world records. Never silently substitute dialogue. */
export function validateFallbackData(value) {
  const keys=['title','subtitle','message'];
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype||
    Reflect.ownKeys(value).length!==keys.length||keys.some(key=>{
      const field=Object.getOwnPropertyDescriptor(value,key);
      return !field||!Object.hasOwn(field,'value')||typeof field.value!=='string'||!field.value.trim();
    }))throw new TypeError('Invalid NEXUS fallback configuration: expected exactly title, subtitle and message as nonempty strings.');
  return Object.freeze({...value});
}
