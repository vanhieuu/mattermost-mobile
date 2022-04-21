// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {act, renderHook} from '@testing-library/react-hooks';

import {
    setCalls,
    userJoinedCall,
    useCallsState,
    userLeftCall,
    callStarted,
    callFinished,
    setUserMuted,
    setCallScreenOn,
    setCallScreenOff,
    setRaisedHand,
    myselfJoinedCall,
    myselfLeftCall,
    setChannelEnabled,
    setScreenShareURL,
    setSpeakerPhoneOn,
    setConfig,
} from '../state';
import {DefaultCallsState} from '../types/calls';

import {setState} from './hooks';

const call1 = {
    participants: {
        'user-1': {id: 'user-1', muted: false, raisedHand: 0, isTalking: false, profile: {id: 'user-1'}},
        'user-2': {id: 'user-2', muted: true, raisedHand: 0, isTalking: true, profile: {id: 'user-2'}},
    },
    channelId: 'channel-1',
    startTime: 123,
    speakers: ['user-2'],
    screenOn: '',
    threadId: 'thread-1',
};
const call2 = {
    participants: {
        'user-3': {id: 'user-3', muted: false, raisedHand: 0, isTalking: false, profile: {id: 'user-3'}},
        'user-4': {id: 'user-4', muted: true, raisedHand: 0, isTalking: true, profile: {id: 'user-4'}},
    },
    channelId: 'channel-2',
    startTime: 123,
    speakers: ['user-4'],
    screenOn: '',
    threadId: 'thread-2',
};
const call3 = {
    participants: {
        'user-5': {id: 'user-5', muted: false, raisedHand: 0, isTalking: false, profile: {id: 'user-5'}},
        'user-6': {id: 'user-6', muted: true, raisedHand: 0, isTalking: true, profile: {id: 'user-6'}},
    },
    channelId: 'channel-3',
    startTime: 123,
    speakers: ['user-6'],
    screenOn: '',
    threadId: 'thread-3',
};

