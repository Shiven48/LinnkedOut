import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState, videoMetaData } from "../../../types";

const initialAppState:AppState = {
    embeddings: {},
    watchHistory: []
}

const embeddingSlice = createSlice({
    name:'embeddingSlice',
    initialState:initialAppState,
    reducers:{
        addToWatchHistory: (state:AppState, action:PayloadAction<videoMetaData>) => {
            state.watchHistory.unshift(action.payload);
            state.watchHistory = state.watchHistory.slice(0,50);
            localStorage.setItem('watchHistory',JSON.stringify(state.watchHistory))
        },
        setEmbeddings: (state:AppState, action:PayloadAction<Record<string,number[]>>) => {
            state.embeddings = action.payload;
        }
    }
})

export const { addToWatchHistory, setEmbeddings} = embeddingSlice.actions
export default embeddingSlice.reducer;