import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { CATEGORY_LABELS, groupFixtures, SCRATCH, type Fixture } from '../lib/fixtures'

interface SidebarProps {
    fixtures: Fixture[]
    selectedId: string
    /** Ids whose editor source differs from the fixture file. */
    modifiedIds: Set<string>
    onSelect: (id: string) => void
}

export function Sidebar({ fixtures, selectedId, modifiedIds, onSelect }: SidebarProps) {
    const [query, setQuery] = useState('')
    const selectedRef = useRef<HTMLButtonElement | null>(null)

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase()
        const matches = q
            ? fixtures.filter((f) => f.id.toLowerCase().includes(q))
            : fixtures
        return groupFixtures(matches)
    }, [fixtures, query])

    // Keep the selection visible when it changes from the URL or the keyboard.
    useEffect(() => {
        selectedRef.current?.scrollIntoView({ block: 'nearest' })
    }, [selectedId])

    const item = (f: Fixture, label: string) => (
        <Item
            key={f.id}
            ref={f.id === selectedId ? selectedRef : undefined}
            $selected={f.id === selectedId}
            onClick={() => onSelect(f.id)}
            title={f.id}
        >
            <span>{label}</span>
            {modifiedIds.has(f.id) && <Dot title="Edited" />}
        </Item>
    )

    return (
        <Root>
            <Search
                type="search"
                placeholder={`Filter ${fixtures.length} fixtures…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <List>
                {!query && item(SCRATCH, 'Scratch')}
                {groups.map(([category, items]) => (
                    <section key={category}>
                        <GroupLabel>
                            {CATEGORY_LABELS[category] ?? category}
                            <Count>{items.length}</Count>
                        </GroupLabel>
                        {items.map((f) => item(f, f.name.replace(/^Test(?=[A-Z])/, '')))}
                    </section>
                ))}
                {groups.length === 0 && <Empty>No fixtures match “{query}”.</Empty>}
            </List>
        </Root>
    )
}

const Root = styled.nav`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fafafa;
    border-right: 1px solid #e0e0e0;
`

const Search = styled.input`
    margin: 10px;
    height: 30px;
    padding: 0 10px;
    border-radius: 6px;
    border: 1px solid #d0d0d0;
    font-size: 13px;
    background: #ffffff;
    outline: none;

    &:focus {
        border-color: #4a90d9;
    }
`

const List = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 6px 16px;
`

const GroupLabel = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 14px 8px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #888888;
`

const Count = styled.span`
    font-weight: 400;
`

const Item = styled.button<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 5px 8px;
    border: none;
    border-radius: 5px;
    background: ${(p) => (p.$selected ? '#4a90d9' : 'transparent')};
    color: ${(p) => (p.$selected ? '#ffffff' : '#1a1a1a')};
    font-size: 13px;
    text-align: left;
    cursor: pointer;

    &:hover {
        background: ${(p) => (p.$selected ? '#4a90d9' : '#ececec')};
    }
`

const Dot = styled.span`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e8a33d;
    flex: 0 0 auto;
`

const Empty = styled.div`
    padding: 16px 8px;
    font-size: 13px;
    color: #888888;
`
