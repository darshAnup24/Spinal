import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions, KeyboardAvoidingView, Modal,
  NativeEventEmitter, Platform, Pressable, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Native, {ActionCategory, ActionItem, CapturedMessage} from '../native/UnreadProblem';
import {color, font, priorityMeta, space} from '../theme';
import {Background, FadeIn, Panel, SectionLabel, StatusDot} from '../components/primitives';

type Screen = 'home' | 'todos' | ActionCategory | 'settings';
type ChatEntry = {id: string; role: 'user' | 'assistant'; text: string};

const NAV_ITEMS: {key: Screen; label: string; glyph: string}[] = [
  {key: 'home', label: 'HOME', glyph: '⌂'},
  {key: 'todos', label: 'TODOS', glyph: '✓'},
  {key: 'academics', label: 'ACADEMICS', glyph: 'A'},
  {key: 'placements', label: 'PLACEMENTS', glyph: 'P'},
  {key: 'events', label: 'EVENTS', glyph: 'E'},
  {key: 'family', label: 'FAMILY', glyph: 'F'},
  {key: 'settings', label: 'SETTINGS', glyph: '⚙'},
];

const CATEGORY_TITLES: Record<ActionCategory, string> = {
  academics: 'ACADEMICS', placements: 'PLACEMENTS', events: 'EVENTS', family: 'FAMILY',
};

export function DashboardScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [navOpen, setNavOpen] = useState(false);
  const [messages, setMessages] = useState<CapturedMessage[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [access, setAccess] = useState(false);
  const [model, setModel] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [hasAccess, hasModel, storedMessages, storedActions, todaySummary] = await Promise.all([
        Native.isNotificationAccessEnabled(), Native.isLlmModelInstalled(),
        Native.getRecentMessages(250), Native.getOpenActions(200), Native.getTodaySummary(),
      ]);
      setAccess(hasAccess); setModel(hasModel); setMessages(storedMessages);
      setActions(storedActions); setSummary(todaySummary);
    } catch (error) {
      Alert.alert('Could not load on-device data', String(error));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const emitter = new NativeEventEmitter(Native as never);
    const subscription = emitter.addListener('UnreadProblemMessagesChanged', refresh);
    return () => subscription.remove();
  }, [refresh]);

  const completeAction = useCallback(async (id: string) => {
    try { await Native.setActionStatus(id, 'DONE'); await refresh(); }
    catch (error) { Alert.alert('Could not update todo', String(error)); }
  }, [refresh]);

  const content = useMemo(() => {
    if (screen === 'home') return <HomeScreen summary={summary} hasModel={model} />;
    if (screen === 'settings') return <SettingsScreen access={access} model={model} messageCount={messages.length} actionCount={actions.length} onRefresh={refresh} />;
    const category = screen === 'todos' ? undefined : screen;
    return <TodosScreen actions={category ? actions.filter(item => item.category === category) : actions} category={category} onComplete={completeAction} />;
  }, [access, actions, completeAction, messages.length, model, refresh, screen, summary]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" /><Background />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {loading ? <View style={styles.loader}><ActivityIndicator color={color.ditherHex} /><Text style={styles.loaderText}>READING ON-DEVICE DATA…</Text></View> : content}
      </SafeAreaView>
      <Pressable onPress={() => setNavOpen(true)} style={({pressed}) => [styles.navTrigger, pressed && styles.pressed]}>
        <Text style={styles.navTriggerIcon}>＋</Text><Text style={styles.navTriggerText}>{NAV_ITEMS.find(item => item.key === screen)?.label}</Text>
        {actions.length > 0 && <View style={styles.navDot} />}
      </Pressable>
      <CircularNavigation visible={navOpen} current={screen} onClose={() => setNavOpen(false)} onSelect={next => {setScreen(next); setNavOpen(false);}} />
    </View>
  );
}

