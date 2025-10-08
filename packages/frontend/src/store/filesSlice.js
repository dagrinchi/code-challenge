import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import config from '../config';

export const fetchFileData = createAsyncThunk(
  'files/fetchFileData',
  async (fileName = '', { rejectWithValue }) => {
    try {
      const url = fileName 
        ? `${config.apiUrl}/files/data?fileName=${encodeURIComponent(fileName)}`
        : `${config.apiUrl}/files/data`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    filesList: [],
    filesData: [],
    selectedFileName: '',
    loading: false,
    error: null,
    dataLoading: false,
    dataError: null
  },
  reducers: {
    setSelectedFileName: (state, action) => {
      state.selectedFileName = action.payload
    },
    clearError: (state) => {
      state.error = null
      state.dataError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFileData.pending, (state) => {
        state.dataLoading = true
        state.dataError = null
      })
      .addCase(fetchFileData.fulfilled, (state, action) => {
        state.dataLoading = false
        state.filesData = action.payload
      })
      .addCase(fetchFileData.rejected, (state, action) => {
        state.dataLoading = false
        state.dataError = action.payload
      })
  }
})

export const { setSelectedFileName, clearError } = filesSlice.actions
export default filesSlice.reducer