// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {BehaviorSubject} from 'rxjs';

import {CallsState, DefaultCallsState} from '@app/products/calls/types/calls';

// Only exported for tests, not exported outside this module.
export let subject: BehaviorSubject<CallsState> | null = null;

// Only exported for tests, not exported outside this module.
export const setState = (state: CallsState) => {
    subject?.next(state);
};

export const useCallsState = () => {
    const [callsState, setCallsState] = useState({} as CallsState);

    if (!subject) {
        subject = new BehaviorSubject(DefaultCallsState);
    }

    useEffect(() => {
        const subscription = subject?.subscribe((state) => {
            setCallsState(state);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return callsState;
};
