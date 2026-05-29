import React, { useState, useEffect } from 'react';
import { LayoutMeasurement, layoutRegistry } from '../Layout';

export function EmptyView() {
    return null
}

const sizeThatFits = ({ proposal, props, children }) : LayoutMeasurement => {
    return {
        frame: {
            width: 0,
            height: 0
        }
    };
}

layoutRegistry.register(
    EmptyView,
    sizeThatFits
);