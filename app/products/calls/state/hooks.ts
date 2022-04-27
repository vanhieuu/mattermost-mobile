// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {BehaviorSubject} from 'rxjs';

import {CallsState, DefaultCallsState} from '@app/products/calls/types/calls';

// Only exported for tests, not exported from the module index.
export const subject = new BehaviorSubject(DefaultCallsState);

// Only exported for tests, not exported from the module index.
export const setState = (state: CallsState) => {
    subject.next(state);
};

export const getState = () => {
    return subject.value;
};

export const useCallsState = () => {
    const [callsState, setCallsState] = useState(DefaultCallsState);

    useEffect(() => {
        const subscription = subject.subscribe((state) => {
            setCallsState(state);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return callsState;
};
