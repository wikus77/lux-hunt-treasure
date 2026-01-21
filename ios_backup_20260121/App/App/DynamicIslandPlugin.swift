
import Foundation
import Capacitor
import ActivityKit
import WidgetKit

@objc(DynamicIslandPlugin)
public class DynamicIslandPlugin: CAPPlugin {
    private var currentActivity: Activity<MissionActivityAttributes>?
    
    @objc func startActivity(_ call: CAPPluginCall) {
        guard let type = call.getString("type"),
              let data = call.getObject("data"),
              let missionId = data["missionId"] as? String,
              let timeLeft = data["timeLeft"] as? Int,
              let progress = data["progress"] as? Double else {
            call.reject("Missing required parameters")
            return
        }
        
        let status = data["status"] as? String ?? "active"
        
        if #available(iOS 16.1, *) {
            let attributes = MissionActivityAttributes(missionId: missionId)
            let initialContentState = MissionActivityAttributes.ContentState(
                timeLeft: timeLeft,
                progress: progress,
                status: status
            )
            
            do {
                let activity = try Activity<MissionActivityAttributes>.request(
                    attributes: attributes,
                    contentState: initialContentState,
                    pushType: nil
                )
                
                self.currentActivity = activity
                call.resolve(["success": true])
            } catch {
                call.reject("Failed to start activity: \(error.localizedDescription)")
            }
        } else {
            call.reject("ActivityKit requires iOS 16.1 or later")
        }
    }
    
    @objc func updateActivity(_ call: CAPPluginCall) {
        guard let data = call.getObject("data"),
              let timeLeft = data["timeLeft"] as? Int,
              let progress = data["progress"] as? Double else {
            call.reject("Missing required parameters")
            return
        }
        
        let status = data["status"] as? String ?? "active"
        
        if #available(iOS 16.1, *) {
            guard let activity = currentActivity else {
                call.reject("No active activity found")
                return
            }
            
            let updatedContentState = MissionActivityAttributes.ContentState(
                timeLeft: timeLeft,
                progress: progress,
                status: status
            )
            
            Task {
                await activity.update(using: updatedContentState)
                call.resolve(["success": true])
            }
        } else {
            call.reject("ActivityKit requires iOS 16.1 or later")
        }
    }
    
    @objc func endActivity(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            guard let activity = currentActivity else {
                call.reject("No active activity found")
                return
            }
            
            Task {
                await activity.end(dismissalPolicy: .immediate)
                self.currentActivity = nil
                call.resolve(["success": true])
            }
        } else {
            call.reject("ActivityKit requires iOS 16.1 or later")
        }
    }
}
