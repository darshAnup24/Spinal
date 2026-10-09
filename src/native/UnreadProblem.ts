import {NativeModules} from 'react-native';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type CapturedMessage = {id:string; conversation:string; conversationKey:string; messageText:string; timestamp:number; priority:Priority; score:number; reason:string; acknowledged:boolean};
export type ActionCategory = 'academics'|'placements'|'events'|'family';
export type ActionItem = {id:string; title:string; dueAt:number|null; priority:Priority; reason:string; status:string; category:ActionCategory|null};
export type ModelStatus = {mode:'HYBRID'|'RULES_ONLY'; installed:boolean; sizeBytes:number; runtime:string; expectedPath:string};
type NativeApi = {
  openNotificationSettings():void; openExactAlarmSettings():void; isNotificationAccessEnabled():Promise<boolean>; isLlmModelInstalled():Promise<boolean>; getModelStatus():Promise<ModelStatus>;
  downloadLlmModel():Promise<boolean>; restartApp():Promise<boolean>;
  getRecentMessages(limit:number):Promise<CapturedMessage[]>; getOpenActions(limit:number):Promise<ActionItem[]>; getConversationSummary(key:string):Promise<string>;
  getTodaySummary():Promise<string>; askHistory(question:string):Promise<string>; startVoiceInput():Promise<string>;
  setActionStatus(id:string,status:string):Promise<boolean>; acknowledgeMessage(id:string):Promise<boolean>; deleteAllMessages():Promise<boolean>;
};
const api = NativeModules.UnreadProblem as NativeApi | undefined;
if (!api) throw new Error('UnreadProblem native module missing. Rebuild the Android app and register UnreadProblemPackage.');
export default {
  openNotificationSettings: () => api.openNotificationSettings(),
  openExactAlarmSettings: () => api.openExactAlarmSettings(),
  isNotificationAccessEnabled: () => api.isNotificationAccessEnabled(),
  isLlmModelInstalled: () => api.isLlmModelInstalled(),
  getModelStatus: () => api.getModelStatus(),
  downloadLlmModel: () => api.downloadLlmModel(),
  restartApp: () => api.restartApp(),
  getRecentMessages: (limit: number) => api.getRecentMessages(limit),
  getOpenActions: (limit: number) => api.getOpenActions(limit),
  getConversationSummary: (key: string) => api.getConversationSummary(key),
  getTodaySummary: () => api.getTodaySummary(),
  askHistory: (question: string) => api.askHistory(question),
  startVoiceInput: () => api.startVoiceInput(),
  setActionStatus: (id: string, status: string) => api.setActionStatus(id, status),
  acknowledgeMessage: (id: string) => api.acknowledgeMessage(id),
  deleteAllMessages: () => api.deleteAllMessages(),
} as NativeApi;
