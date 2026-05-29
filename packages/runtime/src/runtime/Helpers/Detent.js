export const Detent = {
    medium: { detentType: 'medium' },
    large: { detentType: 'large' },
    fraction: (value) => ({ detentType: 'fraction', value }),
    height: (value) => ({ detentType: 'height', value }),
}