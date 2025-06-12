const namesToClasses = {}; 

export function registerClass(cls) {
  namesToClasses[cls.name] = cls;
}

export default namesToClasses;