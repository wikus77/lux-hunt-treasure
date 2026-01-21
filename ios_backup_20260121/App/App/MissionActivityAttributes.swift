
import Foundation
import ActivityKit

@available(iOS 16.1, *)
struct MissionActivityAttributes: ActivityAttributes {
    public typealias MissionStatus = ContentState
    
    public struct ContentState: Codable, Hashable {
        var timeLeft: Int
        var progress: Double
        var status: String
    }
    
    var missionId: String
}
