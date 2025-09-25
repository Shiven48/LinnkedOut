import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ErrorObj } from '@/services/common/types';
import { CATEGORY_MAPPING } from "./constants";

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

    public getCategoryFromId(id: string): string {
      return CATEGORY_MAPPING[id] || "General"
    } 

    public getQualityTermsForCategory(categoryId: string): string[] {
    const qualityTermsByCategory: Record<string, string[]> = {
      '10': ['live session', 'acoustic version', 'studio recording', 'original mix', 'unreleased'],
      '28': ['implementation', 'architecture', 'deep dive', 'production', 'case study'],
      '27': ['comprehensive', 'in-depth', 'professional', 'expert analysis', 'detailed'],
      '25': ['analysis', 'investigation', 'documentary', 'in-depth report', 'expert interview'],
      '17': ['technique', 'training method', 'professional', 'coaching', 'skill development'],
      '26': ['step-by-step', 'detailed process', 'professional technique', 'expert method'],
      '19': ['authentic', 'local experience', 'cultural insight', 'hidden gems', 'off beaten path']
    };
    
    return qualityTermsByCategory[categoryId] || ['detailed', 'professional', 'expert'];
  }
}