
import WidgetKit
import SwiftUI
import ActivityKit

@available(iOS 16.1, *)
struct MissionActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MissionActivityAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("M1SSION™")
                    .font(.headline)
                    .foregroundColor(.cyan)
                
                HStack {
                    Text("Time Left:")
                    Text("\(formatTime(context.state.timeLeft))")
                        .font(.monospaced(.body)())
                }
                
                ProgressView(value: context.state.progress)
                    .progressViewStyle(LinearProgressViewStyle(tint: .cyan))
                
                Text("Status: \(context.state.status)")
                    .font(.caption)
            }
            .padding()
            .background(Color.black.opacity(0.8))
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here
                DynamicIslandExpandedRegion(.leading) {
                    Text("M1™")
                        .font(.caption)
                        .foregroundColor(.cyan)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(formatTime(context.state.timeLeft))")
                        .font(.caption)
                        .foregroundColor(.white)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        ProgressView(value: context.state.progress)
                            .progressViewStyle(LinearProgressViewStyle(tint: .cyan))
                        Text("\(Int(context.state.progress * 100))%")
                            .font(.caption2)
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal)
                }
            } compactLeading: {
                Text("M1")
                    .font(.caption2)
                    .foregroundColor(.cyan)
            } compactTrailing: {
                Text("\(formatTime(context.state.timeLeft))")
                    .font(.caption2)
                    .foregroundColor(.white)
            } minimal: {
                Text("M1")
                    .font(.caption2)
                    .foregroundColor(.cyan)
            }
        }
    }
    
    private func formatTime(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        let secs = seconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, secs)
        } else {
            return String(format: "%02d:%02d", minutes, secs)
        }
    }
}

@main
struct MissionWidgetBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 16.1, *) {
            MissionActivityWidget()
        }
    }
}
