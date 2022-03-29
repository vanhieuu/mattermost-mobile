// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Preferences} from '@app/constants';
import {MM_TABLES} from '@app/constants/database';
import {queryPreferencesByCategoryAndName} from '@app/queries/servers/preference';
import {queryCategoriesByTeamIds} from '@queries/servers/categories';
import {observeCurrentChannelId, observeCurrentUserId} from '@queries/servers/system';

import Categories from './categories';

import type {WithDatabaseArgs} from '@typings/database/database';
import type MyChannelModel from '@typings/database/models/servers/my_channel';
import type PreferenceModel from '@typings/database/models/servers/preference';

const {SERVER: {MY_CHANNEL}} = MM_TABLES;

type WithDatabaseProps = {currentTeamId: string } & WithDatabaseArgs

const mapMyChannelToId = (myChannelModels: MyChannelModel[]) => of$(myChannelModels.map((myCm) => myCm.id));

const enhanced = withObservables(
    ['currentTeamId'],
    ({currentTeamId, database}: WithDatabaseProps) => {
        let unreadChannelIds;
        const currentChannelId = observeCurrentChannelId(database);
        const currentUserId = observeCurrentUserId(database);
        const categories = queryCategoriesByTeamIds(database, [currentTeamId]).observeWithColumns(['sort_order']);
        const unreadsOnTop = queryPreferencesByCategoryAndName(database, Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.CHANNEL_SIDEBAR_GROUP_UNREADS).
            observe().
            pipe(
                switchMap((prefs: PreferenceModel[]) => of$(prefs[0] && prefs[0].value === 'true')),
            );

        unreadsOnTop.pipe(switchMap((gU) => {
            if (gU) {
                unreadChannelIds = database.get<MyChannelModel>(MY_CHANNEL).query(
                    Q.where('team_id', Q.eq(currentTeamId)),
                    Q.where('isUnread', Q.eq(true)),
                ).observe().pipe(
                    switchMap(mapMyChannelToId),
                );
            }
            return of$(gU);
        }));

        return {
            unreadChannelIds,
            unreadsOnTop,
            currentChannelId,
            categories,
            currentUserId,
        };
    });

export default withDatabase(enhanced(Categories));
