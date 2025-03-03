// frontend/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// 空のスライスを作成（後で実装を追加できます）
const initialState = {};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {}
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer
  }
});

// Storeの型定義をエクスポート
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;