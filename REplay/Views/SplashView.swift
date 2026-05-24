import SwiftUI

struct SplashView: View {
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.regularMaterial)
                .ignoresSafeArea()

            VStack(spacing: 18) {
                Image(systemName: "play.fill")
                    .font(.system(size: 56, weight: .medium))
                    .padding(28)
                    .background(
                        RoundedRectangle(cornerRadius: 26, style: .continuous)
                            .fill(.tint.opacity(0.18))
                    )
                    .foregroundStyle(.tint)

                Text("RE:play")
                    .font(.system(size: 38, weight: .semibold, design: .default))
                    .kerning(-0.5)
                    .foregroundStyle(.primary)
            }
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.45)) { opacity = 1 }
        }
    }
}

#Preview { SplashView() }
