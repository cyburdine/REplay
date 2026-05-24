import SwiftUI

/// Aurora visualizer — direct port of the Remotion landing-page composition.
/// Two render passes (blurred glow + sharp bars) and a soft top/bottom alpha
/// mask so the bars and reflections dissolve into the surface rather than
/// hard-clipping at the canvas edges.
struct VisualizerView: View {
    @ObservedObject var tap: AudioVisualizerTap

    private static let barTop = Color(red: 1.00, green: 1.00, blue: 1.00).opacity(0.95)
    private static let barMid = Color(red: 0.66, green: 0.88, blue: 1.00).opacity(0.85)
    private static let barLow = Color(red: 0.31, green: 0.39, blue: 1.00).opacity(0.65)
    private static let reflectColor = Color(red: 0.31, green: 0.39, blue: 1.00)

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            Canvas(rendersAsynchronously: true) { ctx, size in
                let bars = layout(for: size, mags: tap.magnitudes, time: t)
                drawGlowLayer(ctx, bars: bars)
                drawSharpBars(ctx, bars: bars)
                drawReflections(ctx, bars: bars, canvasHeight: size.height)
            }
        }
        // Soft top/bottom fade so the visualizer sits "in a void" instead of
        // showing a hard edge where the reflection trails get cut off.
        .mask {
            LinearGradient(
                gradient: Gradient(stops: [
                    .init(color: .clear, location: 0.00),
                    .init(color: .white, location: 0.12),
                    .init(color: .white, location: 0.82),
                    .init(color: .clear, location: 1.00)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }

    // MARK: - Layout

    private struct BarLayout {
        let rect: CGRect
        let corner: CGFloat
    }

    private func layout(for size: CGSize, mags: [Float], time: Double) -> [BarLayout] {
        guard !mags.isEmpty else { return [] }
        let count = mags.count
        let spacing: CGFloat = 3
        let barW = max(2, (size.width - spacing * CGFloat(count - 1)) / CGFloat(count))
        let centerY = size.height / 2
        let minH: CGFloat = max(2, barW * 0.55)

        // ---- Spatial sharpening (unsharp mask) on the spectrum ----
        // Each bar is boosted relative to the mean of its neighbours, so peaks
        // grow taller and valleys grow shorter — gives the spiky "music"
        // silhouette instead of a smooth blob.
        let sharpenAmount: Float = 0.9
        var sharpened = [Float](repeating: 0, count: count)
        for i in 0..<count {
            let l = mags[max(0, i - 1)]
            let r = mags[min(count - 1, i + 1)]
            let neighbourAvg = (l + r) * 0.5
            sharpened[i] = max(0, mags[i] + sharpenAmount * (mags[i] - neighbourAvg))
        }

        var out: [BarLayout] = []
        out.reserveCapacity(count)
        for i in 0..<count {
            let raw = CGFloat(sharpened[i])
            // Mild gamma — preserve contrast, just lift the very quiet stuff.
            let baseAmp = pow(max(0, raw), 0.85)

            // Small per-bar temporal wobble so bars sharing an FFT bucket
            // still visually separate. Scaled by amp so silence stays still.
            let phase = Double(i) * 0.41
            let wobble = sin(time * 3.0 + phase) * 0.04
                       + sin(time * 1.7 + phase * 1.3) * 0.03
            let amp = max(0, baseAmp * (1 + CGFloat(wobble)))

            let h = max(minH, amp * size.height * 0.92)
            let x = CGFloat(i) * (barW + spacing)
            let y = centerY - h / 2
            out.append(BarLayout(
                rect: CGRect(x: x, y: y, width: barW, height: h),
                corner: min(barW / 2, 2)
            ))
        }
        return out
    }

    // MARK: - Render passes

    private func drawGlowLayer(_ ctx: GraphicsContext, bars: [BarLayout]) {
        ctx.drawLayer { layer in
            layer.addFilter(.blur(radius: 4))
            for b in bars {
                let path = Path(roundedRect: b.rect,
                                cornerSize: CGSize(width: b.corner, height: b.corner))
                layer.fill(path, with: .linearGradient(
                    Gradient(stops: [
                        .init(color: Self.barTop, location: 0.0),
                        .init(color: Self.barMid, location: 0.55),
                        .init(color: Self.barLow, location: 1.0)
                    ]),
                    startPoint: CGPoint(x: 0, y: b.rect.minY),
                    endPoint: CGPoint(x: 0, y: b.rect.maxY)
                ))
            }
        }
    }

    private func drawSharpBars(_ ctx: GraphicsContext, bars: [BarLayout]) {
        for b in bars {
            let path = Path(roundedRect: b.rect,
                            cornerSize: CGSize(width: b.corner, height: b.corner))
            ctx.fill(path, with: .linearGradient(
                Gradient(stops: [
                    .init(color: Self.barTop, location: 0.0),
                    .init(color: Self.barMid, location: 0.55),
                    .init(color: Self.barLow, location: 1.0)
                ]),
                startPoint: CGPoint(x: 0, y: b.rect.minY),
                endPoint: CGPoint(x: 0, y: b.rect.maxY)
            ))
        }
    }

    /// Reflection clamps to the canvas bottom — combined with the alpha mask
    /// it fades into nothing well before any hard edge.
    private func drawReflections(_ ctx: GraphicsContext, bars: [BarLayout], canvasHeight: CGFloat) {
        for b in bars {
            let desiredH = b.rect.height * 0.35
            let maxH = max(0, canvasHeight - b.rect.maxY)
            let h = min(desiredH, maxH)
            if h < 1 { continue }
            let rect = CGRect(x: b.rect.minX, y: b.rect.maxY,
                              width: b.rect.width, height: h)
            let path = Path(roundedRect: rect,
                            cornerSize: CGSize(width: b.corner, height: b.corner))
            ctx.fill(path, with: .linearGradient(
                Gradient(stops: [
                    .init(color: Self.reflectColor.opacity(0.35), location: 0.0),
                    .init(color: Self.reflectColor.opacity(0.0), location: 1.0)
                ]),
                startPoint: CGPoint(x: 0, y: rect.minY),
                endPoint: CGPoint(x: 0, y: rect.maxY)
            ))
        }
    }
}