function HomeScreen({summary, hasModel}: {summary: string; hasModel: boolean}) {
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef<{scrollToEnd: (options?: {animated?: boolean}) => void} | null>(null);
  const ask = useCallback(async (question: string) => {
    const clean = question.trim(); if (!clean || asking) return;
    setChat(current => [...current, {id: `${Date.now()}-u`, role: 'user', text: clean}]); setAsking(true);
    try {
      const answer = await Native.askHistory(clean);
      setChat(current => [...current, {id: `${Date.now()}-a`, role: 'assistant', text: answer || (hasModel ? 'No matching information was found in your history.' : 'Install the local model in Settings to chat with your history.')}]);
    } catch (error) { setChat(current => [...current, {id: `${Date.now()}-e`, role: 'assistant', text: String(error)}]); }
    finally { setAsking(false); requestAnimationFrame(() => scrollRef.current?.scrollToEnd({animated: true})); }
  }, [asking, hasModel]);

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={node => {scrollRef.current = node;}} contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
      <FadeIn><Text style={styles.kicker}>PRIVATE · ON-DEVICE</Text><Text style={styles.pageTitle}>TODAY</Text>
        <Panel style={styles.summaryCard} tone={color.strong}><View style={styles.summaryHeading}><StatusDot tone={color.strong} /><SectionLabel>AI SUMMARY OF TODAY</SectionLabel></View>
          <Text style={summary ? styles.summaryText : styles.emptyText}>{summary || 'No notifications captured in the last 24 hours.'}</Text>
        </Panel>
      </FadeIn>
      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>ASK YOUR HISTORY</Text><View style={styles.divider} /></View>
      {chat.map(entry => <View key={entry.id} style={[styles.chatBubble, entry.role === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.chatRole, {color: entry.role === 'user' ? color.pivot : color.strong}]}>{entry.role === 'user' ? 'YOU' : 'ASSISTANT'}</Text><Text style={styles.chatText}>{entry.text}</Text>
      </View>)}
      {asking && <View style={[styles.chatBubble, styles.aiBubble, styles.thinkingRow]}><ActivityIndicator size="small" color={color.strong} /><Text style={styles.emptyText}>SEARCHING LOCAL HISTORY…</Text></View>}
      <RecorderComposer onSend={ask} busy={asking} />
    </ScrollView>
  </KeyboardAvoidingView>;
}

function RecorderComposer({onSend, busy}: {onSend: (value: string) => void; busy: boolean}) {
  const [text, setText] = useState(''); const [expanded, setExpanded] = useState(false); const [listening, setListening] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => { const animation = Animated.loop(Animated.sequence([
    Animated.timing(pulse, {toValue: 1, duration: listening ? 550 : 1600, useNativeDriver: true}), Animated.timing(pulse, {toValue: 0, duration: listening ? 550 : 1600, useNativeDriver: true}),
  ])); animation.start(); return () => animation.stop(); }, [listening, pulse]);
  const voice = async () => { setListening(true); try { const result = await Native.startVoiceInput(); if (result) {setText(result); setExpanded(true);} } catch (error) {Alert.alert('Voice input unavailable', String(error)); setExpanded(true);} finally {setListening(false);} };
  const submit = () => {if (!text.trim() || busy) return; onSend(text); setText(''); setExpanded(false)};
  const auraScales = [1.7, 1.35, 1];
  return <View style={styles.recorder}><View style={styles.auraBox}>
    {auraScales.map((scale, index) => <Animated.View key={scale} style={[styles.auraRing, {opacity: pulse.interpolate({inputRange: [0, 1], outputRange: [0.08 + index * 0.05, 0.28 + index * 0.08]}), transform: [{scale: pulse.interpolate({inputRange: [0, 1], outputRange: [scale * 0.94, scale * 1.06]})}]}]} />)}
    <Pressable onPress={voice} disabled={busy || listening} style={({pressed}) => [styles.micButton, pressed && styles.pressed]}><Text style={styles.micGlyph}>{listening ? '■' : '●'}</Text></Pressable>
  </View><Text style={[styles.recorderLabel, listening && {color: color.ditherHex}]}>{listening ? 'LISTENING…' : 'TAP TO ASK YOUR HISTORY'}</Text>
    {expanded ? <Panel style={styles.composer} ticks={false}><Text style={styles.composerLabel}>QUESTION · EDITABLE</Text>
      <TextInput value={text} onChangeText={setText} placeholder="Ask about a sender, deadline, topic, or date…" placeholderTextColor={color.textDim} multiline autoFocus style={styles.input} />
      <View style={styles.composerActions}><Pressable onPress={() => setExpanded(false)} hitSlop={8}><Text style={styles.cancelText}>CLOSE</Text></Pressable><Pressable onPress={submit} disabled={!text.trim() || busy} style={({pressed}) => [styles.sendButton, (!text.trim() || busy) && styles.disabled, pressed && styles.pressed]}><Text style={styles.sendText}>↑</Text></Pressable></View>
    </Panel> : <Pressable onPress={() => setExpanded(true)} style={({pressed}) => [styles.typeButton, pressed && styles.pressed]}><Text style={styles.typeButtonText}>⌨  TYPE INSTEAD</Text></Pressable>}
  </View>;
}