describe('useCallsState', () => {
    beforeAll(() => {
        // create subject
        const {result} = renderHook(() => useCallsState());

        // check that we start with default state
        assert.deepEqual(result.current, DefaultCallsState);
    });

    beforeEach(() => {
        // reset to default state for each test
        act(() => {
            setState(DefaultCallsState);
        });
    });

    it('default state', () => {
        const {result} = renderHook(() => useCallsState());
        assert.deepEqual(result.current, DefaultCallsState);
    });

    it('setCalls, two hooks', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1},
            enabled: {'channel-1': true},
            joined: 'channel-1',
        };
        const test = {
            calls: {'channel-1': call2, 'channel-2': call3},
            enabled: {'channel-2': true},
        };
        const expected = {
            ...initialState,
            calls: {'channel-1': call2, 'channel-2': call3},
            enabled: {'channel-2': true},
        };

        // setup
        const {result} = renderHook(() => {
            return [useCallsState(), useCallsState()];
        });
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current[0], initialState);
        assert.deepEqual(result.current[1], initialState);

        // test
        act(() => {
            setCalls(test.calls, test.enabled);
        });
        assert.deepEqual(result.current[0], expected);
        assert.deepEqual(result.current[1], expected);
    });

    it('joinedCall', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1},
        };
        const expectedCalls = {
            'channel-1': {
                participants: {
                    'user-1': {id: 'user-1', muted: false, raisedHand: 0, isTalking: false, profile: {id: 'user-1'}},
                    'user-2': {id: 'user-2', muted: true, raisedHand: 0, isTalking: true, profile: {id: 'user-2'}},
                    'user-3': {id: 'user-3', muted: true, raisedHand: 0, isTalking: false, profile: {id: 'user-3'}},
                },
                channelId: 'channel-1',
                startTime: 123,
                speakers: ['user-2'],
                screenOn: false,
                threadId: 'thread-1',
            },
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test
        act(() => {
            userJoinedCall('channel-1', 'user-3', {id: 'user-3'});
        });
        assert.deepEqual(result.current.calls, expectedCalls);
        act(() => {
            userJoinedCall('invalid-channel', 'user-1', {id: 'user-1'});
        });
        assert.deepEqual(result.current.calls, expectedCalls);
    });

    it('leftCall', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1},
        };
        const expectedCalls = {
            'channel-1': {
                participants: {
                    'user-2': {id: 'user-2', muted: true, raisedHand: 0, isTalking: true, profile: {id: 'user-2'}},
                },
                channelId: 'channel-1',
                startTime: 123,
                speakers: ['user-2'],
                screenOn: false,
                threadId: 'thread-1',
            },
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test
        act(() => {
            userLeftCall('channel-1', 'user-1');
        });
        assert.deepEqual(result.current.calls, expectedCalls);
        act(() => {
            userLeftCall('invalid-channel', 'user-2');
        });
        assert.deepEqual(result.current.calls, expectedCalls);
    });

    it('callStarted', () => {
        // setup
        const {result} = renderHook(() => useCallsState());
        assert.deepEqual(result.current, DefaultCallsState);

        // test
        act(() => {
            callStarted(call1);
        });
        assert.deepEqual(result.current.calls, {'channel-1': call1});
    });

    it('callFinished', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1, 'channel-2': call2},
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test
        act(() => {
            callFinished(call1);
        });
        assert.deepEqual(result.current.calls, {'channel-2': call2});
    });

    it('setUserMuted', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1, 'channel-2': call2},
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);
        assert.deepEqual(result.current.calls['channel-1'].participants['user-1'].muted, false);

        // test
        act(() => {
            setUserMuted('channel-1', 'user-1', true);
        });
        assert.deepEqual(result.current.calls['channel-1'].participants['user-1'].muted, true);
        act(() => {
            setUserMuted('channel-1', 'user-1', false);
            setUserMuted('channel-1', 'user-2', false);
        });
        assert.deepEqual(result.current.calls['channel-1'].participants['user-1'].muted, false);
        assert.deepEqual(result.current.calls['channel-1'].participants['user-2'].muted, false);
        act(() => {
            setUserMuted('channel-1', 'user-2', true);
        });
        assert.deepEqual(result.current.calls['channel-1'].participants['user-2'].muted, true);
        assert.deepEqual(result.current, initialState);
        act(() => {
            setUserMuted('invalid-channel', 'user-1', true);
        });
        assert.deepEqual(result.current, initialState);
    });

    it('setCallScreenOn/Off', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1, 'channel-2': call2},
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test
        act(() => {
            setCallScreenOn('channel-1', 'user-1');
        });
        assert.deepEqual(result.current.calls['channel-1'].screenOn, 'user-1');
        act(() => {
            setCallScreenOff('channel-1');
        });
        assert.deepEqual(result.current, initialState);
        act(() => {
            setCallScreenOn('channel-1', 'invalid-user');
        });
        assert.deepEqual(result.current, initialState);
        act(() => {
            setCallScreenOff('invalid-channel');
        });
        assert.deepEqual(result.current, initialState);
    });

    it('setRaisedHand', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1},
        };
        const expectedCalls = {
            'channel-1': {
                participants: {
                    'user-1': {id: 'user-1', muted: false, raisedHand: 0, isTalking: false, profile: {id: 'user-1'}},
                    'user-2': {id: 'user-2', muted: true, raisedHand: 345, isTalking: true, profile: {id: 'user-2'}},
                },
                channelId: 'channel-1',
                startTime: 123,
                speakers: ['user-2'],
                screenOn: false,
                threadId: 'thread-1',
            },
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test
        act(() => {
            setRaisedHand('channel-1', 'user-2', 345);
        });
        assert.deepEqual(result.current.calls, expectedCalls);
        act(() => {
            setRaisedHand('invalid-channel', 'user-1', 345);
        });
        assert.deepEqual(result.current.calls, expectedCalls);

        // unraise hand:
        act(() => {
            setRaisedHand('channel-1', 'user-2', 0);
        });
        assert.deepEqual(result.current, initialState);
    });

    it('myselfJoinedCall / LeftCall', () => {
        const initialState = {
            ...DefaultCallsState,
            calls: {'channel-1': call1, 'channel-2': call2},
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);
        assert.deepEqual(result.current.joined, '');

        // test
        act(() => {
            myselfJoinedCall('channel-id');
        });
        assert.deepEqual(result.current.joined, 'channel-id');
        act(() => {
            myselfLeftCall();
        });
        assert.deepEqual(result.current, initialState);
        assert.deepEqual(result.current.joined, '');
    });

    it('setChannelEnabled', () => {
        const initialState = {
            ...DefaultCallsState,
            enabled: {'channel-1': true, 'channel-2': false},
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test setCalls affecting enabled:
        act(() => {
            setCalls({calls: {'channel-1': {}, 'channel-2': {}}}, {'channel-1': true});
        });
        assert.deepEqual(result.current.enabled, {'channel-1': true});

        // re-setup:
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test setChannelEnabled affecting enabled:
        act(() => {
            setChannelEnabled('channel-3', true);
        });
        assert.deepEqual(result.current.enabled, {'channel-1': true, 'channel-2': false, 'channel-3': true});
        act(() => {
            setChannelEnabled('channel-3', false);
        });
        assert.deepEqual(result.current.enabled, {
            'channel-1': true,
            'channel-2': false,
            'channel-3': false,
        });
        act(() => {
            setChannelEnabled('channel-1', true);
        });
        assert.deepEqual(result.current.enabled, {
            'channel-1': true,
            'channel-2': false,
            'channel-3': false,
        });
        act(() => {
            setChannelEnabled('channel-1', false);
        });
        assert.deepEqual(result.current.enabled, {
            'channel-1': false,
            'channel-2': false,
            'channel-3': false,
        });
    });

    it('setScreenShareURL', () => {
        const initialState = {
            ...DefaultCallsState,
            screenShareURL: 'test',
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        act(() => {
            setState(initialState);
        });
        assert.deepEqual(result.current, initialState);

        // test joining a call:
        act(() => {
            myselfJoinedCall('channel-1');
        });
        assert.deepEqual(result.current.screenShareURL, '');
        act(() => {
            myselfLeftCall();
            setScreenShareURL('test');
        });
        assert.deepEqual(result.current, initialState);

        // test leaving a call:
        act(() => {
            myselfLeftCall();
        });
        assert.deepEqual(result.current.screenShareURL, '');
        act(() => {
            myselfLeftCall();
            setScreenShareURL('test');
        });
        assert.deepEqual(result.current, initialState);

        // test settingURL:
        act(() => {
            setScreenShareURL('new-url');
        });
        assert.deepEqual(result.current.screenShareURL, 'new-url');
    });

    it('setSpeakerPhoneOn', () => {
        // setup
        const {result} = renderHook(() => useCallsState());
        assert.deepEqual(result.current, DefaultCallsState);

        // test
        act(() => {
            setSpeakerPhoneOn(true);
        });
        assert.deepEqual(result.current.speakerphoneOn, true);
        act(() => {
            setSpeakerPhoneOn(false);
        });
        assert.deepEqual(result.current.speakerphoneOn, false);
        assert.deepEqual(result.current, DefaultCallsState);
    });

    it('setConfig', () => {
        const newConfig = {
            ICEServers: ['google.com'],
            AllowEnableCalls: true,
            DefaultEnabled: true,
            last_retrieved_at: 123,
        };

        // setup
        const {result} = renderHook(() => useCallsState());
        assert.deepEqual(result.current, DefaultCallsState);

        // test
        act(() => {
            setConfig(newConfig);
        });
        assert.deepEqual(result.current.config, newConfig);
    });
});
