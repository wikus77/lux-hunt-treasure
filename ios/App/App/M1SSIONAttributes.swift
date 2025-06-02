
import ActivityKit
import Foundation

struct M1SSIONAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var progress: Int
        var timeLeft: Int
        var lastUpdated: Date
        
        // Computed property for progress percentage
        var progressPercentage: Double {
            return Double(progress) / 100.0
        }
        
        // Computed property for time display
        var timeDisplay: String {
            let hours = timeLeft / 3600
            let minutes = (timeLeft % 3600) / 60
            
            if hours > 0 {
                return "\(hours)h \(minutes)m"
            } else {
                return "\(minutes)m"
            }
        }
    }
    
    var missionId: String
    
    // Display name for the activity
    var displayName: String {
        return "M1SSION™"
    }
}
