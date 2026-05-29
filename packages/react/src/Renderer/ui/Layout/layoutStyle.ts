import { LayoutMeasurement } from "./LayoutTypes"
import { px } from "../../Utils";
import React from "react";

/**
 * Converts layout measurement to css style.
 */
export function layoutStyle(measurement: LayoutMeasurement | null): React.CSSProperties  {
    if (!measurement) {
        return {};
    }

    const size = measurement.frame;

    const style : React.CSSProperties= {};

    var width = size.width
    var height = size.height
    var minWidth = size.minWidth
    var minHeight = size.minHeight
    var maxHeight = size.maxHeight
    var maxWidth = size.maxWidth
    var alignment = size.alignment

    // If child requests Infinity width, set the style to fill available
    if (width != null) {
        if (Number.isFinite(width) == false) {
            style['width'] = '100%';
        } else if (width != null && width > 0) {
            style['width'] = px(width)
            style['minWidth'] = px(width); 
        }
    }

    // If child requests Infinity height, set the style to fill available
    if (height != null) {
        if (Number.isFinite(height) == false) {
            style['height'] = '100%';
        } else if (height != null && height > 0) {
            style['height'] = px(height);
            style['minHeight'] = px(height); // Chrome   
        }
    }

    if (minWidth) {
        style['minWidth'] = px(minWidth)
    }
    if (minHeight) {
        style['minHeight'] = px(minHeight)
    }
    if (maxWidth) {
        style['maxWidth'] = px(maxWidth)
    }
    if (maxHeight) {
        style['maxHeight'] = px(maxHeight)
    }

    if (alignment) {
        switch (alignment) {
            case 'leading':
                style.alignItems = 'flex-start';
                break;
            case 'trailing':
                style.alignItems = 'flex-end';
                break;
            case 'center':
                style.alignItems = 'center';
                break;
            case 'top':
                style.justifyContent = 'flex-start';
                break;
            case 'bottom':
                style.justifyContent = 'flex-end';
                break;
            case 'center':
                style.justifyContent = 'center';
        }
    }
    return style
}