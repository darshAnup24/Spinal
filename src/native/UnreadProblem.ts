import {NativeModules} from 'react-native';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type CapturedMessage = {id:string; conversation:string; conversationKey:string; messageText:string; timestamp:number; priority:Priority; score:number; reason:string; acknowledged:boolean};
export type ActionCategory = 'academics'|'placements'|'events'|'family';
export type ActionItem = {id:string; title:string; dueAt:number|null; priority:Priority; reason:string; status:string; category:ActionCategory|null};
export type ModelStatus = {mode:'HYBRID'|'RULES_ONLY'; installed:boolean; sizeBytes:number; runtime:string; expectedPath:string};
type NativeApi = {
  openNotificationSettings():void; openExactAlarmSettings():void; isNotificationAccessEnabled():Promise<boolean>; isLlmModelInstalled():Promise<boolean>; getModelStatus():Promise<ModelStatus>;
  getRecentMessages(limit:number):Promise<CapturedMessage[]>; getOpenActions(limit:number):Promise<ActionItem[]>; getConversationSummary(key:string):Promise<string>;
  getTodaySummary():Promise<string>; askHistory(question:string):Promise<string>; startVoiceInput():Promise<string>;
  setActionStatus(id:string,status:string):Promise<boolean>; acknowledgeMessage(id:string):Promise<boolean>; deleteAllMessages():Promise<boolean>;
};
const api = NativeModules.UnreadProblem as NativeApi | undefined;
if (!api) throw new Error('UnreadProblem native module missing. Rebuild the Android app and register UnreadProblemPackage.');
export default api as NativeApi;
