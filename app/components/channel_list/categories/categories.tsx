// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {useIntl} from 'react-intl';
import {FlatList, StyleSheet, Text} from 'react-native';

import CategoryBody from './body';
import ChannelListItem from './body/channel';
import LoadCategoriesError from './error';
import CategoryHeader from './header';

import type CategoryModel from '@typings/database/models/servers/category';
import type ChannelModel from '@typings/database/models/servers/channel';

type Props = {
    categories: CategoryModel[];
    unreadChannels: ChannelModel[];
    unreadsOnTop: boolean;
    currentChannelId: string;
    currentUserId: string;
    currentTeamId: string;
}

const styles = StyleSheet.create({
    flex: {

        // flex: 1,
    },
    unreadView: {
        paddingVertical: 5,
    },
});

const extractKey = (item: CategoryModel) => item.id;

const Unreads = ({unreadChannels}: {unreadChannels: ChannelModel[]}) => {
    const renderItem = ({item}: {item: ChannelModel}) => {
        return (
            <ChannelListItem
                channel={item}
                isActive={true}
                collapsed={false}
            />
        );
    };

    return (
        <FlatList
            data={unreadChannels}
            renderItem={renderItem}
            style={styles.unreadView}
        />
    );
};

const Categories = ({categories, currentChannelId, currentUserId, currentTeamId, unreadChannels, unreadsOnTop}: Props) => {
    const intl = useIntl();
    const listRef = useRef<FlatList>(null);

    const unreadChannelIds = useMemo(() => new Set(unreadChannels.map((myC) => myC.id)), [unreadChannels]);

    const renderCategory = useCallback((data: {item: CategoryModel}) => {
        return (
            <>
                <CategoryHeader category={data.item}/>
                <CategoryBody
                    category={data.item}
                    currentChannelId={currentChannelId}
                    currentUserId={currentUserId}
                    locale={intl.locale}
                    unreadChannelIds={unreadChannelIds}
                    unreadsOnTop={unreadsOnTop}
                />
            </>
        );
    }, [categories, currentChannelId, intl.locale]);

    useEffect(() => {
        listRef.current?.scrollToOffset({animated: false, offset: 0});
    }, [currentTeamId]);

    // Sort Categories
    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    if (!categories.length) {
        return <LoadCategoriesError/>;
    }

    return (
        <>
            {unreadsOnTop && unreadChannelIds && <Unreads unreadChannels={unreadChannels}/>}
            <FlatList
                data={categories}
                ref={listRef}
                renderItem={renderCategory}
                style={styles.flex}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={extractKey}
                removeClippedSubviews={true}
                initialNumToRender={5}
                windowSize={15}
                updateCellsBatchingPeriod={10}
                maxToRenderPerBatch={5}
            />
        </>
    );
};

export default Categories;