function TodosScreen({actions, category, onComplete}: {actions: ActionItem[]; category?: ActionCategory; onComplete: (id: string) => void}) {
  return <ScrollView contentContainerStyle={styles.pageContent}><FadeIn><Text style={styles.kicker}>{category ? 'FILTERED TODOS' : 'ALL CATEGORIES'}</Text><Text style={styles.pageTitle}>{category ? CATEGORY_TITLES[category] : 'TODOS'}</Text><Text style={styles.pageMeta}>{actions.length} OPEN · STORED ON THIS DEVICE</Text></FadeIn>
    <View style={styles.todoList}>{actions.map(item => <Panel key={item.id} style={styles.todoCard} tone={priorityMeta[item.priority].tone}>
      <View style={styles.todoTop}><Pressable onPress={() => onComplete(item.id)} style={styles.checkButton}><Text style={styles.checkText}>✓</Text></Pressable><View style={styles.todoBody}><Text style={styles.todoTitle}>{item.title}</Text><Text style={styles.todoReason}>{item.reason}</Text></View><Text style={[styles.priority, {color: priorityMeta[item.priority].tone}]}>{item.priority}</Text></View>
      <View style={styles.todoMetaRow}><Text style={styles.todoMeta}>{item.dueAt ? new Date(item.dueAt).toLocaleString() : 'NO DEADLINE'}</Text>{!!item.category && <Text style={styles.todoMeta}>{item.category.toUpperCase()}</Text>}</View>
    </Panel>)}{actions.length === 0 && <View style={styles.emptyBlock}><Text style={styles.emptyMark}>✓</Text><Text style={styles.emptyTitle}>ALL CLEAR</Text><Text style={styles.emptyText}>No open todos in this view.</Text></View>}</View>
  </ScrollView>;
}

function SettingsScreen({access, model, messageCount, actionCount, onRefresh}: {access: boolean; model: boolean; messageCount: number; actionCount: number; onRefresh: () => void}) {
  const [installing, setInstalling] = useState(false);
  const installModel = async () => {
    if (installing) return;
    setInstalling(true);
    try {
      const installed = await Native.downloadLlmModel();
      if (installed) await Native.restartApp();
    } catch (error) {
      Alert.alert('Could not install local model', String(error));
      setInstalling(false);
    }
  };
  return <ScrollView contentContainerStyle={styles.pageContent}><FadeIn><Text style={styles.kicker}>PRIVACY · DEVICE</Text><Text style={styles.pageTitle}>SETTINGS</Text></FadeIn>
    <Panel style={styles.settingCard}><View style={styles.settingRow}><Text style={styles.settingLabel}>NOTIFICATION ACCESS</Text><Text style={[styles.settingValue, {color: access ? color.strong : color.pivot}]}>{access ? 'GRANTED' : 'OFF'}</Text></View>{!access && <Pressable onPress={() => Native.openNotificationSettings()}><Text style={styles.settingAction}>OPEN ANDROID SETTINGS →</Text></Pressable>}</Panel>
    <Panel style={styles.settingCard}><View style={styles.settingRow}><Text style={styles.settingLabel}>LOCAL AI MODEL</Text><Text style={[styles.settingValue, {color: model ? color.strong : color.pivot}]}>{model ? 'READY' : 'NOT INSTALLED'}</Text></View><Text style={styles.settingDescription}>Download the compatible 284 MB LiteRT-LM model over HTTPS. It is stored privately on this device and never uploaded.</Text>{!model && <Pressable onPress={installModel} disabled={installing}><Text style={[styles.settingAction, installing && styles.disabled]}>{installing ? 'DOWNLOADING · RESTARTING…' : 'DOWNLOAD LOCAL MODEL →'}</Text></Pressable>}</Panel>
    <View style={styles.metricRow}><Metric value={messageCount} label="CAPTURED" /><Metric value={actionCount} label="OPEN TODOS" /></View><Pressable onPress={onRefresh} style={({pressed}) => [styles.refreshButton, pressed && styles.pressed]}><Text style={styles.refreshText}>REFRESH STATUS ↻</Text></Pressable>
  </ScrollView>;
}
function Metric({value, label}: {value: number; label: string}) {return <Panel style={styles.metric} ticks={false}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Panel>;}

