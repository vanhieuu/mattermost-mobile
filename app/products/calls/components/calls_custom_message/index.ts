// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {CallsCustomMessage} from '@app/products/calls/components/calls_custom_message/calls_custom_message';
import {Preferences} from '@constants';
import {getPreferenceAsBool} from '@helpers/api/preference';
import {observeChannel, observeCurrentChannel} from '@queries/servers/channel';
import {queryPreferencesByCategoryAndName} from '@queries/servers/preference';
import {observeCurrentUser, observeTeammateNameDisplay} from '@queries/servers/user';
import {WithDatabaseArgs} from '@typings/database/database';

import type PostModel from '@typings/database/models/servers/post';

const enhanced = withObservables(['post'], ({post, database}: { post: PostModel } & WithDatabaseArgs) => ({
    currentUser: observeCurrentUser(database),
    author: post.author.observe(),
    isMilitaryTime: queryPreferencesByCategoryAndName(database, Preferences.CATEGORY_DISPLAY_SETTINGS).observe().pipe(
        switchMap(
            (preferences) => of$(getPreferenceAsBool(preferences, Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time', false)),
        ),
    ),
    teammateNameDisplay: observeTeammateNameDisplay(database),
    currentChannelName: observeCurrentChannel(database).pipe(
        switchMap((c) => of$(c?.displayName || '')),
    ),
    callChannelName: observeChannel(database, post.channelId).pipe(
        switchMap((c) => of$(c?.displayName || '')),
    ),
}));

export default withDatabase(enhanced(CallsCustomMessage));
