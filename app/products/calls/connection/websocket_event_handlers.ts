// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DeviceEventEmitter} from 'react-native';

import {
    callStarted, setCallScreenOff,
    setCallScreenOn,
    setChannelEnabled, setRaisedHand,
    setUserMuted,
    userJoinedCall,
    userLeftCall
} from '@app/products/calls/state';
import {WebsocketEvents} from '@constants';

export const handleCallUserDisconnected = (msg: WebSocketMessage) => {
    userLeftCall(msg.broadcast.channel_id, msg.data.userID);
};

export const handleCallUserConnected = (msg: WebSocketMessage) => {
    userJoinedCall(msg.broadcast.channel_id, msg.data.userID);
};

export const handleCallUserMuted = (msg: WebSocketMessage) => {
    setUserMuted(msg.broadcast.channel_id, msg.data.userID, true);
};

export const handleCallUserUnmuted = (msg: WebSocketMessage) => {
    setUserMuted(msg.broadcast.channel_id, msg.data.userID, false);
};

export const handleCallUserVoiceOn = (msg: WebSocketMessage) => {
    DeviceEventEmitter.emit(WebsocketEvents.CALLS_USER_VOICE_ON, {
        channelId: msg.broadcast.channel_id,
        userId: msg.data.userID,
    });
};

export const handleCallUserVoiceOff = (msg: WebSocketMessage) => {
    DeviceEventEmitter.emit(WebsocketEvents.CALLS_USER_VOICE_OFF, {
        channelId: msg.broadcast.channel_id,
        userId: msg.data.userID,
    });
};

export const handleCallStarted = (msg: WebSocketMessage) => {
    callStarted({
        channelId: msg.data.channelID,
        startTime: msg.data.start_at,
        threadId: msg.data.thread_id,
        speakers: [],
        screenOn: '',
        participants: {},
    });
};

export const handleCallChannelEnabled = (msg: WebSocketMessage) => {
    setChannelEnabled(msg.broadcast.channel_id, true);
};

export const handleCallChannelDisabled = (msg: WebSocketMessage) => {
    setChannelEnabled(msg.broadcast.channel_id, false);
};

export const handleCallScreenOn = (msg: WebSocketMessage) => {
    setCallScreenOn(msg.broadcast.channel_id, msg.data.userID);
};

export const handleCallScreenOff = (msg: WebSocketMessage) => {
    setCallScreenOff(msg.broadcast.channel_id);
};

export const handleCallUserRaiseHand = (msg: WebSocketMessage) => {
    setRaisedHand(msg.broadcast.channel_id, msg.data.userID, msg.data.raised_hand);
};

export const handleCallUserUnraiseHand = (msg: WebSocketMessage) => {
    setRaisedHand(msg.broadcast.channel_id, msg.data.userID, msg.data.raised_hand);
};
