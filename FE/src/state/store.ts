import { configureStore } from "@reduxjs/toolkit"
import EmbeddingReducer from "@/state/Slice/EmbeddingSlice"

export const store = configureStore({
    reducer:{
        appReducer: EmbeddingReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch; 

