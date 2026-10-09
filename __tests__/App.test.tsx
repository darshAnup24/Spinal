/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/native/UnreadProblem', () => ({
  __esModule: true,
  default: {
    isNotificationAccessEnabled: jest.fn(async () => false),
    isLlmModelInstalled: jest.fn(async () => false),
    getRecentMessages: jest.fn(async () => []),
    getOpenActions: jest.fn(async () => []),
    openNotificationSettings: jest.fn(),
    openExactAlarmSettings: jest.fn(),
    setActionStatus: jest.fn(async () => true),
    acknowledgeMessage: jest.fn(async () => true),
    deleteAllMessages: jest.fn(async () => true),
    getConversationSummary: jest.fn(async () => ''),
    getTodaySummary: jest.fn(async () => ''),
    askHistory: jest.fn(async () => ''),
    startVoiceInput: jest.fn(async () => ''),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
