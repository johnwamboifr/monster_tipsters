/** @format */

import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./slices/usersSlice";
import tipsReducer from "./slices/tipsSlice";
import jackpotsReducer from "./slices/jackpotSlice";
import codesReducer from "./slices/codeSlice";
import authReducer from "./slices/authSlice";
import imagesReducer from "./slices/imagesSlice";
import paymentsReducer from "./slices/paymentSlice";
import statisticsReducer from "./slices/statisticsSlice";
import footballReducer from "../features/slices/footballSlice";

 const store = configureStore({
	reducer: {
		users: usersReducer,
		tips: tipsReducer,
		jackpots: jackpotsReducer,
		codes: codesReducer,
		auth: authReducer,
		images: imagesReducer,
		payments: paymentsReducer,
		statistics: statisticsReducer,
		football: footballReducer,// football.api
	},
});
 export default store
