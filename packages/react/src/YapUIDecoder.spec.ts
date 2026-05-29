import { describe, expect, it } from 'vitest';
import { shouldApplyChartModifierContext } from './YapUIDecoderChartScope';

describe('YapUIDecoder chart modifier scoping', () => {
    it('only applies chart root modifier context to chart roots', () => {
        expect(shouldApplyChartModifierContext('accessibilityLabel', {
            type: 'ModifiedComponent',
            props: {
                content: [{ type: 'Chart', props: { children: [] } }],
            },
        })).toBe(true);

        expect(shouldApplyChartModifierContext('accessibilityLabel', {
            type: 'ModifiedComponent',
            props: {
                content: [{ type: 'Text', props: { rawValue: 'Name' } }],
            },
        })).toBe(false);
    });

    it('does not apply mark-only chart modifier context outside retained chart trees', () => {
        expect(shouldApplyChartModifierContext('symbol', {
            type: 'ModifiedComponent',
            props: {
                content: [{ type: 'PointMark', props: { x: { value: 'Jan' }, y: { value: 12 } } }],
            },
        })).toBe(false);

        expect(shouldApplyChartModifierContext('frame', {
            type: 'ModifiedComponent',
            props: {
                content: [{ type: 'Text', props: { rawValue: 'Name' } }],
            },
        })).toBe(true);
    });
});