function CircularNavigation({visible, current, onClose, onSelect}: {visible: boolean; current: Screen; onClose: () => void; onSelect: (screen: Screen) => void}) {
  const width = Dimensions.get('window').width; const size = Math.min(width - 24, 380); const center = size / 2; const ringRadius = size * 0.34; const itemSize = Math.max(56, size * 0.18);
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent><Pressable style={styles.navOverlay} onPress={onClose}><Pressable style={[styles.navWheel, {width: size, height: size, borderRadius: size / 2}]} onPress={() => {}}>
    <View style={[styles.navInnerRing, {width: size * 0.72, height: size * 0.72, borderRadius: size, left: size * 0.14, top: size * 0.14}]} />
    {NAV_ITEMS.map((item, index) => {const angle = Math.PI * 2 * index / NAV_ITEMS.length - Math.PI / 2; const left = center + Math.cos(angle) * ringRadius - itemSize / 2; const top = center + Math.sin(angle) * ringRadius - itemSize / 2; const active = current === item.key; return <Pressable key={item.key} onPress={() => onSelect(item.key)} style={({pressed}) => [styles.navItem, {width: itemSize, height: itemSize, borderRadius: itemSize / 2, left, top}, active && styles.navItemActive, pressed && styles.pressed]}><Text style={[styles.navGlyph, active && styles.navGlyphActive]}>{item.glyph}</Text><Text adjustsFontSizeToFit numberOfLines={1} style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text></Pressable>;})}
    <Pressable onPress={onClose} style={[styles.navClose, {left: center - 29, top: center - 29}]}><Text style={styles.navCloseText}>×</Text></Pressable>
  </Pressable></Pressable></Modal>;
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:color.void},safe:{flex:1},flex:{flex:1},pageContent:{paddingHorizontal:space.lg,paddingTop:space.lg,paddingBottom:120},loader:{flex:1,alignItems:'center',justifyContent:'center'},loaderText:{marginTop:space.md,color:color.textMute,fontFamily:font.pixel.medium,fontSize:10,letterSpacing:2},
  kicker:{color:color.ditherHex,fontFamily:font.pixel.semiBold,fontSize:10,letterSpacing:3},pageTitle:{marginTop:6,color:color.text,fontFamily:font.pixel.semiBold,fontSize:32,letterSpacing:3},pageMeta:{marginTop:space.sm,color:color.textMute,fontFamily:font.mono.regular,fontSize:10,letterSpacing:1},summaryCard:{marginTop:space.lg,padding:space.lg,backgroundColor:color.surface60},summaryHeading:{flexDirection:'row',alignItems:'center',gap:space.sm,marginBottom:space.md},summaryText:{color:color.text,fontFamily:font.mono.regular,fontSize:13,lineHeight:22},emptyText:{color:color.textMute,fontFamily:font.mono.regular,fontSize:12,lineHeight:19},
  dividerRow:{marginVertical:space.xxl,flexDirection:'row',alignItems:'center',gap:space.md},divider:{height:1,flex:1,backgroundColor:color.edge},dividerText:{color:color.textDim,fontFamily:font.pixel.medium,fontSize:9,letterSpacing:2},chatBubble:{borderWidth:1,borderColor:color.edge,backgroundColor:color.surface60,padding:space.md,marginBottom:space.sm},userBubble:{borderLeftWidth:2,borderLeftColor:color.pivot},aiBubble:{borderLeftWidth:2,borderLeftColor:color.strong},chatRole:{fontFamily:font.pixel.semiBold,fontSize:9,letterSpacing:2,marginBottom:space.sm},chatText:{color:color.text,fontFamily:font.mono.regular,fontSize:13,lineHeight:21},thinkingRow:{flexDirection:'row',alignItems:'center',gap:space.sm},
  recorder:{alignItems:'center',marginTop:space.sm},auraBox:{width:230,height:230,alignItems:'center',justifyContent:'center'},auraRing:{position:'absolute',width:108,height:108,borderRadius:54,borderWidth:1,borderColor:color.ditherHex,backgroundColor:'rgba(255,102,204,0.025)'},micButton:{width:78,height:78,borderRadius:39,alignItems:'center',justifyContent:'center',backgroundColor:color.deep80,borderWidth:1,borderColor:color.edgeGlow,elevation:10},micGlyph:{color:color.text,fontSize:22},recorderLabel:{marginTop:-8,color:color.textMute,fontFamily:font.pixel.medium,fontSize:9,letterSpacing:2},composer:{width:'100%',marginTop:space.xl,backgroundColor:color.surface60},composerLabel:{color:color.textMute,fontFamily:font.pixel.medium,fontSize:9,letterSpacing:2},input:{minHeight:76,paddingHorizontal:0,paddingTop:space.md,color:color.text,fontFamily:font.mono.regular,fontSize:13,lineHeight:20,textAlignVertical:'top'},composerActions:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:space.sm},cancelText:{color:color.textDim,fontFamily:font.pixel.medium,fontSize:9,letterSpacing:1.5},sendButton:{width:36,height:36,alignItems:'center',justifyContent:'center',backgroundColor:color.text},sendText:{color:color.void,fontFamily:font.mono.bold,fontSize:20},disabled:{opacity:.25},typeButton:{marginTop:space.lg,paddingHorizontal:space.lg,paddingVertical:space.sm,borderWidth:1,borderColor:color.edge,borderRadius:99},typeButtonText:{color:color.textMute,fontFamily:font.mono.regular,fontSize:10,letterSpacing:1},
  todoList:{marginTop:space.xl},todoCard:{marginBottom:space.sm,backgroundColor:color.deep80},todoTop:{flexDirection:'row',alignItems:'flex-start',gap:space.md},checkButton:{width:28,height:28,borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:color.edgeGlow},checkText:{color:color.textMute,fontFamily:font.mono.bold,fontSize:13},todoBody:{flex:1},todoTitle:{color:color.text,fontFamily:font.mono.medium,fontSize:13,lineHeight:19},todoReason:{marginTop:space.xs,color:color.textMute,fontFamily:font.mono.regular,fontSize:10,lineHeight:16},priority:{fontFamily:font.pixel.semiBold,fontSize:8,letterSpacing:1},todoMetaRow:{marginTop:space.md,flexDirection:'row',justifyContent:'space-between',gap:space.sm},todoMeta:{color:color.textDim,fontFamily:font.mono.regular,fontSize:9},emptyBlock:{alignItems:'center',paddingVertical:70,borderWidth:1,borderStyle:'dashed',borderColor:color.edgeGlow},emptyMark:{color:color.strong,fontFamily:font.mono.bold,fontSize:25},emptyTitle:{marginTop:space.md,color:color.textMute,fontFamily:font.pixel.semiBold,fontSize:12,letterSpacing:2},
  settingCard:{marginTop:space.md,backgroundColor:color.surface60},settingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:space.md},settingLabel:{color:color.textMute,fontFamily:font.pixel.medium,fontSize:10,letterSpacing:1.5},settingValue:{fontFamily:font.pixel.semiBold,fontSize:10,letterSpacing:1},settingAction:{marginTop:space.md,color:color.text,fontFamily:font.pixel.semiBold,fontSize:10,letterSpacing:1},settingDescription:{marginTop:space.md,color:color.textMute,fontFamily:font.mono.regular,fontSize:11,lineHeight:18},metricRow:{flexDirection:'row',gap:space.sm,marginTop:space.md},metric:{flex:1},metricValue:{color:color.text,fontFamily:font.mono.extraBold,fontSize:24},metricLabel:{marginTop:space.xs,color:color.textDim,fontFamily:font.pixel.medium,fontSize:9,letterSpacing:1.5},refreshButton:{marginTop:space.xl,alignSelf:'flex-start',borderBottomWidth:1,borderBottomColor:color.edgeGlow},refreshText:{color:color.text,fontFamily:font.pixel.semiBold,fontSize:10,letterSpacing:1.5},
  navTrigger:{position:'absolute',bottom:24,alignSelf:'center',flexDirection:'row',alignItems:'center',gap:space.sm,paddingHorizontal:space.lg,height:48,borderRadius:24,backgroundColor:'rgba(17,20,28,0.96)',borderWidth:1,borderColor:color.edgeGlow,elevation:18},navTriggerIcon:{color:color.text,fontFamily:font.mono.regular,fontSize:18},navTriggerText:{color:color.textMute,fontFamily:font.pixel.medium,fontSize:10,letterSpacing:2},navDot:{width:7,height:7,borderRadius:4,backgroundColor:color.ditherHex},navOverlay:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(4,5,10,0.96)'},navWheel:{borderWidth:1,borderColor:color.edge,backgroundColor:'rgba(17,20,28,0.25)'},navInnerRing:{position:'absolute',borderWidth:1,borderColor:color.edge},navItem:{position:'absolute',alignItems:'center',justifyContent:'center',padding:4,backgroundColor:'rgba(17,20,28,0.94)',borderWidth:1,borderColor:color.edgeGlow},navItemActive:{backgroundColor:color.text,borderColor:color.text},navGlyph:{color:color.text,fontFamily:font.mono.bold,fontSize:17},navGlyphActive:{color:color.void},navLabel:{width:'100%',marginTop:2,textAlign:'center',color:color.textMute,fontFamily:font.pixel.medium,fontSize:7,letterSpacing:.4},navLabelActive:{color:color.void},navClose:{position:'absolute',width:58,height:58,borderRadius:29,alignItems:'center',justifyContent:'center',backgroundColor:color.text},navCloseText:{color:color.void,fontFamily:font.mono.regular,fontSize:30,lineHeight:32},pressed:{opacity:.6},
});
export default DashboardScreen;
