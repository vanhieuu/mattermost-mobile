// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {subject} from '@app/products/calls/state/hooks';
import {Call, DefaultCallsState, ServerConfig} from '@app/products/calls/types/calls';

export const setCalls = (calls: Dictionary<Call>, enabled: Dictionary<boolean>) => {
    const callsState = subject?.value || DefaultCallsState;
    subject?.next({...callsState, calls, enabled});
};

export const userJoinedCall = (channelId: string, userId: string, profile: UserProfile) => {
    const callsState = subject?.value || DefaultCallsState;
    if (!callsState.calls[channelId]) {
        return;
    }

    const nextChannel = {
        ...callsState.calls[channelId],
        participants: {...callsState.calls[channelId].participants},
    };
    nextChannel.participants[userId] = {
        id: userId,
        muted: true,
        isTalking: false,
        raisedHand: 0,
        profile,
    };
    const nextCalls = {...callsState.calls, [channelId]: nextChannel};

    subject?.next({...callsState, calls: nextCalls});
};

export const userLeftCall = (channelId: string, userId: string) => {
    const callsState = subject?.value || DefaultCallsState;
    if (!callsState.calls[channelId]?.participants[userId]) {
        return;
    }

    const nextChannel = {
        ...callsState.calls[channelId],
        participants: {...callsState.calls[channelId].participants},
    };
    delete nextChannel.participants[userId];
    const nextCalls = {...callsState.calls};
    if (Object.keys(nextChannel.participants).length === 0) {
        delete nextCalls[channelId];
    } else {
        nextCalls[channelId] = nextChannel;
    }

    subject?.next({...callsState, calls: nextCalls});
};

export const myselfJoinedCall = (channelId: string) => {
    const callsState = subject?.value || DefaultCallsState;
    subject?.next({...callsState, joined: channelId, screenShareURL: ''});
};

export const myselfLeftCall = () => {
    const callsState = subject?.value || DefaultCallsState;
    subject?.next({...callsState, joined: '', screenShareURL: ''});
};

export const callStarted = (call: Call) => {
    const callsState = subject?.value || DefaultCallsState;
    const nextCalls = {...callsState.calls};
    nextCalls[call.channelId] = call;
    subject?.next({...callsState, calls: nextCalls});
};

export const callFinished = (call: Call) => {
    const callsState = subject?.value || DefaultCallsState;
    const nextCalls = {...callsState.calls};
    delete nextCalls[call.channelId];
    subject?.next({...callsState, calls: nextCalls});
};

export const setUserMuted = (channelId: string, userId: string, muted: boolean) => {
    const callsState = subject?.value || DefaultCallsState;
    if (!callsState.calls[channelId] || !callsState.calls[channelId].participants[userId]) {
        return;
    }

    const nextUser = {...callsState.calls[channelId].participants[userId], muted};
    const nextChannel = {
        ...callsState.calls[channelId],
        participants: {...callsState.calls[channelId].participants},
    };
    nextChannel.participants[userId] = nextUser;
    const nextCalls = {...callsState.calls};
    nextCalls[channelId] = nextChannel;
    subject?.next({...callsState, calls: nextCalls});
};

export const setRaisedHand = (channelId: string, userId: string, timestamp: number) => {
    const callsState = subject?.value || DefaultCallsState;
    if (!callsState.calls[channelId] || !callsState.calls[channelId].participants[userId]) {
        return;
    }

    const nextUser = {...callsState.calls[channelId].participants[userId], raisedHand: timestamp};
    const nextChannel = {
        ...callsState.calls[channelId],
        participants: {...callsState.calls[channelId].participants},
    };
    nextChannel.participants[userId] = nextUser;
    const nextCalls = {...callsState.calls};
    nextCalls[channelId] = nextChannel;
    subject?.next({...callsState, calls: nextCalls});
};

export const setCallScreenOn = (channelId: string, userId: string) => {
    const callsState = subject?.value || DefaultCallsState;
    if (!callsState.calls[channelId] || !callsState.calls[channelId].participants[userId]) {
        return;
    }

    const nextChannel = {...callsState.calls[channelId], screenOn: userId};
    const nextCalls = {...callsState.calls};
    nextCalls[channelId] = nextChannel;
    subject?.next({...callsState, calls: nextCalls});
};

export const setCallScreenOff = (channelId: string) => {
    const callsState = subject?.value || DefaultCallsState;
    if (!callsState.calls[channelId]) {
        return;
    }

    const nextChannel = {...callsState.calls[channelId], screenOn: ''};
    const nextCalls = {...callsState.calls};
    nextCalls[channelId] = nextChannel;
    subject?.next({...callsState, calls: nextCalls});
};

export const setChannelEnabled = (channelId: string, enabled: boolean) => {
    const callsState = subject?.value || DefaultCallsState;
    const nextEnabled = {...callsState.enabled};
    nextEnabled[channelId] = enabled;
    subject?.next({...callsState, enabled: nextEnabled});
};

export const setScreenShareURL = (url: string) => {
    const callsState = subject?.value || DefaultCallsState;
    subject?.next({...callsState, screenShareURL: url});
};

export const setSpeakerPhoneOn = (speakerphoneOn: boolean) => {
    const callsState = subject?.value || DefaultCallsState;
    subject?.next({...callsState, speakerphoneOn});
};

export const setConfig = (config: ServerConfig) => {
    const callsState = subject?.value || DefaultCallsState;
    subject?.next({...callsState, config});
};
