import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ActionItem, CapturedMessage, Priority } from '../native/UnreadProblem';
import { color, font, priorityTone, space } from '../theme';
import { Panel, StatusDot } from './primitives';

type Filter = 'ALL' | Priority;

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ------------------------------------------------------------------ */
/* Notice — inline alert card (access / model status)                  */
/* ------------------------------------------------------------------ */
export function NoticeCard({
  title,
  body,
  tone = color.edgeGlow,
  onPress,
  cta,
}: {
  title: string;
  body: string;
  tone?: string;
  onPress?: () => void;
  cta?: string;
}) {
  const inner = (
    <Panel style={styles.notice}>
      <Text style={[styles.noticeTitle, { color: tone }]}>{title}</Text>
      <Text style={styles.muted}>{body}</Text>
      {cta && !!onPress && <Text style={[styles.link, { marginTop: space.sm }]}>{cta}</Text>}
    </Panel>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

/* ------------------------------------------------------------------ */
/* StatTile — big numeral in its status voice                          */
/* ------------------------------------------------------------------ */
export function StatTile({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <Panel style={styles.stat} ticks={false}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* FilterPill                                                          */
/* ------------------------------------------------------------------ */
export function FilterPill({
  label,
  active,
  onPress,
}: {
  label: Filter;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && { borderColor: color.edgeGlow, backgroundColor: color.surface },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.pillText, active && { color: color.text }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* ActionCard — horizontal urgent deadline card                        */
/* ------------------------------------------------------------------ */
export function ActionCard({
  item,
  onDone,
  onDismiss,
}: {
  item: ActionItem;
  onDone: () => void;
  onDismiss: () => void;
}) {
  const tone = priorityTone(item.priority);
  return (
    <Panel style={styles.action} tone={tone}>
      <View style={styles.row}>
        <StatusDot tone={tone} />
        <Text style={[styles.badge, { color: tone }]}>URGENT</Text>
      </View>
      <Text style={styles.message} numberOfLines={3}>
        {item.title}
      </Text>
      <Text style={styles.muted}>{item.dueAt ? fmtTime(item.dueAt) : 'Deadline unclear'}</Text>
      <View style={[styles.row, { marginTop: space.sm, justifyContent: 'flex-start', gap: space.md }]}>
        <Pressable onPress={onDone} hitSlop={8}>
          <Text style={styles.link}>Mark done</Text>
        </Pressable>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={styles.muted}>Dismiss</Text>
        </Pressable>
      </View>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* MessageCard — captured notification, mirrors the web IdeaCard       */
/* ------------------------------------------------------------------ */
export function MessageCard({
  item,
  onAcknowledge,
  onSummarize,
}: {
  item: CapturedMessage;
  onAcknowledge: () => void;
  onSummarize: () => void;
}) {
  const tone = priorityTone(item.priority);
  return (
    <Panel style={styles.card} tone={tone}>
      <View style={styles.row}>
        <StatusDot tone={tone} />
        <Text style={styles.priority} numberOfLines={1}>
          {item.priority}
        </Text>
        <Text style={styles.conversation} numberOfLines={1}>
          {item.conversation}
        </Text>
      </View>
      <Text style={styles.message}>{item.messageText}</Text>
      <Text style={styles.reason} numberOfLines={2}>
        {item.reason}
      </Text>
      <View style={[styles.row, { marginTop: space.sm }]}>
        <Text style={styles.timestamp}>{fmtTime(item.timestamp)}</Text>
        <View style={[styles.row, { gap: space.md, flex: 0 }]}>
          <Pressable onPress={onSummarize} hitSlop={8}>
            <Text style={styles.link}>Summarize</Text>
          </Pressable>
          <Pressable onPress={onAcknowledge} hitSlop={8}>
            <Text style={styles.link}>{item.acknowledged ? 'Done' : 'Mark done'}</Text>
          </Pressable>
        </View>
      </View>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.empty}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  notice: {
    marginBottom: space.sm,
    backgroundColor: color.deep,
  },
  noticeTitle: {
    color: color.text,
    fontFamily: font.pixel.semiBold,
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: space.xs,
  },
  stat: {
    flex: 1,
    padding: space.md,
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: font.mono.extraBold,
    fontSize: 24,
  },
  statLabel: {
    color: color.textMute,
    fontFamily: font.pixel.medium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: space.xs,
  },
  pill: {
    borderWidth: 1,
    borderColor: color.edge,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: 999,
  },
  pillText: {
    color: color.textMute,
    fontFamily: font.pixel.medium,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  action: {
    width: 240,
    marginRight: space.sm,
    backgroundColor: color.deep,
  },
  card: {
    marginBottom: space.sm,
    backgroundColor: color.deep,
  },
  badge: {
    fontFamily: font.pixel.semiBold,
    fontSize: 10,
    letterSpacing: 2,
    marginLeft: 6,
  },
  priority: {
    color: color.text,
    fontFamily: font.pixel.semiBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  conversation: {
    color: color.textMute,
    fontFamily: font.mono.medium,
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  message: {
    color: color.text,
    fontFamily: font.mono.regular,
    fontSize: 14,
    lineHeight: 21,
    marginVertical: space.sm,
  },
  reason: {
    color: color.textMute,
    fontFamily: font.mono.regular,
    fontSize: 11,
    lineHeight: 17,
  },
  muted: {
    color: color.textMute,
    fontFamily: font.mono.regular,
    fontSize: 11,
    lineHeight: 17,
  },
  link: {
    color: color.text,
    fontFamily: font.pixel.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: color.edgeGlow,
  },
  timestamp: {
    color: color.textDim,
    fontFamily: font.mono.regular,
    fontSize: 10,
    flex: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: space.xxl * 2,
  },
  emptyArt: {
    color: color.textDim,
    fontFamily: font.pixel.regular,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: space.lg,
  },
  empty: {
    color: color.textMute,
    fontFamily: font.mono.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
  },
  pressed: { opacity: 0.6 },
});
