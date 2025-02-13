// types/global.d.ts
declare global {
    namespace NodeJS {
      interface Global {
        mongo: {
          conn: any; // You can specify a more precise type if needed
          promise: Promise<any> | null;
        };
      }
    }
  }
  
  export {};