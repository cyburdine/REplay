import SwiftUI

struct SplashView: View {
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.black)
                .ignoresSafeArea()

            Image("Wordmark")
                .resizable()
                .interpolation(.high)
                .aspectRatio(contentMode: .fit)
                .frame(width: 360)
                .opacity(opacity)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.45)) { opacity = 1 }
        }
    }
}

#Preview { SplashView() }
