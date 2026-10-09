const metadata = {
    title: "DoomFace",
    description: "A 40x56 pixel-art Doom marine face built from rows of tiny filled Rectangles in zero-spacing HStacks (grey helmet, tan skin, dark eyes and mouth, red blood streaks), scaled up 4x with scaleEffect so it reads as a chunky ~160x224 pixel portrait."
};

const body = () => {
    return (
        VStack({ spacing: 0 }, [
            // Helmet top
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 8, height: 8 }),
                Rectangle().fill(Color("#6A6A6A")).frame({ width: 24, height: 8 }),
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 8, height: 8 })
            ]),
            // Upper helmet/forehead with blood
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 8 }),
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 8, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 4, height: 8 }), // Blood streak
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 16, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 4, height: 8 }), // Blood streak
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 8 })
            ]),
            // Eyes area with blood
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 2, height: 8 }), // Blood drip
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 2, height: 8 }),
                Rectangle().fill(Color("#2A2A2A")).frame({ width: 6, height: 8 }), // Left eye
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 6, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 2, height: 8 }), // Blood between eyes
                Rectangle().fill(Color("#2A2A2A")).frame({ width: 6, height: 8 }), // Right eye
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 4, height: 8 }),
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 8 })
            ]),
            // Nose area with blood
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 6 }),
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 6, height: 6 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 2, height: 6 }), // Blood on nose
                Rectangle().fill(Color("#6A4A3A")).frame({ width: 4, height: 6 }), // Nose
                Rectangle().fill(Color("#8B0000")).frame({ width: 2, height: 6 }), // Blood on nose
                Rectangle().fill(Color("#6A4A3A")).frame({ width: 2, height: 6 }), // Nose
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 12, height: 6 }),
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 6 })
            ]),
            // Mouth area with blood
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 8 }),
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 4, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 2, height: 8 }), // Blood drip from nose
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 2, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 4, height: 8 }), // Bloody mouth
                Rectangle().fill(Color("#2A1A1A")).frame({ width: 8, height: 8 }), // Mouth opening
                Rectangle().fill(Color("#8B0000")).frame({ width: 4, height: 8 }), // Bloody mouth
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 8, height: 8 }),
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 4, height: 8 })
            ]),
            // Chin/jaw with blood
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 6, height: 8 }),
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 8, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 4, height: 8 }), // Blood on chin
                Rectangle().fill(Color("#8A6A4A")).frame({ width: 12, height: 8 }),
                Rectangle().fill(Color("#8B0000")).frame({ width: 4, height: 8 }), // Blood on chin
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 6, height: 8 })
            ]),
            // Bottom helmet
            HStack({ spacing: 0 }, [
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 8, height: 6 }),
                Rectangle().fill(Color("#6A6A6A")).frame({ width: 24, height: 6 }),
                Rectangle().fill(Color("#4A4A4A")).frame({ width: 8, height: 6 })
            ])
        ])
            .frame({ width: 40, height: 56 })
            .scaleEffect(4) // Scale up so the pixel art reads at a glance
    );
};

export default defineComponent({ metadata, body });
