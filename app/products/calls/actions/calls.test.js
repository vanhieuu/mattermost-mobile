// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as CallsActions from '@calls/actions';
import {connection} from '@calls/actions/calls';
import * as Permissions from '@calls/actions/permissions';
import * as State from '@calls/state';
import {setState} from '@calls/state/hooks';
import {DefaultCallsState} from '@calls/types/calls';
import {act, renderHook} from '@testing-library/react-hooks';
import InCallManager from 'react-native-incall-manager';

import {Client} from '@client/rest';
import {getIntlShape} from '@test/intl-test-helper';

jest.mock('@client/rest', () => ({
    Client: {
        setUrl: jest.fn(),
        getCalls: jest.fn(() => [
            {
                call: {
                    users: ['user-1', 'user-2'],
                    states: {
                        'user-1': {unmuted: true},
                        'user-2': {unmuted: false},
                    },
                    start_at: 123,
                    screen_sharing_id: '',
                    thread_id: 'thread-1',
                },
                channel_id: 'channel-1',
                enabled: true,
            },
        ]),
        getCallsConfig: jest.fn(() => ({
            ICEServers: ['mattermost.com'],
            AllowEnableCalls: true,
            DefaultEnabled: true,
            last_retrieved_at: 1234,
        })),
        enableChannelCalls: jest.fn(),
        disableChannelCalls: jest.fn(),
    },
}));

jest.mock('@app/products/calls/connection/connection', () => ({
    newConnection: jest.fn(() => Promise.resolve({
        disconnect: jest.fn(),
        mute: jest.fn(),
        unmute: jest.fn(),
        waitForReady: jest.fn(() => Promise.resolve()),
    })),
}));

const addFakeCall = (channelId) => {
    const call = {
        participants: {
            xohi8cki9787fgiryne716u84o: {id: 'xohi8cki9787fgiryne716u84o', isTalking: true, muted: false},
            xohi8cki9787fgiryne716u841: {id: 'xohi8cki9787fgiryne716u84o', isTalking: true, muted: true},
            xohi8cki9787fgiryne716u842: {id: 'xohi8cki9787fgiryne716u84o', isTalking: false, uted: false},
            xohi8cki9787fgiryne716u843: {id: 'xohi8cki9787fgiryne716u84o', isTalking: false, muted: true},
            xohi8cki9787fgiryne716u844: {id: 'xohi8cki9787fgiryne716u84o', isTalking: true, muted: false},
            xohi8cki9787fgiryne716u845: {id: 'xohi8cki9787fgiryne716u84o', isTalking: true, muted: true},
        },
        channelId,
        startTime: (new Date()).getTime(),
    };
    act(() => {
        State.callStarted(call);
    });
};

describe('Actions.Calls', () => {
    const {newConnection} = require('@app/products/calls/connection/connection');
    InCallManager.setSpeakerphoneOn = jest.fn();
    const intl = getIntlShape();
    jest.spyOn(Permissions, 'hasMicrophonePermission').mockReturnValue(true);

    beforeEach(() => {
        newConnection.mockClear();
        Client.setUrl.mockClear();
        Client.getCalls.mockClear();
        Client.getCallsConfig.mockClear();
        Client.enableChannelCalls.mockClear();
        Client.disableChannelCalls.mockClear();
        act(() => {
            setState(DefaultCallsState);
        });
    });

    it('joinCall', async () => {
        const {result} = renderHook(() => State.useCallsState());
        addFakeCall('channel-id');
        let response;
        await act(async () => {
            response = await CallsActions.joinCall('', 'channel-id', intl);
        });
        assert.equal(response.data, 'channel-id');
        assert.equal(result.current.joined, 'channel-id');
        expect(newConnection).toBeCalled();
        expect(newConnection.mock.calls[0][0]).toBe('channel-id');
        CallsActions.leaveCall();
    });

    it('leaveCall', async () => {
        const {result} = renderHook(() => State.useCallsState());
        addFakeCall('channel-id');
        expect(connection).toBe(null);
        let response;
        await act(async () => {
            response = await CallsActions.joinCall('', 'channel-id', intl);
        });
        assert.equal(response.data, 'channel-id');
        assert.equal(result.current.joined, 'channel-id');
        expect(connection.disconnect).not.toBeCalled();
        const disconnectMock = connection.disconnect;
        CallsActions.leaveCall();
        expect(disconnectMock).toBeCalled();
        expect(connection).toBe(null);
        assert.equal(result.current.joined, '');
    });

    it('muteMyself', async () => {
        const {result} = renderHook(() => State.useCallsState());
        addFakeCall('channel-id');
        await act(async () => {
            await CallsActions.joinCall('', 'channel-id', intl);
        });
        assert.equal(result.current.joined, 'channel-id');
        CallsActions.muteMyself();
        expect(connection.mute).toBeCalled();
        CallsActions.leaveCall();
    });

    it('unmuteMyself', async () => {
        const {result} = renderHook(() => State.useCallsState());
        addFakeCall('channel-id');
        await act(async () => {
            await CallsActions.joinCall('', 'channel-id', intl);
        });
        assert.equal(result.current.joined, 'channel-id');
        CallsActions.unmuteMyself();
        expect(connection.unmute).toBeCalled();
        CallsActions.leaveCall();
    });

    it('loadCalls', async () => {
        const {result} = renderHook(() => State.useCallsState());
        await CallsActions.loadCalls();
        expect(Client.getCalls).toBeCalledWith();
        assert.equal(result.current.calls['channel-1'].channelId, 'channel-1');
        assert.equal(result.current.enabled['channel-1'], true);
    });

    it('loadConfig', async () => {
        const {result} = renderHook(() => State.useCallsState());
        await CallsActions.loadConfig();
        expect(Client.getCallsConfig).toBeCalledWith();
        assert.equal(result.current.config.DefaultEnabled, true);
        assert.equal(result.current.config.AllowEnableCalls, true);
    });

    it('enableChannelCalls', async () => {
        const {result} = renderHook(() => State.useCallsState());
        assert.equal(result.current.enabled['channel-1'], undefined);
        await act(async () => {
            await CallsActions.enableChannelCalls('', 'channel-1');
        });
        expect(Client.enableChannelCalls).toBeCalledWith('channel-1');
        assert.equal(result.current.enabled['channel-1'], true);
    });

    it('disableChannelCalls', async () => {
        const {result} = renderHook(() => State.useCallsState());
        assert.equal(result.current.enabled['channel-1'], undefined);
        await act(async () => {
            await CallsActions.enableChannelCalls('', 'channel-1');
        });
        expect(Client.enableChannelCalls).toBeCalledWith('channel-1');
        expect(Client.disableChannelCalls).not.toBeCalledWith('channel-1');
        assert.equal(result.current.enabled['channel-1'], true);
        await act(async () => {
            await CallsActions.disableChannelCalls('', 'channel-1');
        });
        expect(Client.disableChannelCalls).toBeCalledWith('channel-1');
        assert.equal(result.current.enabled['channel-1'], false);
    });
});
