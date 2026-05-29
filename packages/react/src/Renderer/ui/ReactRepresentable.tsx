import React, { useState, useEffect, createContext, useContext } from 'react';

export function ReactRepresentable({ rawValue, value }) {
    let v = rawValue ?? value
    return v
}