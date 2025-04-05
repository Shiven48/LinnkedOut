import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ErrorObj } from "../../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function HandleError(error:any){
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