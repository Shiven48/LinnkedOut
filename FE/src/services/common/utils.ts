import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ErrorObj } from '@/services/common/types';

export class utility {
    
    public static async apicaller(
        url: string,
        options: RequestInit = {},
        maxRetries: number = 1,
        baseTimeout: number = 1000
    ): Promise<any> {
    if (!url || typeof url !== 'string') throw new Error(`Error in apicaller: Invalid URL - ${url}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fetch(url, options);
      } catch (error: any) {
        if (attempt < maxRetries) {
          console.warn(`Attempt ${attempt} failed. Retrying in ${baseTimeout}ms...`);
          await new Promise((res) => setTimeout(res, baseTimeout));
        } else {
          throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
        }
      }
    }
  }

    public cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
    }

    public HandleError(error:any){
    if (error instanceof Error) {
        console.error("Error fetching videos:", error);
        const errorObj:ErrorObj = { 
        name: error.name, 
        message: error.message 
        };
        return errorObj
    } else {
        console.warn("Caught an unknown error type:", error);
        return error
    }

    }
}