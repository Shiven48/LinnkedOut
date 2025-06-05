import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ErrorObj } from '@/services/common/types';
import { MEDIA_PER_PAGE } from "./constants";

export class utility {
    
    public static async apicaller(url:string, options?:any){
        try{
            if(!url || typeof url !== 'string' || url === undefined){
                throw new Error(`Error in apiCaller, Cant fetch url :${url}`)
            }
            return await fetch(url,options)
        } catch(error){
            throw error;
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